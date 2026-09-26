import test from "node:test";
import assert from "node:assert/strict";
import {
  RESEARCHARENA_V2_POLICY,
  auditBounty,
  createProgramPhaseRequest,
  refundRejectedRequest,
  recoverStalledRequest,
} from "../dist/index.js";

test("audit accepts a settled V2 bounty", () => {
  const result = auditBounty({
    status: "PAID",
    winning_score: 92,
    reason_code: "RUBRIC_FIT",
    reward_claimed: true,
    resolution_round: 1,
    policy_version: RESEARCHARENA_V2_POLICY,
  });
  assert.equal(result.ok, true);
});

test("audit rejects a resolved winner below threshold", () => {
  const result = auditBounty({
    status: "RESOLVED",
    winning_score: 61,
    reason_code: "RUBRIC_FIT",
    reward_claimed: false,
    resolution_round: 1,
    policy_version: RESEARCHARENA_V2_POLICY,
  });
  assert.equal(result.ok, false);
  assert.equal(result.checks.winnerThreshold, false);
});

test("program phase request preserves dependency and escrow", () => {
  const request = createProgramPhaseRequest({
    address: "0x1111111111111111111111111111111111111111",
    programId: "program",
    bountyId: "phase-2",
    prerequisiteBountyId: "phase-1",
    question: "Which evidence-backed report best answers the research question?",
    rubric: "Prefer direct authoritative independently corroborated evidence.",
    deadline: 1000n,
    maxSubmissions: 3n,
    reward: 500n,
  });
  assert.equal(request.functionName, "create_program_phase");
  assert.equal(request.args[2], "phase-1");
  assert.equal(request.value, 500n);
});


test("audit requires challenge history after a second resolution round", () => {
  const result = auditBounty({
    status: "RESOLVED",
    winner_submission_id: "entry-2",
    winning_score: 91,
    reason_code: "RUBRIC_FIT",
    reward_claimed: false,
    challenge_count: 1,
    challenge_note: "",
    resolution_round: 2,
    initial_recorded: true,
    initial_reason_code: "INDEPENDENT_CORROBORATION",
    policy_version: RESEARCHARENA_V2_POLICY,
  });
  assert.equal(result.ok, false);
  assert.equal(result.checks.challengedRoundAuditable, false);
});

test("audit accepts preserved challenge history after a fresh round", () => {
  const result = auditBounty({
    status: "RESOLVED",
    winner_submission_id: "entry-2",
    winning_score: 91,
    reason_code: "RUBRIC_FIT",
    reward_claimed: false,
    challenge_count: 1,
    challenge_note: "Fresh evidence review requested before settlement.",
    resolution_round: 2,
    initial_recorded: true,
    initial_reason_code: "INDEPENDENT_CORROBORATION",
    policy_version: RESEARCHARENA_V2_POLICY,
  });
  assert.equal(result.ok, true);
});

test("refund and stalled-recovery request builders map to contract entrypoints", () => {
  const address = "0x1111111111111111111111111111111111111111";
  assert.equal(refundRejectedRequest(address, "bounty").functionName, "refund_rejected");
  assert.equal(recoverStalledRequest(address, "bounty").functionName, "recover_stalled_bounty");
});
