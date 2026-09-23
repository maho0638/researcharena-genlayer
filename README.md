# ResearchArena — GenLayer Research Bounty Market

ResearchArena is a GenLayer-native competitive research marketplace with a real on-chain consequence: **native GEN is escrowed when a bounty is created and becomes claimable by the researcher selected through GenLayer validator consensus.**

A sponsor publishes a natural-language research question, scoring rubric, reward, deadline, and entry limit. Independent researchers submit a public report plus two evidence URLs. The Intelligent Contract fetches every report and citation at judgment time, compares the competing submissions under the same rubric, asks validators to independently re-check the proposed winner, stores the result on-chain, and lets the winner claim the escrowed GEN.

## Why GenLayer is central

Research quality is not a deterministic oracle problem. The contract needs to read changing public webpages and make a subjective but auditable judgment across competing evidence.

ResearchArena uses:

- `gl.nondet.web.render` for live reports and sources
- `gl.nondet.exec_prompt` for structured comparative evaluation
- `gl.vm.run_nondet_unsafe` with a custom validator function
- `@gl.public.write.payable` and `gl.message.value` for native GEN escrow
- GenLayer value transfer for winner payout

The project is not a chatbot or an LLM wrapper. The consensus result determines who can claim the locked reward.

## Market lifecycle

1. **Create bounty** — sponsor locks GEN and commits to the question/rubric.
2. **Compete** — 2–5 independent wallets submit one report each, with two distinct HTTPS evidence sources.
3. **Close** — the sponsor can close before the deadline only when the declared entry cap is full; otherwise the market stays open until the deadline.
4. **Resolve** — GenLayer fetches all live evidence and validators independently judge the same competition.
5. **Claim** — only the consensus-selected researcher can claim the escrowed reward.

## Verified live Studionet deployment

- **Network:** GenLayer Studionet
- **Chain ID:** 61999
- **Contract:** `0x3877C0a69a42a01c9c6a4708aCca25bA5573814C`
- **Explorer:** https://explorer-studio.genlayer.com/address/0x3877C0a69a42a01c9c6a4708aCca25bA5573814C
- **Successful full lifecycle workflow:** https://github.com/maho0638/researcharena-genlayer/actions/runs/35918043606

### Real end-to-end transactions

- Create escrowed bounty: https://explorer-studio.genlayer.com/tx/0x926e60299187d2b00106b7b3db49b5983b0f39f9e5cb7803da8187ecacdb52b1
- Submit primary report: https://explorer-studio.genlayer.com/tx/0xdb1febe4ee75e62840789ba08009be3fc7cf88fdb88801dee0733df5bc8dfeb0
- Submit competing report: https://explorer-studio.genlayer.com/tx/0x6783c4df8188c817574cc3529bcd67928fa942e64c65c3e280fa73026afefde4
- Close submissions: https://explorer-studio.genlayer.com/tx/0x8bc3d071e8580b3dd544b358d40b46a30007cc080f1fdd24efbe94238b62b18e
- Resolve by validator consensus: https://explorer-studio.genlayer.com/tx/0x014a214af5be604a1c4dfd5b825c08facb3d203f661fa4c32983d1ac3e8bda06
- Winner claims reward: https://explorer-studio.genlayer.com/tx/0x262268fff6d4a0e875ec44119883aeb459528d4279a01d45d471af4b78299e3f

### Stored result

The live test compared a primary IANA/RFC-backed report against a generic competing report.

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `98/100`
- runner-up score: `32/100`
- stored structured reason code: `RUBRIC_FIT`
- reward claimed: `true`

Consensus rationale:

> primary-report won because the report best satisfied the sponsor's precommitted rubric. Score 98/100 vs 32/100.

## Safety and market integrity

- bounty reward must be non-zero
- deadline must be in the future
- 2–5 entry cap keeps consensus evaluation bounded
- one entry per researcher wallet
- bounty creator cannot compete in their own bounty
- three public HTTPS URLs per entry: report + two evidence sources
- duplicate submission IDs rejected
- the two evidence URLs must be distinct and use different hostnames; source authority and real independence remain part of the live evidence judgment
- webpage content is explicitly treated as untrusted input
- validators independently recompute the winner and both settlement scores; the leader's structured reason code is schema-validated and stored as explanatory metadata
- reward claim is restricted to the stored winner
- claim state is updated before the external transfer
- unfilled bounties have a creator-only refund path; with one entry, refund requires the deadline to pass
- an on-chain bounty index lets clients discover markets without knowing IDs in advance
- sponsors cannot truncate a still-open competition before the advertised entry cap is full

## Automated checks

The repository includes:

- nine direct contract tests
- GenVM lint and validation
- Next.js production build
- live Studionet end-to-end integration workflow

## Source map

- Intelligent Contract: `contracts/research_arena.py`
- Direct tests: `tests/direct/test_research_arena.py`
- Live integration test: `tests/integration/test_studionet_full_flow.py`
- Frontend: `app/page.tsx`
- GenLayer browser client: `lib/genlayer.ts`
- CI: `.github/workflows/ci.yml`
- Studionet deployment: `.github/workflows/deploy-studionet.yml`
- Submission dossier: `PROJECT_SUBMISSION.md`
- Steward verification: `docs/STEWARD_VERIFICATION.md`
- Architecture: `docs/ARCHITECTURE.md`
- Security/failure modes: `docs/SECURITY.md`
- Machine-readable live proof: `public/verified-demo.json`
- Product readiness checklist: `docs/PRODUCT_READINESS.md`
