# ResearchArena V2.1 Milestone — Evidence-Bound Research Programs

ResearchArena V1 was accepted as a competitive research bounty market with native GEN escrow and consensus-selected payout. V2.1 is intentionally a protocol milestone, not a resubmission of the accepted project; it includes the multi-phase V2 protocol plus settlement-race and evidence-host hardening.

## What V2.1 adds

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

3. Guaranteed challenge window + fresh consensus
   - The first RESOLVED or REJECTED result opens a one-hour guaranteed review window.
   - Claim/refund cannot race ahead of an authorized challenge during that window.
   - Sponsor or any participating researcher can challenge once.
   - resolve_challenge performs a fresh evidence fetch and consensus pass; the re-resolved result can then settle.
   - Outsiders, late challenges and second challenges are rejected.

4. Evidence-host normalization hardening
   - Contract-side hostname parsing normalizes query/fragment/trailing-dot forms.
   - Ambiguous userinfo/backslash authority forms are rejected.
   - The same effective evidence host cannot masquerade as two independent domains.

5. Researcher settlement history
   - On-chain stats expose submissions, paid wins, challenges raised and total GEN earned.
   - This is objective settlement history, not an opaque reputation score.

6. Economic recovery paths
   - Winner-only claims.
   - Explicit refund for no-winner REJECTED outcomes.
   - Existing unfilled-market refund.
   - 24-hour stalled-resolution recovery measured from the actual CLOSED or CHALLENGED state transition.
   - Settlement state changes before external transfer.

7. Reusable SDK
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


## Canonical V2.1 proof — 27 September 2026

The final V2.1 Studionet lifecycle completed successfully in workflow `36349449658`.

- Contract: `0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9`
- Predeploy CI: `36349452189` — 49 direct/repository consistency tests, V1/V2 GenVM lint, SDK tests, integration syntax check and production frontend build passed.
- Deploy input SHA-256: `575981687aa3448b57272f1680ef9e9f6f2a541b5b4662a13ce25b362216b3d4`
- Normalized deployed source SHA-256: `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`
- Normalized repository source SHA-256: `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`
- Source proof: `RA_V2_DEPLOYED_SOURCE_MATCH=true`
- Phase 1: RESOLVED at 95/100, the one-hour challenge window was proven active, challenged once, freshly re-resolved, then PAID.
- Phase 2: remained locked until phase 1 was PAID, then RESOLVED at 95/100, challenge-tested and PAID.
- Negative path: unavailable evidence produced REJECTED / SOURCE_UNAVAILABLE, its challenge path was exercised, and sponsor refund produced REFUNDED.
- Program aggregate and researcher settlement-history assertions passed.

Canonical transaction evidence:
- phase 1 create: `0x0ee9ccc8488e861f252e1c7beb890d1849a8b3f89aa1f25bc05f8198bbe7ca85`
- phase 2 create: `0xef7708d74c18fad5f64ec9ad28e176fa6003965ef69aa5344ad00d582f663774`
- phase 1 resolve: `0xb43e0242eda2c52304e578582684d47f43c5784cd9fffa293aed8d560f759ad5`
- phase 1 challenge: `0xcbed1d473c19d192d96a3bc4528c55aa509de8da8978304aa2781d2fb59dac0a`
- phase 1 re-resolution: `0x5506f5548beee7b7cb1a335f51a05dd0da390f2728f04b4906f950f5f27595b9`
- phase 1 claim: `0x156eae5471e502797bd3c5db149ccb11ed44d8cd70e99420a57a9dcaa18c0ca5`
- phase 2 resolve: `0x830ccf3315f66965280050ce591dab0742157831338e415b4770346d31122173`
- phase 2 challenge: `0xb2d13a86bcbe57f4ca85679bc07032f94c2b5efcd057de8a63713bdaffaa6291`
- phase 2 claim: `0xda4cbdc3421b32555c121d1dfa3e7320d73486057eb9e442df2639f4fd0a7c80`
- rejected-market resolve: `0x4366037ff75a4e6971206e18047e1a27c6030b1b05065799a57eb58d38f96b4a`
- rejected-market challenge: `0x711ea39de2f32f9d6820e491d176e41fe68fabe50fc48aecb321321cf9cd3d04`
- rejected-market refund: `0x31de750c2c8cc10301dab6eaad31ee97bd44db2872e1c1f061f034e422491d91`
