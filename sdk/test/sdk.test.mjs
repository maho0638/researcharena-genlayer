import test from "node:test";
import assert from "node:assert/strict";
import {
  RESEARCHARENA_V2_POLICY,
  auditBounty,
  createProgramPhaseRequest,
} from "../dist/index.js";

test("audit accepts a settled V2 bounty", () => {
  const result = auditBounty({
    status: "PAID",
    winning_score: 92,
    reason_code: "RUBRIC_FIT",
    reward_claimed: true,
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
