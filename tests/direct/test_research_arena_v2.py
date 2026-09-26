import json
from datetime import datetime, timedelta, timezone


QUESTION = "Which research report best proves the requested claim with current public evidence?"
RUBRIC = "Prefer direct, authoritative, independent evidence and reject unsupported or contradictory claims."


def future_deadline(seconds=7200):
    return int((datetime.now(timezone.utc) + timedelta(seconds=seconds)).timestamp())


def create_bounty(direct_vm, contract, creator, bounty_id="bounty-v2", reward=1000):
    direct_vm.sender = creator
    direct_vm.value = reward
    contract.create_bounty(
        bounty_id,
        QUESTION,
        RUBRIC,
        future_deadline(),
        2,
    )
    direct_vm.value = 0


def add_two_submissions(
    direct_vm,
    contract,
    bob,
    charlie,
    bounty_id="bounty-v2",
):
    direct_vm.sender = bob
    contract.submit_research(
        bounty_id,
        "primary",
        "https://report-a.example/research",
        "https://authority.example/evidence",
        "https://standard.example/corroboration",
    )
    direct_vm.sender = charlie
    contract.submit_research(
        bounty_id,
        "runner",
        "https://report-b.example/research",
        "https://generic-a.example/page",
        "https://generic-b.example/page",
    )


def mock_available_evidence(direct_vm, authority_body="Authoritative source explicitly confirms the primary report."):
    direct_vm.mock_web(
        r".*report-a\.example.*",
        {"status": 200, "body": "Primary report directly answers the question with cited evidence."},
    )
    direct_vm.mock_web(
        r".*authority\.example.*",
        {"status": 200, "body": authority_body},
    )
    direct_vm.mock_web(
        r".*standard\.example.*",
        {"status": 200, "body": "Independent source corroborates the primary report."},
    )
    direct_vm.mock_web(
        r".*report-b\.example.*",
        {"status": 200, "body": "Runner report makes a broad unsupported claim."},
    )
    direct_vm.mock_web(
        r".*generic-a\.example.*",
        {"status": 200, "body": "Generic page without direct evidence."},
    )
    direct_vm.mock_web(
        r".*generic-b\.example.*",
        {"status": 200, "body": "Another generic page without direct evidence."},
    )


def mock_winner(
    direct_vm,
    score=96,
    runner=35,
    reason="INDEPENDENT_CORROBORATION",
    winner_id="primary",
    pattern=r"(?s).*neutral settlement judge for a competitive research market.*",
):
    direct_vm.mock_llm(
        pattern,
        json.dumps(
            {
                "winner_id": winner_id,
                "winner_score": score,
                "runner_up_score": runner,
                "reason_code": reason,
            }
        ),
    )


def resolve_primary(direct_vm, contract, creator, bounty_id="bounty-v2"):
    direct_vm.sender = creator
    contract.close_bounty(bounty_id)
    mock_available_evidence(direct_vm)
    mock_winner(
        direct_vm,
        pattern=r"(?s).*CHALLENGE CONTEXT:\s*No active challenge\..*",
    )
    contract.resolve_bounty(bounty_id)


