"""Live Studionet end-to-end test: escrow -> competing reports -> consensus -> claim."""

import pytest
from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def _field(value, name):
    if isinstance(value, dict):
        return value.get(name)
    return getattr(value, name)


@pytest.mark.integration
def test_research_arena_live_flow(default_account, accounts):
    assert len(accounts) >= 3

    factory = get_contract_factory("ResearchArena")
    contract = factory.deploy(
        account=default_account,
        consensus_max_rotations=2,
    )

    print(f"RESEARCH_ARENA_CONTRACT_ADDRESS={contract.address}", flush=True)

    creator_contract = contract.connect(account=default_account)
    researcher_a_contract = contract.connect(account=accounts[1])
    researcher_b_contract = contract.connect(account=accounts[2])

    bounty_id = "example-domain-research-v1"
    reward = 1_000_000_000_000

    create_tx = creator_contract.create_bounty(
        args=[
            bounty_id,
            "Which submitted report most directly and authoritatively establishes that example.com is reserved for documentation examples?",
            "Prefer primary sources that explicitly name example.com, independent corroboration, and standards-track evidence. Penalize generic homepages or evidence that does not directly support the claim.",
            4000000000,
            3,
        ]
    ).transact(
        value=reward,
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(create_tx)
    print(f"RESEARCH_ARENA_CREATE_TX={create_tx.get('hash', '')}", flush=True)

    submit_a = researcher_a_contract.submit_research(
        args=[
            bounty_id,
            "primary-report",
            "https://www.iana.org/help/example-domains",
            "https://example.com",
            "https://www.rfc-editor.org/rfc/rfc2606",
        ]
    ).transact(
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(submit_a)
    print(f"RESEARCH_ARENA_SUBMIT_A_TX={submit_a.get('hash', '')}", flush=True)

    submit_b = researcher_b_contract.submit_research(
        args=[
            bounty_id,
            "generic-report",
            "https://example.org",
            "https://www.iana.org",
            "https://www.rfc-editor.org",
        ]
    ).transact(
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(submit_b)
    print(f"RESEARCH_ARENA_SUBMIT_B_TX={submit_b.get('hash', '')}", flush=True)

    close_tx = creator_contract.close_bounty(args=[bounty_id]).transact(
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(close_tx)
    print(f"RESEARCH_ARENA_CLOSE_TX={close_tx.get('hash', '')}", flush=True)

    resolve_tx = creator_contract.resolve_bounty(args=[bounty_id]).transact(
        consensus_max_rotations=3,
        wait_interval=10000,
        wait_retries=50,
    )
    assert tx_execution_succeeded(resolve_tx)
    print(f"RESEARCH_ARENA_RESOLVE_TX={resolve_tx.get('hash', '')}", flush=True)

    result = contract.get_bounty(args=[bounty_id]).call()
    print(f"RESEARCH_ARENA_STATUS={_field(result, 'status')}", flush=True)
    print(f"RESEARCH_ARENA_WINNER_ID={_field(result, 'winner_submission_id')}", flush=True)
    print(f"RESEARCH_ARENA_WINNING_SCORE={_field(result, 'winning_score')}", flush=True)
    print(f"RESEARCH_ARENA_RUNNER_UP_SCORE={_field(result, 'runner_up_score')}", flush=True)
    print(f"RESEARCH_ARENA_REASON_CODE={_field(result, 'reason_code')}", flush=True)
    print(f"RESEARCH_ARENA_RATIONALE={_field(result, 'rationale')}", flush=True)

    assert str(_field(result, "status")) == "RESOLVED"
    assert str(_field(result, "winner_submission_id")) == "primary-report"
    assert int(_field(result, "winning_score")) >= 70

    claim_tx = researcher_a_contract.claim_reward(args=[bounty_id]).transact(
        wait_interval=10000,
        wait_retries=40,
    )
    assert tx_execution_succeeded(claim_tx)
    print(f"RESEARCH_ARENA_CLAIM_TX={claim_tx.get('hash', '')}", flush=True)

    claimed = contract.get_bounty(args=[bounty_id]).call()
    assert bool(_field(claimed, "reward_claimed")) is True
    print("RESEARCH_ARENA_REWARD_CLAIMED=true", flush=True)
