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
- **Contract:** `0x4c52bAEd4C5562864768BEd411804e56208D4347`
- **Explorer:** https://explorer-studio.genlayer.com/address/0x4c52bAEd4C5562864768BEd411804e56208D4347
- **Successful full lifecycle workflow:** https://github.com/maho0638/researcharena-genlayer/actions/runs/35881343633

### Real end-to-end transactions

- Create escrowed bounty: https://explorer-studio.genlayer.com/tx/0x2449fde5eb396e2a6e395f294b16a0c8244e5735dbfd8b3f1d885d535aae70ce
- Submit primary report: https://explorer-studio.genlayer.com/tx/0x88e8580ac40751891dc9ae32f89808b2bda08f8df5c89f1344cada6aaab86445
- Submit competing report: https://explorer-studio.genlayer.com/tx/0xa6650fc4c5ca6c16f82444427ed056975e2f9e93ec253ea10a5eaed5abf8b483
- Close submissions: https://explorer-studio.genlayer.com/tx/0x66e8b7d083112f7fec43577ce11447b15554ed6dae275abb441da38c3de347a3
- Resolve by validator consensus: https://explorer-studio.genlayer.com/tx/0xbe2332d2c8db6819ffaae661edfbea023763638e1157852a8c62d7036217cd28
- Winner claims reward: https://explorer-studio.genlayer.com/tx/0x9ccd75dd3d210eaa76ee1ddd3f0e111598ebc7550df0c5c23be08295459db237

### Stored result

The live test compared a primary IANA/RFC-backed report against a generic competing report.

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `92/100`
- runner-up score: `18/100`
- agreed reason code: `RUBRIC_FIT`
- reward claimed: `true`

Consensus rationale:

> primary-report won because the report best satisfied the sponsor's precommitted rubric. Score 92/100 vs 18/100.

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