def test_v2_create_program_phases_and_lock_second(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    d1 = future_deadline(3600)
    d2 = future_deadline(7200)

    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    contract.create_program_phase(
        "program-1", "phase-1", "", QUESTION, RUBRIC, d1, 2
    )
    direct_vm.value = 2000
    contract.create_program_phase(
        "program-1", "phase-2", "phase-1", QUESTION, RUBRIC, d2, 2
    )
    direct_vm.value = 0

    assert contract.get_program_phase_count("program-1") == 2
    assert contract.get_program_phase_id("program-1", 0) == "phase-1"
    assert contract.get_program_phase_id("program-1", 1) == "phase-2"
    assert contract.is_phase_unlocked("phase-1") is True
    assert contract.is_phase_unlocked("phase-2") is False


def test_v2_rejects_wrong_program_prerequisite(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    contract.create_program_phase(
        "program-2", "phase-a", "", QUESTION, RUBRIC, future_deadline(3600), 2
    )
    with direct_vm.expect_revert("previous program phase"):
        contract.create_program_phase(
            "program-2",
            "phase-b",
            "not-phase-a",
            QUESTION,
            RUBRIC,
            future_deadline(7200),
            2,
        )


def test_v2_locked_phase_rejects_submission(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    contract.create_program_phase(
        "program-3", "phase-1", "", QUESTION, RUBRIC, future_deadline(3600), 2
    )
    contract.create_program_phase(
        "program-3",
        "phase-2",
        "phase-1",
        QUESTION,
        RUBRIC,
        future_deadline(7200),
        2,
    )
    direct_vm.value = 0

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("must be PAID"):
        contract.submit_research(
            "phase-2",
            "early",
            "https://report.example/x",
            "https://source-a.example/x",
            "https://source-b.example/x",
        )


def test_v2_requires_three_distinct_urls(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("must be distinct"):
        contract.submit_research(
            "bounty-v2",
            "dup",
            "https://same.example/report",
            "https://same.example/report",
            "https://other.example/source",
        )


def test_v2_resolution_stores_evidence_snapshots(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    bounty = contract.get_bounty("bounty-v2")
    assert bounty.status == "RESOLVED"
    assert bounty.winner_submission_id == "primary"
    assert bounty.winning_score == 96
    assert bounty.runner_up_score == 35
    assert bounty.reason_code == "INDEPENDENT_CORROBORATION"
    assert bounty.initial_recorded is True
    assert bounty.initial_winner_submission_id == "primary"
    assert bounty.initial_winning_score == 96
    assert bounty.initial_reason_code == "INDEPENDENT_CORROBORATION"
    assert bounty.resolution_round == 1
    assert "Primary report" in bounty.initial_report_snapshot
    assert "Primary report" in bounty.winner_report_snapshot
    assert "Authoritative source" in bounty.winner_source_1_snapshot
    assert "Independent source" in bounty.winner_source_2_snapshot
    assert bounty.policy_version == "RA_V2_RESEARCH_PROGRAMS"


def test_v2_below_threshold_produces_no_winner_and_refund(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice, reward=1700)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    mock_available_evidence(direct_vm)
    mock_winner(direct_vm, score=62, runner=58, reason="RUBRIC_FIT")
    contract.resolve_bounty("bounty-v2")

    bounty = contract.get_bounty("bounty-v2")
    assert bounty.status == "REJECTED"
    assert bounty.winner_submission_id == ""
    assert bounty.reason_code == "EVIDENCE_GAP"

    direct_vm.deal(direct_vm._contract_address, 1700)
    refunded = contract.refund_rejected("bounty-v2")
    assert refunded == 1700
    assert contract.get_bounty("bounty-v2").status == "REFUNDED"


def test_v2_unavailable_winner_evidence_fails_closed(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    mock_available_evidence(direct_vm, authority_body="")
    mock_winner(direct_vm)
    contract.resolve_bounty("bounty-v2")

    bounty = contract.get_bounty("bounty-v2")
    assert bounty.status == "REJECTED"
    assert bounty.reason_code == "SOURCE_UNAVAILABLE"


def test_v2_participant_can_challenge_and_claim_is_blocked(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_charlie
    contract.challenge_resolution(
        "bounty-v2",
        "The evidence should be re-fetched because the result is disputed.",
    )
    assert contract.get_bounty("bounty-v2").status == "CHALLENGED"

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("not resolved"):
        contract.claim_reward("bounty-v2")

    challenger = contract.get_researcher_stats("0x" + direct_charlie.hex())
    assert challenger.challenges_raised == 1


def test_v2_outsider_cannot_challenge(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie, direct_owner
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_owner
    with direct_vm.expect_revert("participating researcher"):
        contract.challenge_resolution(
            "bounty-v2",
            "I am not a participant and should not be allowed to challenge.",
        )


def test_v2_challenge_can_be_resolved_only_once(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_alice
    contract.challenge_resolution(
        "bounty-v2",
        "Sponsor requests one fresh consensus pass before economic settlement.",
    )
    mock_available_evidence(direct_vm)
    mock_winner(direct_vm)
    contract.resolve_challenge("bounty-v2")
    assert contract.get_bounty("bounty-v2").status == "RESOLVED"

    with direct_vm.expect_revert("Maximum challenge count"):
        contract.challenge_resolution(
            "bounty-v2",
            "A second challenge must be rejected by the one-shot challenge rule.",
        )


def test_v2_claim_updates_researcher_stats(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice, reward=2400)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.deal(direct_vm._contract_address, 2400)
    direct_vm.sender = direct_bob
    claimed = contract.claim_reward("bounty-v2")
    assert claimed == 2400
    assert contract.get_bounty("bounty-v2").status == "PAID"

    stats = contract.get_researcher_stats("0x" + direct_bob.hex())
    assert stats.submissions == 1
    assert stats.wins == 1
    assert stats.paid_wins == 1
    assert stats.total_earned == 2400


def test_v2_program_progress_aggregates_settlement(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1100
    contract.create_program_phase(
        "program-progress",
        "phase-one",
        "",
        QUESTION,
        RUBRIC,
        future_deadline(3600),
        2,
    )
    direct_vm.value = 1300
    contract.create_program_phase(
        "program-progress",
        "phase-two",
        "phase-one",
        QUESTION,
        RUBRIC,
        future_deadline(7200),
        2,
    )
    direct_vm.value = 0

    add_two_submissions(
        direct_vm, contract, direct_bob, direct_charlie, "phase-one"
    )
    resolve_primary(
        direct_vm, contract, direct_alice, "phase-one"
    )
    direct_vm.deal(direct_vm._contract_address, 2400)
    direct_vm.sender = direct_bob
    contract.claim_reward("phase-one")

    progress = contract.get_program_progress("program-progress")
    assert progress.total_phases == 2
    assert progress.paid_phases == 1
    assert progress.open_phases == 1
    assert progress.total_reward == 2400
    assert progress.settled_reward == 1100
    assert contract.is_phase_unlocked("phase-two") is True


def test_v2_stalled_recovery_uses_state_transition_time(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    bounty = contract.get_bounty("bounty-v2")
    assert int(bounty.closed_at) > 0

    with direct_vm.expect_revert("grace period"):
        contract.recover_stalled_bounty("bounty-v2")


def test_v2_challenge_records_fresh_stalled_timestamp(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_charlie
    contract.challenge_resolution(
        "bounty-v2",
        "The live evidence should be re-fetched before any economic settlement.",
    )
    bounty = contract.get_bounty("bounty-v2")
    assert bounty.status == "CHALLENGED"
    assert int(bounty.challenged_at) > 0

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("grace period"):
        contract.recover_stalled_bounty("bounty-v2")


def test_v2_challenge_preserves_initial_verdict_and_records_new_round(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_charlie
    contract.challenge_resolution(
        "bounty-v2",
        "The runner evidence should be freshly checked against the same precommitted rubric.",
    )

    mock_available_evidence(direct_vm)
    mock_winner(
        direct_vm,
        score=91,
        runner=86,
        reason="RUBRIC_FIT",
        winner_id="runner",
    )
    contract.resolve_challenge("bounty-v2")

    bounty = contract.get_bounty("bounty-v2")
    assert bounty.status == "RESOLVED"
    assert bounty.resolution_round == 2

    # Round one remains immutable for an auditable appeal diff.
    assert bounty.initial_winner_submission_id == "primary"
    assert bounty.initial_winning_score == 96
    assert bounty.initial_reason_code == "INDEPENDENT_CORROBORATION"
    assert "Primary report" in bounty.initial_report_snapshot

    # The current settlement state reflects the fresh consensus round.
    assert bounty.winner_submission_id == "runner"
    assert bounty.winning_score == 91
    assert bounty.reason_code == "RUBRIC_FIT"
    assert "Runner report" in bounty.winner_report_snapshot
    assert bounty.challenge_note == (
        "The runner evidence should be freshly checked against the same precommitted rubric."
    )


def test_v2_nonwinner_cannot_claim(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice, reward=1800)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.deal(direct_vm._contract_address, 1800)
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("Only the winning researcher can claim"):
        contract.claim_reward("bounty-v2")


def test_v2_noncreator_cannot_refund_rejected(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice, reward=1900)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    mock_available_evidence(direct_vm)
    mock_winner(direct_vm, score=60, runner=50, reason="EVIDENCE_GAP")
    contract.resolve_bounty("bounty-v2")

    direct_vm.deal(direct_vm._contract_address, 1900)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the bounty creator can refund"):
        contract.refund_rejected("bounty-v2")


def test_v2_settled_bounty_cannot_be_challenged(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice, reward=2000)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)
    resolve_primary(direct_vm, contract, direct_alice)

    direct_vm.deal(direct_vm._contract_address, 2000)
    direct_vm.sender = direct_bob
    contract.claim_reward("bounty-v2")

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("Only an unsettled resolution can be challenged"):
        contract.challenge_resolution(
            "bounty-v2",
            "A settled bounty must not reopen through the challenge entrypoint.",
        )


def test_v2_program_rejects_different_sponsor_for_later_phase(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    contract.create_program_phase(
        "program-sponsor",
        "phase-one",
        "",
        QUESTION,
        RUBRIC,
        future_deadline(3600),
        2,
    )

    direct_vm.sender = direct_bob
    direct_vm.value = 1000
    with direct_vm.expect_revert("Program phases must use the same sponsor"):
        contract.create_program_phase(
            "program-sponsor",
            "phase-two",
            "phase-one",
            QUESTION,
            RUBRIC,
            future_deadline(7200),
            2,
        )
    direct_vm.value = 0


def test_v2_program_requires_increasing_phase_deadlines(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    first_deadline = future_deadline(7200)

    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    contract.create_program_phase(
        "program-deadline",
        "phase-one",
        "",
        QUESTION,
        RUBRIC,
        first_deadline,
        2,
    )

    with direct_vm.expect_revert("Program phase deadlines must increase"):
        contract.create_program_phase(
            "program-deadline",
            "phase-two",
            "phase-one",
            QUESTION,
            RUBRIC,
            first_deadline,
            2,
        )
    direct_vm.value = 0


def test_v2_noncreator_cannot_recover_closed_bounty(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the bounty creator can recover"):
        contract.recover_stalled_bounty("bounty-v2")


def test_v2_validator_accepts_same_winner_with_nonidentical_live_snapshots(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")

    # Leader sees one valid rendering of the public pages.
    mock_available_evidence(direct_vm)
    mock_winner(direct_vm, score=96, runner=35)
    contract.resolve_bounty("bounty-v2")

    # Validator independently refetches the same immutable URLs. Harmless page
    # text changed, but the material research winner remains the same.
    direct_vm.clear_mocks()
    direct_vm.mock_web(
        r".*report-a\.example.*",
        {"status": 200, "body": "Primary report directly answers the question. Updated footer text."},
    )
    direct_vm.mock_web(
        r".*authority\.example.*",
        {"status": 200, "body": "Authoritative source confirms the primary report. Updated timestamp."},
    )
    direct_vm.mock_web(
        r".*standard\.example.*",
        {"status": 200, "body": "Independent source corroborates the primary report. Minor page revision."},
    )
    direct_vm.mock_web(
        r".*report-b\.example.*",
        {"status": 200, "body": "Runner report remains generic and weakly supported."},
    )
    direct_vm.mock_web(
        r".*generic-a\.example.*",
        {"status": 200, "body": "Generic page with unrelated layout changes."},
    )
    direct_vm.mock_web(
        r".*generic-b\.example.*",
        {"status": 200, "body": "Another generic page with a changed footer."},
    )
    mock_winner(
        direct_vm,
        score=91,
        runner=40,
        reason="RUBRIC_FIT",
        winner_id="primary",
    )
    assert direct_vm.run_validator() is True


def test_v2_validator_rejects_different_material_winner(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    mock_available_evidence(direct_vm)
    mock_winner(direct_vm, score=96, runner=35, winner_id="primary")
    contract.resolve_bounty("bounty-v2")

    direct_vm.clear_mocks()
    mock_available_evidence(direct_vm)
    mock_winner(
        direct_vm,
        score=93,
        runner=88,
        reason="RUBRIC_FIT",
        winner_id="runner",
    )
    assert direct_vm.run_validator() is False


def test_v2_validator_rejects_same_winner_below_threshold(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    mock_available_evidence(direct_vm)
    mock_winner(direct_vm, score=96, runner=35, winner_id="primary")
    contract.resolve_bounty("bounty-v2")

    direct_vm.clear_mocks()
    mock_available_evidence(direct_vm)
    mock_winner(
        direct_vm,
        score=64,
        runner=60,
        reason="RUBRIC_FIT",
        winner_id="primary",
    )
    assert direct_vm.run_validator() is False


def test_v2_validator_accepts_materially_same_no_winner_with_different_failure_reason(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena_v2.py")
    create_bounty(direct_vm, contract, direct_alice)
    add_two_submissions(direct_vm, contract, direct_bob, direct_charlie)

    direct_vm.sender = direct_alice
    contract.close_bounty("bounty-v2")
    mock_available_evidence(direct_vm)
    mock_winner(
        direct_vm,
        score=55,
        runner=48,
        reason="EVIDENCE_GAP",
        winner_id="",
    )
    contract.resolve_bounty("bounty-v2")

    direct_vm.clear_mocks()
    mock_available_evidence(direct_vm)
    mock_winner(
        direct_vm,
        score=50,
        runner=45,
        reason="CONTRADICTORY_EVIDENCE",
        winner_id="",
    )
    assert direct_vm.run_validator() is True
