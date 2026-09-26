"""Live V2 proof: multi-phase research program, challenge, settlement, and no-winner refund."""

import hashlib
import time
from pathlib import Path

import pytest
from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def _field(value, name):
    return value.get(name) if isinstance(value, dict) else getattr(value, name)


def _is_transient_rpc_error(exc):
    message = str(exc)
    return any(
        token in message
        for token in (
            "502",
            "Bad gateway",
            "invalid JSON",
            "ConnectionError",
            "Read timed out",
            "RemoteDisconnected",
        )
    )


def _call_with_retry(call, attempts=6):
    for attempt in range(1, attempts + 1):
        try:
            return call.call()
        except Exception as exc:
            if not _is_transient_rpc_error(exc) or attempt == attempts:
                raise
            time.sleep(min(3 * attempt, 12))


def _transact_with_nonce_retry(call, attempts=5, **kwargs):
    """Retry only pre-submit nonce RPC failures; never replay an unknown tx."""
    for attempt in range(1, attempts + 1):
        try:
            return call.transact(**kwargs)
        except Exception as exc:
            message = str(exc)
            safe_to_retry = (
                "eth_getTransactionCount" in message
                and _is_transient_rpc_error(exc)
            )
            if not safe_to_retry or attempt == attempts:
                raise
            time.sleep(min(4 * attempt, 16))


def _wait_status(contract, bounty_id, expected, timeout=180):
    expected = set(expected)
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        last = _call_with_retry(contract.get_bounty(args=[bounty_id]))
        status = str(_field(last, "status"))
        if status in expected:
            return last
        time.sleep(3)
    raise AssertionError(
        f"{bounty_id} did not reach {sorted(expected)}; last="
        f"{str(_field(last, 'status')) if last is not None else 'UNKNOWN'}"
    )


