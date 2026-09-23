# ResearchArena — Project Explorer Submission Dossier

## One-sentence summary

ResearchArena is a GenLayer-native research bounty marketplace where sponsors escrow native GEN, researchers compete with public evidence, and validator consensus selects the winning report that can claim the reward.

## Problem

Research bounties, diligence contests, grant research, and agent-to-agent research markets need more than a deterministic oracle. A sponsor needs to know which submission actually answers a natural-language brief with the strongest current public evidence.

Traditional smart contracts cannot open arbitrary webpages, compare the meaning and authority of competing sources, or make an auditable subjective judgment.

## GenLayer-native solution

ResearchArena makes GenLayer the settlement layer:

- live web evidence is fetched at judgment time;
- an LLM evaluates every competing report under the sponsor's precommitted rubric;
- validators independently repeat the comparison and must agree on the same winner with bounded winner/runner-up scores; both evaluations must also return an allowed structured reason category without requiring brittle exact category equality;
- consensus fixes the winner, score, runner-up score, and rationale on-chain;
- the result controls a native GEN reward held by the contract.

## Complete user flow

1. Sponsor creates a bounty and deposits native GEN.
2. Independent researcher wallets submit one report each plus two HTTPS evidence URLs from independent hostnames.
3. Before the deadline, the sponsor can close only after the advertised entry cap is filled; otherwise the market remains open until the deadline.
4. GenLayer renders every report and source.
5. The leader proposes the best-supported entry.
6. Validators independently re-evaluate the same evidence.
7. The consensus winner is stored on-chain.
8. Only that winning researcher can claim the escrowed GEN.
9. If a bounty remains unfilled, the creator has a guarded refund path instead of leaving GEN permanently locked.
10. The contract maintains an on-chain bounty index so frontends can discover markets without requiring pre-known IDs.

## Live Studionet evidence

Contract:
https://explorer-studio.genlayer.com/address/0x1ca016381CC68dEF3e3028eefdBaDbadf2b80dA2

Address:
`0x1ca016381CC68dEF3e3028eefdBaDbadf2b80dA2`

Successful full lifecycle:
https://github.com/maho0638/researcharena-genlayer/actions/runs/35912412402

Create bounty:
https://explorer-studio.genlayer.com/tx/0xad4b1139b373a2a56981dcf34455e6da52ecebfa1934054ab7cb3141c9d8d5d5

Primary submission:
https://explorer-studio.genlayer.com/tx/0xbe796ea1d7d3187b3b905897e682edbd4ccd346c5c4a784add109e400484226c

Competing submission:
https://explorer-studio.genlayer.com/tx/0xfd6bca0f3dc250372033d63b4b416ee1779e1684d0a9f41a05b4e575d7bae46d

Close:
https://explorer-studio.genlayer.com/tx/0xb4ff58beec90ce06b20a6bd62fe13845430a2d718823f48527af2ad7088bd6de

Consensus resolution:
https://explorer-studio.genlayer.com/tx/0x772d1b88fa3b8ef1fca179fa00866b3228a6e9ffa9b5c2f816069bf36cd186b6

Winner reward claim:
https://explorer-studio.genlayer.com/tx/0xf193bdbb97ac9dae55939065718a07e1b0925cbcdc551d547cf6b6be39b3ef34

Verified stored result:

- `status = RESOLVED`
- `winner_submission_id = primary-report`
- `winning_score = 95`
- `runner_up_score = 20`
- `reason_code = RUBRIC_FIT`
- `reward_claimed = true`

## Source and tests

Repository:
https://github.com/maho0638/researcharena-genlayer

Contract:
https://github.com/maho0638/researcharena-genlayer/blob/main/contracts/research_arena.py

Direct tests:
https://github.com/maho0638/researcharena-genlayer/blob/main/tests/direct/test_research_arena.py

Live integration:
https://github.com/maho0638/researcharena-genlayer/blob/main/tests/integration/test_studionet_full_flow.py

## Differentiation

ResearchArena is not a generic AI evaluator. It is a competitive market with multiple independent participants, precommitted judging rules, bounded public evidence, validator re-execution, escrow, and a winner-only economic settlement.

It is also distinct from ProofJudge: ProofJudge verifies one evidence submission against one requirement; ResearchArena compares multiple competing research submissions and economically rewards the consensus-selected winner.

## Reviewer-first verification

A steward-specific verification guide is available at:

https://github.com/maho0638/researcharena-genlayer/blob/main/docs/STEWARD_VERIFICATION.md

Architecture and security notes:

- https://github.com/maho0638/researcharena-genlayer/blob/main/docs/ARCHITECTURE.md
- https://github.com/maho0638/researcharena-genlayer/blob/main/docs/SECURITY.md

Machine-readable proof manifest:

https://github.com/maho0638/researcharena-genlayer/blob/main/public/verified-demo.json
