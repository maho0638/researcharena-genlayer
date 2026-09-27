from pathlib import Path
import json


ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_v2_frontend_pins_canonical_contract_in_production():
    page = read("app/v2/page.tsx")
    assert '0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9' in page
    assert "NEXT_PUBLIC_RESEARCHARENA_V2_ADDRESS" in page
    assert 'process.env.NODE_ENV === "production"' in page
    assert "? CANONICAL_V2_ADDRESS" in page
    assert "V2_CONFIGURED" in page
    assert "disabled={busy || !V2_CONFIGURED}" in page


def test_development_branch_blocks_automatic_vercel_deploys():
    config = json.loads(read("vercel.json"))
    assert config["git"]["deploymentEnabled"] is False


def test_live_v2_workflow_is_manual_only():
    workflow = read(".github/workflows/verify-v2-studionet.yml")
    trigger_block = workflow.split("jobs:", 1)[0]
    assert "workflow_dispatch:" in trigger_block
    assert "push:" not in trigger_block
    assert "pull_request:" not in trigger_block


def test_live_v2_workflow_requires_all_critical_markers():
    workflow = read(".github/workflows/verify-v2-studionet.yml")
    required = (
        "RA_V2_DEPLOY_INPUT_MATCH=true",
        "RA_V2_PHASE2_LOCKED_BEFORE_PHASE1_PAID=true",
        "RA_V2_EVIDENCE_SNAPSHOTS_STORED=true",
        "RA_V2_CHALLENGE_WINDOW_ENFORCED=true",
        "RA_V2_AUDITABLE_APPEAL_VERIFIED=true",
        "RA_V2_PHASE2_UNLOCKED_AFTER_PHASE1_PAID=true",
        "RA_V2_TWO_PHASE_PROGRAM_VERIFIED=true",
        "RA_V2_RESEARCHER_STATS_VERIFIED=true",
        "RA_V2_NO_WINNER_VERIFIED=true",
        "RA_V2_REFUNDED=true",
        "RA_V2_ALL_LIVE_PATHS_VERIFIED=true",
    )
    for marker in required:
        assert marker in workflow


def test_deployed_source_verifier_targets_exact_v2_contract():
    verifier = read("scripts/verify-v2-deployed-source.mjs")
    workflow = read(".github/workflows/verify-v2-studionet.yml")
    assert 'contracts/research_arena_v2.py' in verifier
    assert "RA_V2_DEPLOYED_SOURCE_MATCH=true" in verifier
    assert "CONTRACT_SOURCE_PATH: contracts/research_arena_v2.py" in workflow
    assert "node scripts/verify-v2-deployed-source.mjs" in workflow


def test_proof_manifest_requires_source_and_economic_paths():
    manifest = json.loads(read("docs/V2_PROOF_MANIFEST.json"))
    assertions = manifest["assertions"]
    assert assertions["deployed_source_match"] is True
    assert assertions["auditable_appeal_verified"] is True
    assert assertions["no_winner_verified"] is True
    assert assertions["refunded"] is True
    assert assertions["all_live_paths_verified"] is True
    assert manifest["v2"]["canonical_contract"] == "0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9"
    assert manifest["v2"]["workflow_run"] == 36349449658
    assert assertions["challenge_window_enforced"] is True
    assert manifest["policy"] == "RA_V2_1_CHALLENGE_WINDOW"
    assert manifest["v2"]["proof_artifact"]["digest"].startswith("sha256:")


def test_public_and_reviewer_v2_proof_manifests_match():
    docs_manifest = json.loads(read("docs/V2_PROOF_MANIFEST.json"))
    public_manifest = json.loads(read("public/v2-proof.json"))
    assert docs_manifest == public_manifest


def test_promotion_docs_keep_production_deploy_last():
    verification = read("docs/V2_VERIFICATION.md")
    source_pos = verification.index("Deployed-source equality is proven.")
    production_pos = verification.index("Only then is the final production deployment performed.")
    assert source_pos < production_pos
    assert "No production deployment is used as a development or debugging loop." in verification


def test_v2_live_test_proves_auditable_challenge_round():
    integration = read("tests/integration/test_studionet_v2_program.py")
    assert 'initial_winner_submission_id' in integration
    assert 'resolution_round' in integration
    assert 'RA_V2_AUDITABLE_APPEAL_VERIFIED=true' in integration


def test_v2_1_challenge_window_is_consistent_across_contract_sdk_and_frontend():
    contract = read("contracts/research_arena_v2.py")
    sdk = read("sdk/src/index.ts")
    page = read("app/v2/page.tsx")
    assert 'CHALLENGE_WINDOW_SECONDS = 60 * 60' in contract
    assert 'RA_V2_1_CHALLENGE_WINDOW' in contract
    assert 'RA_V2_1_CHALLENGE_WINDOW' in sdk
    assert 'RA_V2_1_CHALLENGE_WINDOW' in page
    assert 'get_challenge_deadline' in contract
    assert 'is_settlement_ready' in contract
    assert 'get_challenge_deadline' in page
    assert 'is_settlement_ready' in page
