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
- validators independently repeat the comparison and must agree on the same winner plus bounded winner/runner-up scores;
- consensus fixes the winner, score, runner-up score, and rationale on-chain;
- the result controls a native GEN reward held by the contract.

## Complete user flow

1. Sponsor creates a bounty and deposits native GEN.
2. Independent researcher wallets submit one report each plus two distinct evidence URLs.
3. Sponsor closes entries once at least two reports exist, or resolution waits for the deadline.
4. GenLayer renders every report and source.
5. The leader proposes the best-supported entry.
6. Validators independently re-evaluate the same evidence.
7. The consensus winner is stored on-chain.
8. Only that winning researcher can claim the escrowed GEN.
9. If a bounty remains unfilled, the creator has a guarded refund path instead of leaving GEN permanently locked.

## Live Studionet evidence

Contract:
https://explorer-studio.genlayer.com/address/0x6def481601D1c8A81Ca17F8ad4e02725471a72E7

Address:
`0x6def481601D1c8A81Ca17F8ad4e02725471a72E7`

Successful full lifecycle:
https://github.com/maho0638/researcharena-genlayer/actions/runs/35855964117

Create bounty:
https://explorer-studio.genlayer.com/tx/0xb006507d076b11f0e6a0b643c7b2672c0db97b5919d5133fab6424f50e352a4d

Primary submission:
https://explorer-studio.genlayer.com/tx/0x561c2824cc7a8c01b2d7424dab4e19b1afc3f8c3f9ea64ca6931290979aaad80

Competing submission:
https://explorer-studio.genlayer.com/tx/0xc191928f77a43bc39c1e6f1cdbf274bf9551982f86db610230e06d0db96915c4

Close:
https://explorer-studio.genlayer.com/tx/0xc5abe1793c4ba359cc9d59cb519be5c117c7b7759f605f328118621842be12ad

Consensus resolution:
https://explorer-studio.genlayer.com/tx/0x485135e7c20175db1ddec96c954d1b061e81172609454276f8842348fe4b72f2

Winner reward claim:
https://explorer-studio.genlayer.com/tx/0x22abe8fd863cc4d3a6225881d64ad3d6ca3f8ddc180ec44360bec51ec0986f34

Verified stored result:

- `status = RESOLVED`
- `winner_submission_id = primary-report`
- `winning_score = 95`
- `runner_up_score = 25`
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
