# GenLayer Project Quality Bar

ResearchArena is intentionally mapped to the current Project review criteria.

| Quality criterion | ResearchArena implementation | Verifiable proof |
| --- | --- | --- |
| Solves a real trust problem | A sponsor should not have to trust one platform operator to decide which competing research report earns escrowed funds. | Winner selection and payout authorization are owned by the Intelligent Contract. |
| GenLayer is central | Removing GenLayer removes the market's neutral judge and therefore removes settlement. | `resolve_bounty` uses live web retrieval, LLM evaluation, validator re-execution, and consensus before state changes. |
| Current / trustworthy evidence | Each entry supplies a public report plus two HTTPS supporting sources from independent hostnames. Source authority and corroboration are explicit judging factors. | Live demo uses IANA, example.com and RFC material. |
| Real on-chain consequence | The result is not advisory: native GEN is locked at bounty creation and claimable only by the consensus-selected winner. | Live create and winner-claim transactions are linked in the README and proof manifest. |
| Structured result | Settlement stores winner ID, winner score, runner-up score, exact reason code, and deterministic rationale. | `Bounty` state and live `get_bounty` read. |
| Independent validator verification | Validators repeat the web retrieval and comparative evaluation instead of checking only output shape. | Custom `validator_fn` requires same winner, exact reason code, and bounded agreement on both scores. |
| Complete source and documentation | Contract, UI, direct tests, live integration test, CI, architecture, security notes and reviewer instructions are public. | Repository source map and `docs/`. |
| Full UI transaction lifecycle | The production Next.js UI connects a wallet, estimates fees, writes contract transactions, waits for finalized execution, and reads on-chain state. | `app/page.tsx` and `lib/genlayer.ts`. |
| Meaningfully different product | ResearchArena is a multi-participant evidence competition with escrow and winner payout, not a starter-template classifier or generic chatbot. | 2–5 participant market lifecycle plus consensus settlement. |
| Working demo | A read-only verified benchmark loads without a wallet, while the full create → submit → close → resolve → claim workflow remains interactive. | Production Vercel deployment + Verified Live Proof section. |

## Verified final benchmark

- Contract: `0x4c52bAEd4C5562864768BEd411804e56208D4347`
- Workflow: https://github.com/maho0638/researcharena-genlayer/actions/runs/35881343633
- Status: `RESOLVED`
- Winner: `primary-report`
- Score: `92/100`
- Runner-up: `18/100`
- Reason code: `RUBRIC_FIT`
- Reward claimed: `true`

This document is a reviewer map, not a claim that any specific Portal point award is guaranteed.
