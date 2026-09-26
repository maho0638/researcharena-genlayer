# ResearchArena V2 Milestone — Evidence-Bound Research Programs

ResearchArena V1 was accepted as a competitive research bounty market with native GEN escrow and consensus-selected payout. V2 is intentionally a protocol milestone, not a resubmission of the accepted project.

## What V2 adds

1. Composable multi-phase research programs
   - Up to 8 ordered phases per program.
   - A later phase cannot accept research until its prerequisite phase is actually PAID.
   - Each phase has independent GEN escrow, rubric, deadline and participant set.
   - Program-level progress and settled-value views are exposed on-chain.

2. Evidence-bound consensus
   - Winner settlement requires a minimum score of 70/100.
   - The leader and validators independently refetch the same live report and two independent sources.
   - The winning report and source snapshots are stored with the settlement.
   - Unavailable evidence fails closed.
   - No-winner outcomes are explicit and refundable instead of forcing a weak winner.

3. One-shot challenge and fresh consensus
   - Sponsor or any participating researcher can challenge an unsettled result once.
   - Settlement is blocked while CHALLENGED.
   - resolve_challenge performs a fresh evidence fetch and consensus pass.
   - Outsiders and second challenges are rejected.

4. Researcher settlement history
   - On-chain stats expose submissions, paid wins, challenges raised and total GEN earned.
   - This is objective settlement history, not an opaque reputation score.

5. Economic recovery paths
   - Winner-only claims.
   - Explicit refund for no-winner REJECTED outcomes.
   - Existing unfilled-market refund.
   - 24-hour stalled-resolution recovery measured from the actual CLOSED or CHALLENGED state transition.
   - Settlement state changes before external transfer.

6. Reusable SDK
   - TypeScript client for bounty/program reads.
   - Program listing and researcher stats.
   - Settlement auditing.
   - Request builders for program phases, submissions, challenges and claims.

## Promotion gates

V2 must not replace the accepted V1 deployment until all of these pass:

- V1 regression tests
- V2 direct tests
- GenVM lint/validation
- SDK build/tests
- frontend production build
- live Studionet multi-phase lifecycle
- live challenge path
- live no-winner/refund path
- deployed-source equality proof
- reviewer-facing machine-readable evidence

The accepted V1 contract remains untouched while V2 is developed and verified on the researcharena-v2-protocol branch.


## Scoring-oriented evidence discipline

The Portal score is not assumed or guaranteed. V2 is structured so a steward can independently verify the size of the milestone rather than infer it from feature claims:

- every major capability maps to contract state and a direct test;
- the live workflow proves positive, challenge, multi-phase, and no-winner/refund paths;
- source provenance proves the deployed contract is the repository contract;
- the V1 accepted baseline remains untouched so the milestone delta is auditable;
- Vercel deployment is deliberately disabled during development and happens only after the full promotion checklist passes.


## Consensus hardening after live failure diagnosis

A pre-production Studionet proof exposed two distinct external/consensus failure modes before V2 promotion:

- one run hit a GenLayer RPC HTTP 502 before a phase-2 resolution transaction was submitted;
- a controlled retry submitted phase-2 resolution, but that transaction was canceled as `NO_MAJORITY` after recovery cycles.

The second result showed that byte-for-byte equality of independently rendered web snapshots was too strict for live public pages. V2 now follows GenLayer's material-equivalence pattern: every validator independently refetches the immutable evidence URLs and independently re-runs the research judgment, while consensus compares the stable economic decision (same winner / no-winner outcome and threshold validity). The leader's fetched snapshots are still stored on-chain as audit evidence, but harmless dynamic page-text differences no longer veto an otherwise identical settlement.

Direct validator tests explicitly cover:
- same winner with changed live page text -> agree;
- different winner -> disagree;
- winner below 70/100 -> disagree;
- no-winner with a different allowed failure classification -> agree.

The failed pre-production candidate addresses are historical diagnostics only and are not canonical V2 deployments.


## Canonical V2 proof — 26 September 2026

The final post-hardening Studionet lifecycle completed successfully in workflow `36269260931`.

- Contract: `0xf2dd996300750d880a7db948f41b639e1EA6624A`
- Predeploy CI: `36268953560` — 42 tests, V1/V2 GenVM lint, SDK tests, integration syntax check and production frontend build all passed.
- Deploy input SHA-256: `c5f6981a2d1660cf16de3a070640885e0f96fe499486a022556389b2aff9884f`
- Normalized deployed source SHA-256: `a1c3807c5a2fbe31fa1a0a0cca655f5816e735292dab81700f3295ca19396eba`
- Normalized repository source SHA-256: `a1c3807c5a2fbe31fa1a0a0cca655f5816e735292dab81700f3295ca19396eba`
- Source proof: `RA_V2_DEPLOYED_SOURCE_MATCH=true`
- Phase 1: RESOLVED at 96/100, challenged once, freshly re-resolved, then PAID.
- Phase 2: remained locked until phase 1 was PAID, then RESOLVED at 85/100 and PAID.
- Negative path: unavailable evidence produced REJECTED / SOURCE_UNAVAILABLE and sponsor refund produced REFUNDED.
- Program aggregate and researcher settlement-history assertions passed.

Canonical transaction evidence:
- phase 1 create: `0x93e68875bb65008b95f43aaf7f7b8cb0363a6ea6a05e12e7d2c2c329250c2acf`
- phase 2 create: `0x21e54db046b08432b3fb5cb9c1f8eea71c4ba5b7ee1fdc0a23f69374b80e49eb`
- phase 1 resolve: `0x1319d7934509da5f15422491df1deda6cffde94f7ac3115df2d339853dc317e6`
- challenge: `0xefe48f84a4961f9486cfc1ee4d579e91b865be79009b0b4b47de36f7898d8632`
- challenge re-resolution: `0x9fdc4e5f7907e2144a6a1752b2a6734f7fab0e4063c37004f7713dd652d713f7`
- phase 1 claim: `0x70de023e84813be5267e79ca5b21dedb4e977b3c6d74f557986b299dbb20082b`
- phase 2 resolve: `0x539ee0d448d52fa618821eee87ed085e7a7710a3c897d3800e2df5e58800409f`
- phase 2 claim: `0x9fdcf842c2100bd6a0dcd5bdc59e0424c0dc064f229fb85f154b9384448b1484`
- rejected-market resolve: `0xcffe1830184ca62727bbd29853b793237dffc402f9e6ed40b5dc9c77733ab2be`
- rejected-market refund: `0xc52ff8ceda1159d90f1f254fc7c48c1aed4d98233c804d306201213986b3e2a2`
