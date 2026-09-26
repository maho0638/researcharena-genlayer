# ResearchArena V2 Reviewer Verification Plan

This checklist is designed to make the milestone independently reproducible.

## Baseline

Accepted V1:
- Contract: 0x3877C0a69a42a01c9c6a4708aCca25bA5573814C
- Accepted contribution score: 380 points
- V1 full lifecycle: create -> two submissions -> close -> consensus resolve -> winner claim

## Required V2 proofs before submission

A. Ordered program proof
- Create a two-phase program.
- Phase 2 exists on-chain but rejects submissions while phase 1 is unsettled.
- Phase 1 resolves and pays.
- Phase 2 becomes unlocked.
- Program progress shows two phases and cumulative escrow.

B. Evidence-bound winner proof
- Three HTTPS URLs per submission remain immutable after entry.
- Winner snapshots are stored on-chain.
- Winner score is at least 70.
- Leader and validators independently refetch the immutable evidence URLs; the material winner/no-winner outcome and threshold validity converge. Snapshot text is stored for audit but is not required to be byte-identical across dynamic webpages.

C. No-winner proof
- Weak or unavailable evidence produces REJECTED.
- No winner can claim.
- Sponsor refunds the escrow.

D. Challenge proof
- A participant challenges an unsettled result.
- Claim is blocked in CHALLENGED.
- Fresh consensus runs.
- A second challenge is rejected.

E. Researcher history proof
- Submission count increments per wallet.
- Paid win and total earned update only after settlement.
- Challenge count increments only for participant challenges.

F. Source provenance
- Deployed contract source must normalize to the exact repository file.
- Verification workflow must print the SHA-256 of the deploy input.

## Evidence package

The final milestone submission should include:
- V2 Explorer contract
- production app
- short walkthrough video
- GitHub repository
- live verification workflow artifact with transaction markers
- machine-readable V2 proof manifest
- source-match proof
- milestone diff document


## Promotion order

1. Direct tests and both V1/V2 GenVM lint pass.
2. SDK build/tests pass.
3. Frontend production build passes.
4. Manual Studionet proof passes once against the final source.
5. Deployed-source equality is proven.
6. Canonical address is pinned into the V2 reviewer evidence.
7. Only then is the final production deployment performed.

No production deployment is used as a development or debugging loop.


## Diagnosed pre-production failures

Do not treat these diagnostic candidates as canonical:
- `0x55e860F07f9ab084a805E603d7dd738466675a3F` — live proof was interrupted by a Studionet HTTP 502 before phase-2 resolve submission.
- `0xb0DEE3Edd4DD090693B7179D432A0ea492D9063B` — phase-2 resolve transaction `0xd83ae6ca70290ddd6f9d5b920a2be3d44c7d2c91e290b1b2831a9dd00d81aa01` was canceled as `NO_MAJORITY` / `max_recovery_cycles_exceeded`.

The second failure led to the material-equivalence validator hardening. A new canonical deployment must be created only after the updated direct validator tests, GenVM lint, SDK tests, and frontend build all pass.


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
