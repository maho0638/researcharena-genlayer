# Architecture

## Trust boundary

ResearchArena keeps UX in the frontend and puts the consensus-critical decision in the Intelligent Contract.

- **Frontend:** wallet connection, forms, transaction lifecycle, and read-only inspection.
- **Intelligent Contract:** escrow state, entry rules, evidence retrieval, comparative evaluation, validator consensus, winner selection, refund rules, and payout authorization.
- **Validators:** independently fetch the same public evidence and re-run the same research comparison.
- **Evidence:** public HTTPS report URL plus two public HTTPS supporting sources per entry.

No frontend score or backend opinion can select the winner.

## Settlement flow

1. `create_bounty` locks native GEN with a fixed question, rubric, deadline, and entry cap.
2. `submit_research` accepts one bounded entry per researcher.
3. `close_bounty` freezes submissions once at least two entries exist.
4. `resolve_bounty` renders each report and its evidence inside the non-deterministic block.
5. The leader returns a compact structured result: winner ID, winner score, runner-up score, rationale.
6. Validators independently repeat the full evidence review.
7. Consensus requires the same winner and bounded agreement on both numeric scores.
8. Deterministic contract state records the accepted result.
9. `claim_reward` authorizes only the stored winner to receive the escrowed GEN.

## Why the validator is substantive

The validator does not merely check JSON shape. It performs the evidence retrieval and LLM comparison again, independently, then compares the fields that matter to settlement.

## Bounded evaluation

The market accepts 2–5 entries. Each entry is bounded to a report plus two evidence URLs, and fetched text is capped before prompting. This limits cost and keeps validator work reproducible.