def _submit_competition(creator, researcher_a, researcher_b, contract, bounty_id):
    submit_a = _transact_with_nonce_retry(
        researcher_a.submit_research(
            args=[
                bounty_id,
                f"{bounty_id}-primary",
                "https://www.iana.org/help/example-domains",
                "https://www.iana.org/domains/reserved",
                "https://www.rfc-editor.org/rfc/rfc2606",
            ]
        ),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(submit_a)
    print(f"RA_V2_{bounty_id}_SUBMIT_PRIMARY_TX={submit_a.get('hash', '')}", flush=True)

    submit_b = _transact_with_nonce_retry(
        researcher_b.submit_research(
            args=[
                bounty_id,
                f"{bounty_id}-generic",
                "https://example.org",
                "https://www.iana.org",
                "https://www.rfc-editor.org",
            ]
        ),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(submit_b)
    print(f"RA_V2_{bounty_id}_SUBMIT_GENERIC_TX={submit_b.get('hash', '')}", flush=True)

    close_tx = _transact_with_nonce_retry(
        creator.close_bounty(args=[bounty_id]),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(close_tx)
    print(f"RA_V2_{bounty_id}_CLOSE_TX={close_tx.get('hash', '')}", flush=True)


def _resolve(creator, contract, bounty_id):
    tx = _transact_with_nonce_retry(
        creator.resolve_bounty(args=[bounty_id]),
        consensus_max_rotations=5,
        wait_interval=10000,
        wait_retries=50,
    )
    assert tx_execution_succeeded(tx)
    print(f"RA_V2_{bounty_id}_RESOLVE_TX={tx.get('hash', '')}", flush=True)
    result = _wait_status(contract, bounty_id, {"RESOLVED", "REJECTED"})
    print(f"RA_V2_{bounty_id}_STATUS={_field(result, 'status')}", flush=True)
    print(f"RA_V2_{bounty_id}_WINNER={_field(result, 'winner_submission_id')}", flush=True)
    print(f"RA_V2_{bounty_id}_SCORE={_field(result, 'winning_score')}", flush=True)
    print(f"RA_V2_{bounty_id}_REASON={_field(result, 'reason_code')}", flush=True)
    return result


@pytest.mark.integration
def test_researcharena_v2_program_challenge_and_refund(default_account, accounts):
    assert len(accounts) >= 3

    factory = get_contract_factory(contract_file_path="research_arena_v2.py")
    local_source = Path("contracts/research_arena_v2.py").read_text()
    assert (
        factory.contract_code.replace("\r\n", "\n").strip()
        == local_source.replace("\r\n", "\n").strip()
    )
    print("RA_V2_DEPLOY_INPUT_MATCH=true", flush=True)
    print(
        "RA_V2_SOURCE_SHA256=" + hashlib.sha256(local_source.encode()).hexdigest(),
        flush=True,
    )

    contract = factory.deploy(
        account=default_account,
        consensus_max_rotations=2,
    )
    print(f"RA_V2_CONTRACT_ADDRESS={contract.address}", flush=True)

    creator = contract.connect(account=default_account)
    researcher_a = contract.connect(account=accounts[1])
    researcher_b = contract.connect(account=accounts[2])

    reward = 1_000_000_000_000
    now = int(time.time())
    program_id = "researcharena-v2-program"
    phase_1 = "ra-v2-evidence-phase"
    phase_2 = "ra-v2-synthesis-phase"

    create_1 = _transact_with_nonce_retry(
        creator.create_program_phase(
            args=[
                program_id,
                phase_1,
                "",
                (
                    "Which submitted report most directly establishes that example.com "
                    "is reserved for documentation examples?"
                ),
                (
                    "Prefer IANA and standards-track evidence that explicitly supports "
                    "the claim, with independent corroboration."
                ),
                now + 7200,
                2,
            ]
        ),
        value=reward,
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(create_1)
    print(f"RA_V2_PHASE1_CREATE_TX={create_1.get('hash', '')}", flush=True)

    create_2 = _transact_with_nonce_retry(
        creator.create_program_phase(
            args=[
                program_id,
                phase_2,
                phase_1,
                (
                    "Which submitted synthesis most directly establishes that example.com "
                    "is reserved for documentation examples?"
                ),
                (
                    "Prefer direct standards evidence and independent corroboration; "
                    "reject generic pages that do not prove the claim."
                ),
                now + 14400,
                2,
            ]
        ),
        value=reward,
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(create_2)
    print(f"RA_V2_PHASE2_CREATE_TX={create_2.get('hash', '')}", flush=True)

    assert int(_call_with_retry(contract.get_program_phase_count(args=[program_id]))) == 2
    assert bool(_call_with_retry(contract.is_phase_unlocked(args=[phase_2]))) is False
    print("RA_V2_PHASE2_LOCKED_BEFORE_PHASE1_PAID=true", flush=True)

    _submit_competition(creator, researcher_a, researcher_b, contract, phase_1)
    phase1_result = _resolve(creator, contract, phase_1)
    assert str(_field(phase1_result, "status")) == "RESOLVED"
    assert str(_field(phase1_result, "winner_submission_id")) == f"{phase_1}-primary"
    assert int(_field(phase1_result, "winning_score")) >= 70
    assert str(_field(phase1_result, "winner_report_snapshot"))
    assert str(_field(phase1_result, "winner_source_1_snapshot"))
    assert str(_field(phase1_result, "winner_source_2_snapshot"))
    print("RA_V2_EVIDENCE_SNAPSHOTS_STORED=true", flush=True)

    challenge = _transact_with_nonce_retry(
        researcher_b.challenge_resolution(
            args=[
                phase_1,
                "Request one fresh evidence fetch before payout to verify the competitive result.",
            ]
        ),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(challenge)
    print(f"RA_V2_CHALLENGE_TX={challenge.get('hash', '')}", flush=True)
    _wait_status(contract, phase_1, {"CHALLENGED"})

    resolve_challenge = _transact_with_nonce_retry(
        creator.resolve_challenge(args=[phase_1]),
        consensus_max_rotations=5,
        wait_interval=10000,
        wait_retries=50,
    )
    assert tx_execution_succeeded(resolve_challenge)
    print(
        f"RA_V2_RESOLVE_CHALLENGE_TX={resolve_challenge.get('hash', '')}",
        flush=True,
    )
    phase1_after = _wait_status(contract, phase_1, {"RESOLVED"})
    assert int(_field(phase1_after, "challenge_count")) == 1
    assert int(_field(phase1_after, "resolution_round")) == 2
    assert str(_field(phase1_after, "initial_winner_submission_id")) == f"{phase_1}-primary"
    assert int(_field(phase1_after, "initial_winning_score")) >= 70
    assert str(_field(phase1_after, "initial_reason_code"))
    assert str(_field(phase1_after, "winner_submission_id")) == f"{phase_1}-primary"
    print("RA_V2_AUDITABLE_APPEAL_VERIFIED=true", flush=True)

    claim_1 = _transact_with_nonce_retry(
        researcher_a.claim_reward(args=[phase_1]),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(claim_1)
    print(f"RA_V2_PHASE1_CLAIM_TX={claim_1.get('hash', '')}", flush=True)
    _wait_status(contract, phase_1, {"PAID"})

    assert bool(_call_with_retry(contract.is_phase_unlocked(args=[phase_2]))) is True
    print("RA_V2_PHASE2_UNLOCKED_AFTER_PHASE1_PAID=true", flush=True)

    _submit_competition(creator, researcher_a, researcher_b, contract, phase_2)
    phase2_result = _resolve(creator, contract, phase_2)
    assert str(_field(phase2_result, "status")) == "RESOLVED"
    assert str(_field(phase2_result, "winner_submission_id")) == f"{phase_2}-primary"

    claim_2 = _transact_with_nonce_retry(
        researcher_a.claim_reward(args=[phase_2]),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(claim_2)
    print(f"RA_V2_PHASE2_CLAIM_TX={claim_2.get('hash', '')}", flush=True)
    _wait_status(contract, phase_2, {"PAID"})

    progress = _call_with_retry(contract.get_program_progress(args=[program_id]))
    assert int(_field(progress, "total_phases")) == 2
    assert int(_field(progress, "paid_phases")) == 2
    assert int(_field(progress, "total_reward")) == reward * 2
    assert int(_field(progress, "settled_reward")) == reward * 2
    print("RA_V2_TWO_PHASE_PROGRAM_VERIFIED=true", flush=True)

    stats = _call_with_retry(
        contract.get_researcher_stats(args=[str(accounts[1].address)])
    )
    assert int(_field(stats, "paid_wins")) == 2
    assert int(_field(stats, "total_earned")) == reward * 2
    print("RA_V2_RESEARCHER_STATS_VERIFIED=true", flush=True)

    bad_id = "ra-v2-no-winner-refund"
    create_bad = _transact_with_nonce_retry(
        creator.create_bounty(
            args=[
                bad_id,
                (
                    "Which submission directly proves the ResearchArena V2 multi-phase "
                    "protocol, challenge flow, and evidence-bound settlement?"
                ),
                (
                    "Reject unrelated or unavailable evidence. A winner must directly "
                    "prove the specified V2 protocol behavior."
                ),
                now + 7200,
                2,
            ]
        ),
        value=reward,
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(create_bad)
    print(f"RA_V2_BAD_CREATE_TX={create_bad.get('hash', '')}", flush=True)

    bad_a = _transact_with_nonce_retry(
        researcher_a.submit_research(
            args=[
                bad_id,
                "unavailable-a",
                "https://example.com",
                "https://missing-one.invalid/evidence",
                "https://missing-two.invalid/evidence",
            ]
        ),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(bad_a)
    print(f"RA_V2_BAD_SUBMIT_A_TX={bad_a.get('hash', '')}", flush=True)

    bad_b = _transact_with_nonce_retry(
        researcher_b.submit_research(
            args=[
                bad_id,
                "unavailable-b",
                "https://example.org",
                "https://missing-three.invalid/evidence",
                "https://missing-four.invalid/evidence",
            ]
        ),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(bad_b)
    print(f"RA_V2_BAD_SUBMIT_B_TX={bad_b.get('hash', '')}", flush=True)

    close_bad = _transact_with_nonce_retry(
        creator.close_bounty(args=[bad_id]),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(close_bad)
    print(f"RA_V2_BAD_CLOSE_TX={close_bad.get('hash', '')}", flush=True)

    bad_result = _resolve(creator, contract, bad_id)
    assert str(_field(bad_result, "status")) == "REJECTED"
    assert str(_field(bad_result, "winner_submission_id")) == ""
    assert str(_field(bad_result, "reason_code")) in {
        "EVIDENCE_GAP",
        "SOURCE_UNAVAILABLE",
        "CONTRADICTORY_EVIDENCE",
    }
    print("RA_V2_NO_WINNER_VERIFIED=true", flush=True)

    refund = _transact_with_nonce_retry(
        creator.refund_rejected(args=[bad_id]),
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(refund)
    print(f"RA_V2_REJECTED_REFUND_TX={refund.get('hash', '')}", flush=True)
    refunded = _wait_status(contract, bad_id, {"REFUNDED"})
    assert bool(_field(refunded, "reward_claimed")) is True
    print("RA_V2_REFUNDED=true", flush=True)

    print("RA_V2_ALL_LIVE_PATHS_VERIFIED=true", flush=True)
