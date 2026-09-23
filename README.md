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
- **Contract:** `0xCf72C9fD0B87799762b63Dd8F7c349eb18800514`
- **Explorer:** https://explorer-studio.genlayer.com/address/0xCf72C9fD0B87799762b63Dd8F7c349eb18800514
- **Successful full lifecycle workflow:** https://github.com/maho0638/researcharena-genlayer/actions/runs/35853517282

### Real end-to-end transactions

- Create escrowed bounty: https://explorer-studio.genlayer.com/tx/0xfe7c14993590d8dbeb29b750698b243446a3c3d8f6d66ea29ec5f00578de1821
- Submit primary report: https://explorer-studio.genlayer.com/tx/0xc02a97c9898057f18f83325f45321bef23c05065581333ccc48b857c7b757a7c
- Submit competing report: https://explorer-studio.genlayer.com/tx/0x0a41d748ee149d28a22faa595d811c86d42e16fc0e41685fbe6ba5cfc10c2180
- Close submissions: https://explorer-studio.genlayer.com/tx/0x5a2c2eaca00ce9ac579a3cf6743e808f4f19a17ef6be9d276fc54b74e6262649
- Resolve by validator consensus: https://explorer-studio.genlayer.com/tx/0x7552c70a8154eb95237a71d6bf968b7c267b2007ffd73c9926c40ca91d655f2a
- Winner claims reward: https://explorer-studio.genlayer.com/tx/0x4a36d0512653622e5a567c04bc9677fb918f690d3a4bc9deab05c059a18a97ab

### Stored result

The live test compared a primary IANA/RFC-backed report against a generic competing report.

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `97/100`
- runner-up score: `38/100`
- reward claimed: `true`

Consensus rationale:

> primary-report directly names example.com in IANA text and cites RFC 2606/RFC 6761 for documentation-purpose reservation. generic-report only shows generic example.org text and unrelated homepages.

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
