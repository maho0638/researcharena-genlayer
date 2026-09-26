# ResearchArena V2 — Milestone Submission Dossier

## Suggested title

ResearchArena V2 — Evidence-Bound Multi-Phase Research Programs

## One-sentence summary

ResearchArena V2 turns the accepted V1 research bounty market into a composable multi-phase research settlement protocol where sequential GEN escrows unlock only after prior phases are paid, live evidence is re-evaluated by GenLayer consensus, results can be challenged once before settlement, and both positive and no-winner/refund paths are independently verifiable.

## What changed from the accepted V1

The accepted V1 contribution (380 points) proved one competitive research bounty: sponsor locks GEN, researchers submit reports and evidence, GenLayer consensus selects one winner, and that winner claims the escrow.

V2 is a protocol-level milestone rather than a resubmission. It adds:

- ordered research programs of up to 8 dependent phases;
- independent native GEN escrow per phase;
- prerequisite settlement gating — later phases remain locked until the previous phase is actually PAID;
- a 70/100 minimum winner threshold;
- explicit no-winner REJECTED outcomes and sponsor refunds;
- live evidence snapshots stored on-chain for the selected result;
- one-shot sponsor/participant challenge with a fresh consensus round;
- preserved initial verdict, challenge note, and resolution round for auditable appeals;
- material-equivalence validator hardening for dynamic public web evidence;
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
- V2 contract: `0xf2dd996300750d880a7db948f41b639e1EA6624A`
- Explorer: https://explorer-studio.genlayer.com/address/0xf2dd996300750d880a7db948f41b639e1EA6624A
- Canonical live workflow: https://github.com/maho0638/researcharena-genlayer/actions/runs/36269260931
- Predeploy CI: https://github.com/maho0638/researcharena-genlayer/actions/runs/36268953560
- Repository: https://github.com/maho0638/researcharena-genlayer
- Production V2 route: https://researcharena-genlayer.vercel.app/v2
- Machine-readable proof: https://researcharena-genlayer.vercel.app/v2-proof.json

## Verified lifecycle

Canonical workflow `36269260931` completed successfully.

Phase 1:
- result: RESOLVED
- winner: `ra-v2-evidence-phase-primary`
- score: 96/100
- reason: RUBRIC_FIT
- evidence snapshots stored
- challenged once and freshly re-resolved
- final state: PAID

Phase 2:
- existed on-chain but remained locked before phase 1 settlement
- unlocked only after phase 1 became PAID
- result: RESOLVED
- winner: `ra-v2-synthesis-phase-primary`
- score: 85/100
- reason: DIRECTNESS
- final state: PAID

Negative path:
- unavailable evidence produced no winner
- result: REJECTED
- reason: SOURCE_UNAVAILABLE
- sponsor refund completed
- final state: REFUNDED

## Verification quality

Predeploy CI proved:
- 43 direct/repository consistency tests pass on the final reviewer branch; the canonical contract itself was deployed only after the 42-test predeploy gate was green;
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
`a1c3807c5a2fbe31fa1a0a0cca655f5816e735292dab81700f3295ca19396eba`

`RA_V2_DEPLOYED_SOURCE_MATCH=true`

## Suggested Portal “What changed?”

ResearchArena V2 is a protocol-level milestone beyond the accepted V1 bounty market. It adds ordered multi-phase research programs with independent GEN escrow per phase, prerequisite payout gating, a 70/100 settlement threshold, explicit no-winner/refund handling, on-chain winner evidence snapshots, one-shot challenges with fresh consensus, preserved initial verdict/challenge history, researcher settlement statistics, stalled-resolution recovery and a reusable TypeScript SDK. After diagnosing a live NO_MAJORITY case caused by byte-exact dynamic web snapshots, validator logic was hardened to independently refetch immutable evidence and compare the stable economic outcome. The final Studionet contract 0xf2dd996300750d880a7db948f41b639e1EA6624A completed the full two-phase, challenge, payout and rejected/refund lifecycle in workflow 36269260931. 43 final reviewer-branch tests, V1/V2 GenVM lint, SDK tests and frontend production build pass; the canonical contract was deployed after the 42-test predeploy gate and exact deployed-source matching also passes.

## Suggested expected verification

The canonical V2 Studionet contract is `0xf2dd996300750d880a7db948f41b639e1EA6624A`. In workflow `36269260931`, phase 1 resolved at 96/100, was challenged and freshly re-resolved, then paid; phase 2 remained locked until phase 1 was paid, then resolved at 85/100 and paid. A separate unavailable-evidence market was rejected with no winner and refunded. Workflow `36268953560` proves the predeploy 42-test/lint/SDK/frontend gates, while the canonical workflow proves `RA_V2_DEPLOYED_SOURCE_MATCH=true` with identical normalized deployed/repository SHA-256 `a1c3807c5a2fbe31fa1a0a0cca655f5816e735292dab81700f3295ca19396eba`.

## Evidence order for Portal

1. Production V2: https://researcharena-genlayer.vercel.app/v2
2. Canonical contract Explorer: https://explorer-studio.genlayer.com/address/0xf2dd996300750d880a7db948f41b639e1EA6624A
3. Canonical live lifecycle workflow: https://github.com/maho0638/researcharena-genlayer/actions/runs/36269260931
4. Repository: https://github.com/maho0638/researcharena-genlayer
5. Predeploy CI: https://github.com/maho0638/researcharena-genlayer/actions/runs/36268953560
6. Machine-readable proof: https://researcharena-genlayer.vercel.app/v2-proof.json

The production links above are intended for the final deployment step and must be smoke-verified before Portal submission.
