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
3. **Close** — sponsor closes early after at least two entries, or waits for the deadline.
4. **Resolve** — GenLayer fetches all live evidence and validators independently judge the same competition.
5. **Claim** — only the consensus-selected researcher can claim the escrowed reward.

## Verified live Studionet deployment

- **Network:** GenLayer Studionet
- **Chain ID:** 61999
- **Contract:** `0x1ca016381CC68dEF3e3028eefdBaDbadf2b80dA2`
- **Explorer:** https://explorer-studio.genlayer.com/address/0x1ca016381CC68dEF3e3028eefdBaDbadf2b80dA2
- **Successful full lifecycle workflow:** https://github.com/maho0638/researcharena-genlayer/actions/runs/35912412402

### Real end-to-end transactions

- Create escrowed bounty: https://explorer-studio.genlayer.com/tx/0xad4b1139b373a2a56981dcf34455e6da52ecebfa1934054ab7cb3141c9d8d5d5
- Submit primary report: https://explorer-studio.genlayer.com/tx/0xbe796ea1d7d3187b3b905897e682edbd4ccd346c5c4a784add109e400484226c
- Submit competing report: https://explorer-studio.genlayer.com/tx/0xfd6bca0f3dc250372033d63b4b416ee1779e1684d0a9f41a05b4e575d7bae46d
- Close submissions: https://explorer-studio.genlayer.com/tx/0xb4ff58beec90ce06b20a6bd62fe13845430a2d718823f48527af2ad7088bd6de
- Resolve by validator consensus: https://explorer-studio.genlayer.com/tx/0x772d1b88fa3b8ef1fca179fa00866b3228a6e9ffa9b5c2f816069bf36cd186b6
- Winner claims reward: https://explorer-studio.genlayer.com/tx/0xf193bdbb97ac9dae55939065718a07e1b0925cbcdc551d547cf6b6be39b3ef34

### Stored result

The live test compared a primary IANA/RFC-backed report against a generic competing report.

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `95/100`
- runner-up score: `20/100`
- agreed reason code: `RUBRIC_FIT`
- reward claimed: `true`

Consensus rationale:

> primary-report won because the report best satisfied the sponsor's precommitted rubric. Score 95/100 vs 20/100.

## Safety and market integrity

- bounty reward must be non-zero
- deadline must be in the future
- 2–5 entry cap keeps consensus evaluation bounded
- one entry per researcher wallet
- bounty creator cannot compete in their own bounty
- three public HTTPS URLs per entry: report + two evidence sources
- duplicate submission IDs rejected
- the two evidence URLs must be distinct and come from independent hostnames
- webpage content is explicitly treated as untrusted input
- validators independently recompute the winner, both settlement scores, and an exact structured reason code
- reward claim is restricted to the stored winner
- claim state is updated before the external transfer
- unfilled bounties have a creator-only refund path; with one entry, refund requires the deadline to pass
- an on-chain bounty index lets clients discover markets without knowing IDs in advance

## Automated checks

The repository includes:

- eight direct contract tests
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
