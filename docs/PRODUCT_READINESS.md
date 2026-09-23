# ResearchArena Product Readiness

ResearchArena is designed as a complete GenLayer application, not a prompt demo.

## Product contract

ResearchArena is a competitive research bounty market.

1. A sponsor publishes a natural-language research question and scoring rubric.
2. Native GEN is escrowed at bounty creation.
3. Independent researcher wallets submit one report each.
4. Each submission carries a report URL plus two HTTPS evidence URLs from distinct hostnames; source authority and actual independence are evaluated from the live content.
5. GenLayer renders the live evidence at settlement time.
6. The leader evaluates all entries under the sponsor's precommitted rubric.
7. Validators independently repeat the evidence review.
8. Consensus requires the same winner and bounded score agreement. Each evaluation must also return a valid structured reason category, while exact category equality is intentionally not required because it is explanatory rather than payout-critical.
9. The accepted settlement is written on-chain.
10. Only the consensus-selected researcher can claim the escrowed GEN.

## Why GenLayer is central

A deterministic smart contract cannot read public research pages and decide which report is better under natural-language criteria. A centralized AI service could make that decision, but counterparties would have to trust one operator.

ResearchArena puts the settlement-critical judgment inside the Intelligent Contract. The UI does not send a finished winner to the chain. It sends stable references and rules; GenLayer performs the web retrieval, evaluation, validator re-execution, consensus, state transition, and payout authorization.

## Reviewer-verifiable surfaces

- Production application: https://researcharena-genlayer.vercel.app
- Source repository: https://github.com/maho0638/researcharena-genlayer
- Intelligent Contract source: `contracts/research_arena.py`
- Direct contract tests: `tests/direct/test_research_arena.py`
- Live Studionet lifecycle test: `tests/integration/test_studionet_full_flow.py`
- CI: `.github/workflows/ci.yml`
- Live deployment verification: `.github/workflows/deploy-studionet.yml`
- Security notes: `docs/SECURITY.md`
- Architecture: `docs/ARCHITECTURE.md`
- Steward walkthrough: `docs/STEWARD_VERIFICATION.md`
- Quality-bar mapping: `docs/QUALITY_BAR.md`
- Machine-readable proof manifest: `public/verified-demo.json`

## Product completeness checklist

- [x] Real use case with adversarial counterparties
- [x] Native escrow and winner payout
- [x] Natural-language decision criteria
- [x] Public evidence fetched by the Intelligent Contract
- [x] Distinct evidence-host requirement plus live authority/independence judgment
- [x] Independent validator re-execution
- [x] Structured consensus fields
- [x] Deterministic human-readable settlement rationale
- [x] Guarded refund path
- [x] One-entry-per-wallet anti-spam rule
- [x] 2–5 participant cap
- [x] On-chain bounty discovery index
- [x] Fair-close rule preventing sponsor truncation before the advertised cap
- [x] Canonical proof state isolated from workspace navigation
- [x] Honest RPC failure fallback that never labels cached proof as live
- [x] Complete frontend transaction lifecycle
- [x] Client-side preflight validation
- [x] Read-only verified demo that needs no wallet
- [x] Explorer links for every canonical lifecycle transaction
- [x] Direct tests and GenVM linting
- [x] Live Studionet end-to-end deployment test
- [x] Production deployment on Vercel
- [x] Reviewer documentation
- [x] Reviewer integrity gate comparing live contract state against the pinned benchmark

## Settlement invariants

The validator does not merely validate JSON shape. It re-runs the evidence review independently and rejects the leader result unless:

- the winner is a valid submitted entry;
- the validator independently chooses the same winner;
- winner and runner-up scores are within the contract's explicit tolerance;
- the runner-up score does not exceed the winner score; and
- both structured reason codes are valid allowed categories; exact category equality is not required because payout safety depends on winner and score convergence.

The displayed rationale is then composed deterministically from accepted settlement fields.

## Marketplace readiness

The contract maintains a bounty index and bounty count so clients can discover markets rather than requiring users to already know a bounty ID. The frontend uses the canonical verified bounty as a reviewer-safe benchmark while supporting the full create, submit, close, resolve, claim and refund lifecycle.

## Limits

ResearchArena is currently deployed on GenLayer Studionet. It is a working prototype with real testnet economic settlement, not a production financial service. Portal point awards are determined by GenLayer reviewers; this repository does not claim or guarantee a specific point score.
