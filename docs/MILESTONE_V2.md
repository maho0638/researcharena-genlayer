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
   - 24-hour post-deadline stalled-resolution recovery for CLOSED/CHALLENGED states.
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
