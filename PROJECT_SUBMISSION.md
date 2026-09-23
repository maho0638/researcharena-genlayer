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
- validators independently repeat the comparison;
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

## Live Studionet evidence

Contract:
https://explorer-studio.genlayer.com/address/0xCf72C9fD0B87799762b63Dd8F7c349eb18800514

Address:
`0xCf72C9fD0B87799762b63Dd8F7c349eb18800514`

Successful full lifecycle:
https://github.com/maho0638/researcharena-genlayer/actions/runs/35853517282

Create bounty:
https://explorer-studio.genlayer.com/tx/0xfe7c14993590d8dbeb29b750698b243446a3c3d8f6d66ea29ec5f00578de1821

Primary submission:
https://explorer-studio.genlayer.com/tx/0xc02a97c9898057f18f83325f45321bef23c05065581333ccc48b857c7b757a7c

Competing submission:
https://explorer-studio.genlayer.com/tx/0x0a41d748ee149d28a22faa595d811c86d42e16fc0e41685fbe6ba5cfc10c2180

Close:
https://explorer-studio.genlayer.com/tx/0x5a2c2eaca00ce9ac579a3cf6743e808f4f19a17ef6be9d276fc54b74e6262649

Consensus resolution:
https://explorer-studio.genlayer.com/tx/0x7552c70a8154eb95237a71d6bf968b7c267b2007ffd73c9926c40ca91d655f2a

Winner reward claim:
https://explorer-studio.genlayer.com/tx/0x4a36d0512653622e5a567c04bc9677fb918f690d3a4bc9deab05c059a18a97ab

Verified stored result:

- `status = RESOLVED`
- `winner_submission_id = primary-report`
- `winning_score = 97`
- `runner_up_score = 38`
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
