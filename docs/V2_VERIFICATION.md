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
- Leader/validator winner and snapshots converge.

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
