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
- Initial RESOLVED/REJECTED state exposes a one-hour on-chain challenge deadline.
- Claim/refund is blocked while the guaranteed review window is open.
- A participant challenges an unsettled result within that window.
- Claim is blocked in CHALLENGED.
- Fresh consensus runs.
- A late or second challenge is rejected.

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


## Prior canonical V2 proof — 26 September 2026

The previous canonical V2 contract `0xf2dd996300750d880a7db948f41b639e1EA6624A` completed the original V2 lifecycle in workflow `36269260931`. It is retained as historical evidence but is superseded by V2.1.

## Canonical V2.1 proof — 27 September 2026

Workflow `36349449658` completed successfully against the hardened V2.1 source.

- Contract: `0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9`
- Predeploy CI: `36349452189`
- Direct/repository consistency tests: 49 passed
- Deploy input SHA-256: `575981687aa3448b57272f1680ef9e9f6f2a541b5b4662a13ce25b362216b3d4`
- Normalized deployed source SHA-256: `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`
- Normalized repository source SHA-256: `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`
- Source proof: `RA_V2_DEPLOYED_SOURCE_MATCH=true`
- Policy: `RA_V2_1_CHALLENGE_WINDOW`
- Challenge window: 3600 seconds
- Phase 1: initial RESOLVED 95/100 / RUBRIC_FIT; challenge-window enforcement proven; challenge + fresh re-resolution; PAID.
- Phase 2: locked until phase 1 PAID; RESOLVED 95/100 / DIRECTNESS; challenge + fresh re-resolution; PAID.
- Negative path: REJECTED / SOURCE_UNAVAILABLE; challenge + fresh re-resolution; REFUNDED.
- Hostname-normalization bypass tests cover query strings, trailing-dot hostnames and ambiguous userinfo authority forms.
- SDK tests, Next.js production build and both V1/V2 GenVM lint passed.
