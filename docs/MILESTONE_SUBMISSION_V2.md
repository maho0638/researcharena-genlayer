# ResearchArena V2.1 — Milestone Submission Dossier

## Suggested title

ResearchArena V2.1 — Evidence-Bound Multi-Phase Research Programs

## One-sentence summary

ResearchArena V2.1 turns the accepted V1 research bounty market into a composable multi-phase research settlement protocol where sequential GEN escrows unlock only after prior phases are paid, live evidence is re-evaluated by GenLayer consensus, a guaranteed one-hour review window prevents claim/refund races, results can be challenged once with fresh consensus, and both positive and no-winner/refund paths are independently verifiable.

## What changed from the accepted V1

The accepted V1 contribution (380 points) proved one competitive research bounty: sponsor locks GEN, researchers submit reports and evidence, GenLayer consensus selects one winner, and that winner claims the escrow.

V2.1 is a protocol-level milestone rather than a resubmission. It adds:

- ordered research programs of up to 8 dependent phases;
- independent native GEN escrow per phase;
- prerequisite settlement gating — later phases remain locked until the previous phase is actually PAID;
- a 70/100 minimum winner threshold;
- explicit no-winner REJECTED outcomes and sponsor refunds;
- live evidence snapshots stored on-chain for the selected result;
- guaranteed one-hour challenge window before the first claim/refund;
- one-shot sponsor/participant challenge with a fresh consensus round;
- preserved initial verdict, challenge note, and resolution round for auditable appeals;
- material-equivalence validator hardening for dynamic public web evidence;
- contract-side evidence-host normalization that blocks query/trailing-dot/userinfo independence bypasses;
- researcher settlement history and program aggregate views;
- stalled CLOSED/CHALLENGED recovery measured from the actual state-transition time;
- reusable TypeScript SDK;
- dedicated V2 frontend workspace;
- expanded automated and live verification.

## Why GenLayer is essential

The contract settles real native GEN based on a subjective research judgment over changing public webpages. It uses live web rendering, structured LLM evaluation, and validator re-execution. A deterministic smart contract cannot decide which competing research report best satisfies a natural-language rubric using current web evidence.

Validators independently refetch the immutable evidence URLs and independently re-evaluate the competition. Consensus compares the stable economic outcome rather than byte-identical page text, while the leader's fetched winner snapshots are stored on-chain for auditability.

## Canonical proof

- Network: GenLayer Studionet
- Chain ID: 61999
- V2.1 contract: `0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9`
- Explorer: https://explorer-studio.genlayer.com/address/0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9
- Canonical live workflow: https://github.com/maho0638/researcharena-genlayer/actions/runs/36349449658
- Predeploy CI: https://github.com/maho0638/researcharena-genlayer/actions/runs/36349452189
- Repository: https://github.com/maho0638/researcharena-genlayer
- Production V2 route: https://researcharena-genlayer.vercel.app/v2
- Machine-readable proof: https://researcharena-genlayer.vercel.app/v2-proof.json

## Verified lifecycle

Canonical workflow `36349449658` completed successfully.

Phase 1:
- result: RESOLVED
- winner: `ra-v2-evidence-phase-primary`
- score: 95/100
- reason: RUBRIC_FIT
- evidence snapshots stored
- one-hour challenge window enforcement proven
- challenged once and freshly re-resolved
- final state: PAID

Phase 2:
- existed on-chain but remained locked before phase 1 settlement
- unlocked only after phase 1 became PAID
- result: RESOLVED
- winner: `ra-v2-synthesis-phase-primary`
- score: 95/100
- reason: DIRECTNESS
- challenged and freshly re-resolved before payout
- final state: PAID

Negative path:
- unavailable evidence produced no winner
- result: REJECTED
- reason: SOURCE_UNAVAILABLE
- challenge/re-resolution exercised before refund
- sponsor refund completed
- final state: REFUNDED

## Verification quality

Predeploy CI proved:
- 49 direct/repository consistency tests pass on the V2.1 predeploy branch, including guaranteed-settlement-window and hostname-normalization bypass coverage;
- explicit validator tests cover dynamic snapshot text, different-winner disagreement, below-threshold disagreement and materially equivalent no-winner agreement;
- V1 and V2 GenVM lint/validation pass;
- integration test syntax check passes;
- SDK build/tests pass;
- Next.js production build passes.

Live verification proved:
- two dependent escrow phases;
- real GEN claims;
- challenge/re-resolution;
- evidence snapshots;
- program aggregate state;
- researcher settlement history;
- no-winner failure handling;
- rejected escrow refund;
- exact deployed-source equality.

Normalized deployed and repository source SHA-256:
`4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`

`RA_V2_DEPLOYED_SOURCE_MATCH=true`

## Suggested Portal “What changed?”

ResearchArena V2.1 is a protocol-level milestone beyond the accepted V1 bounty market. It adds ordered multi-phase research programs with independent GEN escrow per phase, prerequisite payout gating, a 70/100 settlement threshold, explicit no-winner/refund handling, on-chain winner evidence snapshots, one-shot challenges with fresh consensus, preserved initial verdict/challenge history, researcher settlement statistics, stalled-resolution recovery and a reusable TypeScript SDK. V2.1 additionally guarantees a one-hour on-chain challenge window before an initial claim/refund and hardens contract-side hostname normalization against evidence-independence bypasses. The final Studionet contract 0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9 completed the full two-phase, challenge, payout and rejected/refund lifecycle in workflow 36349449658. 49 direct/repository tests, V1/V2 GenVM lint, SDK tests and frontend production build pass; exact deployed-source matching also passes.

## Suggested expected verification

The canonical V2.1 Studionet contract is `0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9`. In workflow `36349449658`, phase 1 resolved at 95/100, exposed the guaranteed challenge window, was challenged and freshly re-resolved, then paid; phase 2 remained locked until phase 1 was paid, then resolved at 95/100, was challenge-tested and paid. A separate unavailable-evidence market was rejected with no winner, challenge-tested and refunded. Workflow `36349452189` proves the 49-test/lint/SDK/frontend predeploy gates, while the canonical workflow proves `RA_V2_DEPLOYED_SOURCE_MATCH=true` with identical normalized deployed/repository SHA-256 `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`.

## Evidence order for Portal

1. Production V2.1 route: https://researcharena-genlayer.vercel.app/v2
2. Canonical contract Explorer: https://explorer-studio.genlayer.com/address/0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9
3. Canonical live lifecycle workflow: https://github.com/maho0638/researcharena-genlayer/actions/runs/36349449658
4. Repository: https://github.com/maho0638/researcharena-genlayer
5. Predeploy CI: https://github.com/maho0638/researcharena-genlayer/actions/runs/36349452189
6. Machine-readable proof: https://researcharena-genlayer.vercel.app/v2-proof.json

The production links above must be smoke-verified after the controlled production promotion before Portal submission.
