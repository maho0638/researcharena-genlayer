"""Resume the already-deployed V2 candidate after a transient Studionet/RPC failure.

This test NEVER deploys a contract. It attaches to the exact candidate deployed by
workflow 36264783013 and completes only missing lifecycle actions.
"""

import time

import pytest
from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded

CANDIDATE = "0x55e860F07f9ab084a805E603d7dd738466675a3F"
PROGRAM_ID = "researcharena-v2-program"
PHASE_1 = "ra-v2-evidence-phase"
PHASE_2 = "ra-v2-synthesis-phase"
BAD_ID = "ra-v2-no-winner-refund-resume"
REWARD = 1_000_000_000_000


def _field(value, name):
    return value.get(name) if isinstance(value, dict) else getattr(value, name)


def _bounty(contract, bounty_id):
    return contract.get_bounty(args=[bounty_id]).call()


def _status(contract, bounty_id):
    return str(_field(_bounty(contract, bounty_id), "status"))


def _submission_exists(contract, bounty_id, submission_id):
    try:
        contract.get_submission(args=[bounty_id, submission_id]).call()
        return True
    except Exception:
        return False


def _bounty_exists(contract, bounty_id):
    try:
        _bounty(contract, bounty_id)
        return True
    except Exception:
        return False


def _wait_for(check, timeout=120, interval=4):
    deadline = time.time() + timeout
    last_error = None
    while time.time() < deadline:
        try:
            value = check()
            if value:
                return value
        except Exception as exc:
            last_error = exc
        time.sleep(interval)
    if last_error:
        raise last_error
    raise AssertionError("Timed out waiting for expected Studionet state")


def _stateful_write(label, send, reached, attempts=4):
    """Retry transient RPC failures without replaying an action already committed."""
    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            if reached():
                print(f"{label}_ALREADY_COMPLETE=true", flush=True)
                return None
        except Exception:
            pass

        try:
            receipt = send()
            if not tx_execution_succeeded(receipt):
                raise AssertionError(f"{label} transaction did not succeed: {receipt}")
            print(f"{label}_TX={receipt.get('hash', '')}", flush=True)
        except Exception as exc:
            last_error = exc
            print(
                f"{label}_TRANSIENT_ATTEMPT_{attempt}={type(exc).__name__}: {str(exc)[:220]}",
                flush=True,
            )

        try:
            if _wait_for(reached, timeout=45, interval=5):
                return None
        except Exception as exc:
            last_error = exc

        time.sleep(5 * attempt)

    raise AssertionError(f"{label} did not reach expected state: {last_error}")


