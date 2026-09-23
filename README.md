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
- **Contract:** `0x6def481601D1c8A81Ca17F8ad4e02725471a72E7`
- **Explorer:** https://explorer-studio.genlayer.com/address/0x6def481601D1c8A81Ca17F8ad4e02725471a72E7
- **Successful full lifecycle workflow:** https://github.com/maho0638/researcharena-genlayer/actions/runs/35855964117

### Real end-to-end transactions

- Create escrowed bounty: https://explorer-studio.genlayer.com/tx/0xb006507d076b11f0e6a0b643c7b2672c0db97b5919d5133fab6424f50e352a4d
- Submit primary report: https://explorer-studio.genlayer.com/tx/0x561c2824cc7a8c01b2d7424dab4e19b1afc3f8c3f9ea64ca6931290979aaad80
- Submit competing report: https://explorer-studio.genlayer.com/tx/0xc191928f77a43bc39c1e6f1cdbf274bf9551982f86db610230e06d0db96915c4
- Close submissions: https://explorer-studio.genlayer.com/tx/0xc5abe1793c4ba359cc9d59cb519be5c117c7b7759f605f328118621842be12ad
- Resolve by validator consensus: https://explorer-studio.genlayer.com/tx/0x485135e7c20175db1ddec96c954d1b061e81172609454276f8842348fe4b72f2
- Winner claims reward: https://explorer-studio.genlayer.com/tx/0x22abe8fd863cc4d3a6225881d64ad3d6ca3f8ddc180ec44360bec51ec0986f34

### Stored result

The live test compared a primary IANA/RFC-backed report against a generic competing report.

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `95/100`
- runner-up score: `25/100`
- reward claimed: `true`

Consensus rationale:

> primary-report cites IANA's dedicated example-domains page that explicitly names example.com and references RFC 2606/RFC 6761, plus example.com's own notice. generic-report only provides generic homepages and example.org without direct, authoritative support for example.com.

## Safety and market integrity

- bounty reward must be non-zero
- deadline must be in the future
- 2–5 entry cap keeps consensus evaluation bounded
- one entry per researcher wallet
- bounty creator cannot compete in their own bounty
- three public HTTPS URLs per entry: report + two evidence sources
- duplicate submission IDs rejected
- the two evidence URLs must be distinct
- webpage content is explicitly treated as untrusted input
- validators independently recompute the winner and both settlement scores
- reward claim is restricted to the stored winner
- claim state is updated before the external transfer
- unfilled bounties have a creator-only refund path; with one entry, refund requires the deadline to pass

## Automated checks

The repository includes:

- seven direct contract tests
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
