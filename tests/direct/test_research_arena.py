import json


def create_demo_bounty(direct_vm, contract, creator):
    direct_vm.sender = creator
    direct_vm.value = 1000
    contract.create_bounty(
        "research-1",
        "Which report best proves the claim?",
        "Prefer direct, authoritative, independent evidence.",
        4000000000,
        2,
    )
    direct_vm.value = 0


def test_create_bounty_escrows_value(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    contract = direct_deploy("contracts/research_arena.py")

    direct_vm.value = 2500
    contract.create_bounty(
        "escrow-test",
        "Research question",
        "Evidence quality matters",
        4000000000,
        4,
    )
    direct_vm.value = 0

    bounty = contract.get_bounty("escrow-test")
    assert bounty.reward == 2500
    assert bounty.status == "OPEN"
    assert bounty.submission_count == 0
    assert contract.get_bounty_count() == 1
    assert contract.get_bounty_id(0) == "escrow-test"


def test_zero_reward_is_rejected(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    contract = direct_deploy("contracts/research_arena.py")

    direct_vm.value = 0
    with direct_vm.expect_revert("greater than zero"):
        contract.create_bounty(
            "no-reward",
            "Question",
            "Rubric",
            4000000000,
            2,
        )


def test_creator_cannot_submit(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/research_arena.py")
    create_demo_bounty(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("creator cannot submit"):
        contract.submit_research(
            "research-1",
            "self-entry",
            "https://report.example/a",
            "https://source.example/a",
            "https://source.example/b",
        )


def test_duplicate_researcher_is_rejected(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/research_arena.py")
    create_demo_bounty(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_bob
    contract.submit_research(
        "research-1",
        "bob-1",
        "https://report.example/a",
        "https://source-a.example/a",
        "https://source-b.example/b",
    )

    with direct_vm.expect_revert("already submitted"):
        contract.submit_research(
            "research-1",
            "bob-2",
            "https://report.example/c",
            "https://source-c.example/c",
            "https://source-d.example/d",
        )


def test_consensus_selects_stronger_research(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena.py")
    create_demo_bounty(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_bob
    contract.submit_research(
        "research-1",
        "primary-report",
        "https://report-a.example/research",
        "https://source-a.example/primary",
        "https://source-b.example/standard",
    )

    direct_vm.sender = direct_charlie
    contract.submit_research(
        "research-1",
        "weak-report",
        "https://report-b.example/research",
        "https://source-c.example/home",
        "https://source-d.example/home",
    )

    direct_vm.sender = direct_alice
    contract.close_bounty("research-1")

    direct_vm.mock_web(
        r".*report-a\.example.*",
        {"status": 200, "body": "Report A directly answers the question with citations."},
    )
    direct_vm.mock_web(
        r".*source-a\.example.*",
        {"status": 200, "body": "Primary authority explicitly supports the claim."},
    )
    direct_vm.mock_web(
        r".*source-b\.example.*",
        {"status": 200, "body": "Independent standard also explicitly supports the claim."},
    )
    direct_vm.mock_web(
        r".*report-b\.example.*",
        {"status": 200, "body": "Report B makes a broad claim without direct support."},
    )
    direct_vm.mock_web(
        r".*source-c\.example.*",
        {"status": 200, "body": "Generic homepage."},
    )
    direct_vm.mock_web(
        r".*source-d\.example.*",
        {"status": 200, "body": "Generic homepage."},
    )

    direct_vm.mock_llm(
        r"(?s).*neutral judge of a competitive research bounty.*",
        json.dumps(
            {
                "winner_id": "primary-report",
                "winner_score": 96,
                "runner_up_score": 41,
                "reason_code": "SOURCE_AUTHORITY",
            }
        ),
    )

    contract.resolve_bounty("research-1")
    bounty = contract.get_bounty("research-1")

    assert bounty.status == "RESOLVED"
    assert bounty.winner_submission_id == "primary-report"
    assert str(bounty.winner).lower() == "0x" + direct_bob.hex()
    assert bounty.winning_score == 96
    assert bounty.runner_up_score == 41
    assert bounty.reason_code == "SOURCE_AUTHORITY"
    assert "authoritative evidence" in bounty.rationale


def test_creator_cannot_close_underfilled_bounty_before_deadline(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    contract = direct_deploy("contracts/research_arena.py")
    contract.create_bounty(
        "fair-close",
        "Which report is best supported?",
        "Prefer direct and authoritative evidence.",
        4000000000,
        3,
    )
    direct_vm.value = 0

    direct_vm.sender = direct_bob
    contract.submit_research(
        "fair-close",
        "bob-entry",
        "https://report-a.example/research",
        "https://source-a.example/a",
        "https://source-b.example/b",
    )
    direct_vm.sender = direct_charlie
    contract.submit_research(
        "fair-close",
        "charlie-entry",
        "https://report-b.example/research",
        "https://source-c.example/c",
        "https://source-d.example/d",
    )

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("submission cap is reached"):
        contract.close_bounty("fair-close")


def test_non_creator_cannot_close(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    contract = direct_deploy("contracts/research_arena.py")
    create_demo_bounty(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_bob
    contract.submit_research(
        "research-1",
        "bob-entry",
        "https://report.example/bob",
        "https://source-a.example/a",
        "https://source-b.example/b",
    )
    direct_vm.sender = direct_charlie
    contract.submit_research(
        "research-1",
        "charlie-entry",
        "https://report.example/charlie",
        "https://source-c.example/c",
        "https://source-d.example/d",
    )

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the bounty creator"):
        contract.close_bounty("research-1")


def test_creator_can_refund_empty_bounty(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    contract = direct_deploy("contracts/research_arena.py")

    direct_vm.value = 1800
    contract.create_bounty(
        "refund-test",
        "Question",
        "Rubric",
        4000000000,
        2,
    )
    direct_vm.value = 0
    direct_vm.deal(direct_vm._contract_address, 1800)

    refunded = contract.refund_unfilled_bounty("refund-test")
    bounty = contract.get_bounty("refund-test")

    assert refunded == 1800
    assert bounty.status == "REFUNDED"
    assert bounty.reward_claimed is True


def test_same_source_domain_is_rejected(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/research_arena.py")
    create_demo_bounty(direct_vm, contract, direct_alice)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("independent domains"):
        contract.submit_research(
            "research-1",
            "same-domain",
            "https://report.example/research",
            "https://example.com/source-a",
            "https://www.example.com/source-b",
        )