@pytest.mark.integration
def test_resume_existing_v2_candidate(default_account, accounts):
    assert len(accounts) >= 3

    factory = get_contract_factory(contract_file_path="research_arena_v2.py")
    contract = factory.build_contract(
        contract_address=CANDIDATE,
        account=default_account,
    )
    creator = contract.connect(account=default_account)
    researcher_a = contract.connect(account=accounts[1])
    researcher_b = contract.connect(account=accounts[2])

    # Safety: prove this run is attached to the candidate from the failed live
    # workflow, and that the deterministic test accounts still own the state.
    phase1 = _wait_for(lambda: _bounty(contract, PHASE_1))
    assert str(_field(phase1, "creator")).lower() == str(default_account.address).lower()
    assert str(_field(phase1, "status")) == "PAID"
    assert int(_field(phase1, "challenge_count")) == 1
    assert int(_field(phase1, "resolution_round")) == 2
    assert bool(_field(phase1, "reward_claimed")) is True
    assert str(_field(phase1, "initial_winner_submission_id"))
    assert str(_field(phase1, "winner_report_snapshot"))
    assert str(_field(phase1, "winner_source_1_snapshot"))
    assert str(_field(phase1, "winner_source_2_snapshot"))
    assert str(_field(phase1, "challenge_note"))
    print("RA_V2_RESUME_EXISTING_CONTRACT=true", flush=True)
    print("RA_V2_PHASE1_PAID_WITH_CHALLENGE_HISTORY=true", flush=True)
    print("RA_V2_EVIDENCE_SNAPSHOTS_STORED=true", flush=True)
    print("RA_V2_AUDITABLE_APPEAL_VERIFIED=true", flush=True)

    phase2 = _wait_for(lambda: _bounty(contract, PHASE_2))
    assert str(_field(phase2, "creator")).lower() == str(default_account.address).lower()
    assert bool(contract.is_phase_unlocked(args=[PHASE_2]).call()) is True
    print("RA_V2_PHASE2_UNLOCKED_AFTER_PHASE1_PAID=true", flush=True)

    # The original run reached CLOSED and then Studionet returned HTTP 502 while
    # fetching the creator nonce for resolve. Continue from that exact state.
    if _status(contract, PHASE_2) == "CLOSED":
        _stateful_write(
            "RA_V2_PHASE2_RESOLVE",
            lambda: creator.resolve_bounty(args=[PHASE_2]).transact(
                consensus_max_rotations=5,
                wait_interval=10000,
                wait_retries=50,
            ),
            lambda: _status(contract, PHASE_2) in {"RESOLVED", "REJECTED"},
        )

    phase2 = _bounty(contract, PHASE_2)
    assert str(_field(phase2, "status")) == "RESOLVED"
    assert str(_field(phase2, "winner_submission_id")) == f"{PHASE_2}-primary"
    assert int(_field(phase2, "winning_score")) >= 70
    assert str(_field(phase2, "winner_report_snapshot"))
    assert str(_field(phase2, "winner_source_1_snapshot"))
    assert str(_field(phase2, "winner_source_2_snapshot"))
    print("RA_V2_PHASE2_RESOLVED=true", flush=True)

    _stateful_write(
        "RA_V2_PHASE2_CLAIM",
        lambda: researcher_a.claim_reward(args=[PHASE_2]).transact(
            wait_interval=10000,
            wait_retries=40,
        ),
        lambda: _status(contract, PHASE_2) == "PAID",
    )
    assert _status(contract, PHASE_2) == "PAID"

    progress = contract.get_program_progress(args=[PROGRAM_ID]).call()
    assert int(_field(progress, "total_phases")) == 2
    assert int(_field(progress, "paid_phases")) == 2
    assert int(_field(progress, "total_reward")) == REWARD * 2
    assert int(_field(progress, "settled_reward")) == REWARD * 2
    print("RA_V2_TWO_PHASE_PROGRAM_VERIFIED=true", flush=True)

    stats = contract.get_researcher_stats(args=[str(accounts[1].address)]).call()
    assert int(_field(stats, "paid_wins")) >= 2
    assert int(_field(stats, "total_earned")) >= REWARD * 2
    print("RA_V2_RESEARCHER_STATS_VERIFIED=true", flush=True)

    # Negative path on the SAME deployed contract. The helper checks on-chain
    # state after network exceptions so a retry does not duplicate a committed step.
    if not _bounty_exists(contract, BAD_ID):
        now = int(time.time())
        _stateful_write(
            "RA_V2_BAD_CREATE",
            lambda: creator.create_bounty(
                args=[
                    BAD_ID,
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
            ).transact(value=REWARD, wait_interval=10000, wait_retries=40),
            lambda: _bounty_exists(contract, BAD_ID),
        )

    if not _submission_exists(contract, BAD_ID, "unavailable-a"):
        _stateful_write(
            "RA_V2_BAD_SUBMIT_A",
            lambda: researcher_a.submit_research(
                args=[
                    BAD_ID,
                    "unavailable-a",
                    "https://example.com",
                    "https://missing-one.invalid/evidence",
                    "https://missing-two.invalid/evidence",
                ]
            ).transact(wait_interval=10000, wait_retries=40),
            lambda: _submission_exists(contract, BAD_ID, "unavailable-a"),
        )

    if not _submission_exists(contract, BAD_ID, "unavailable-b"):
        _stateful_write(
            "RA_V2_BAD_SUBMIT_B",
            lambda: researcher_b.submit_research(
                args=[
                    BAD_ID,
                    "unavailable-b",
                    "https://example.org",
                    "https://missing-three.invalid/evidence",
                    "https://missing-four.invalid/evidence",
                ]
            ).transact(wait_interval=10000, wait_retries=40),
            lambda: _submission_exists(contract, BAD_ID, "unavailable-b"),
        )

    if _status(contract, BAD_ID) == "OPEN":
        _stateful_write(
            "RA_V2_BAD_CLOSE",
            lambda: creator.close_bounty(args=[BAD_ID]).transact(
                wait_interval=10000,
                wait_retries=40,
            ),
            lambda: _status(contract, BAD_ID) in {"CLOSED", "REJECTED", "REFUNDED"},
        )

    if _status(contract, BAD_ID) == "CLOSED":
        _stateful_write(
            "RA_V2_BAD_RESOLVE",
            lambda: creator.resolve_bounty(args=[BAD_ID]).transact(
                consensus_max_rotations=5,
                wait_interval=10000,
                wait_retries=50,
            ),
            lambda: _status(contract, BAD_ID) in {"REJECTED", "REFUNDED"},
        )

    bad = _bounty(contract, BAD_ID)
    assert str(_field(bad, "status")) in {"REJECTED", "REFUNDED"}
    assert str(_field(bad, "winner_submission_id")) == ""
    assert str(_field(bad, "reason_code")) in {
        "EVIDENCE_GAP",
        "SOURCE_UNAVAILABLE",
        "CONTRADICTORY_EVIDENCE",
    }
    print("RA_V2_NO_WINNER_VERIFIED=true", flush=True)

    if _status(contract, BAD_ID) == "REJECTED":
        _stateful_write(
            "RA_V2_REJECTED_REFUND",
            lambda: creator.refund_rejected(args=[BAD_ID]).transact(
                wait_interval=10000,
                wait_retries=40,
            ),
            lambda: _status(contract, BAD_ID) == "REFUNDED",
        )

    refunded = _bounty(contract, BAD_ID)
    assert str(_field(refunded, "status")) == "REFUNDED"
    assert bool(_field(refunded, "reward_claimed")) is True
    print("RA_V2_REFUNDED=true", flush=True)
    print("RA_V2_ALL_LIVE_PATHS_VERIFIED=true", flush=True)
