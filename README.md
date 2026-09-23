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
- **Contract:** `0xb501Af6f93218abDd0001C5Bcb37B800656B77a4`
- **Explorer:** https://explorer-studio.genlayer.com/address/0xb501Af6f93218abDd0001C5Bcb37B800656B77a4
- **Successful full lifecycle workflow:** https://github.com/maho0638/researcharena-genlayer/actions/runs/35854134127

### Real end-to-end transactions

- Create escrowed bounty: https://explorer-studio.genlayer.com/tx/0x2a85dd5f1eb16178f9cc56109776111f0f0e659bfb732577b1c4b42d76f69cc0
- Submit primary report: https://explorer-studio.genlayer.com/tx/0x9b35c6136dfedaf20ad45290d833e21deab8d3b0086e13baaf1566125ce60afd
- Submit competing report: https://explorer-studio.genlayer.com/tx/0xf01e9dea4771e493980442833e183159cef63c029a0a6a74e30a3f65e69deb1f
- Close submissions: https://explorer-studio.genlayer.com/tx/0xd44dd40f6fbee25e95cfc303c32a5ddfb780aea1f3422aabd40ddfa35e98b65e
- Resolve by validator consensus: https://explorer-studio.genlayer.com/tx/0x5b883000af40b9e144206ec16d3e2b2aad4e9896f9bd47a680e5f164bf9e8e63
- Winner claims reward: https://explorer-studio.genlayer.com/tx/0x5133f6d8bd122f470285401e1ff7404fdd6f9cbc36fc2b1599a8908c27f27ad1

### Stored result

The live test compared a primary IANA/RFC-backed report against a generic competing report.

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `95/100`
- runner-up score: `20/100`
- reward claimed: `true`

Consensus rationale:

> primary-report cites IANA's dedicated example-domains page explicitly naming example.com, plus RFC 2606 and RFC 6761 as standards-track authority. generic-report only references example.org and generic IANA/RFC homepages without specific claims.

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
- validators independently recompute the winner
- reward claim is restricted to the stored winner
- claim state is updated before the external transfer

## Automated checks

The repository includes:

- six direct contract tests
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
