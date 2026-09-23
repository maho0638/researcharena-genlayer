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
https://explorer-studio.genlayer.com/address/0xb501Af6f93218abDd0001C5Bcb37B800656B77a4

Address:
`0xb501Af6f93218abDd0001C5Bcb37B800656B77a4`

Successful full lifecycle:
https://github.com/maho0638/researcharena-genlayer/actions/runs/35854134127

Create bounty:
https://explorer-studio.genlayer.com/tx/0x2a85dd5f1eb16178f9cc56109776111f0f0e659bfb732577b1c4b42d76f69cc0

Primary submission:
https://explorer-studio.genlayer.com/tx/0x9b35c6136dfedaf20ad45290d833e21deab8d3b0086e13baaf1566125ce60afd

Competing submission:
https://explorer-studio.genlayer.com/tx/0xf01e9dea4771e493980442833e183159cef63c029a0a6a74e30a3f65e69deb1f

Close:
https://explorer-studio.genlayer.com/tx/0xd44dd40f6fbee25e95cfc303c32a5ddfb780aea1f3422aabd40ddfa35e98b65e

Consensus resolution:
https://explorer-studio.genlayer.com/tx/0x5b883000af40b9e144206ec16d3e2b2aad4e9896f9bd47a680e5f164bf9e8e63

Winner reward claim:
https://explorer-studio.genlayer.com/tx/0x5133f6d8bd122f470285401e1ff7404fdd6f9cbc36fc2b1599a8908c27f27ad1

Verified stored result:

- `status = RESOLVED`
- `winner_submission_id = primary-report`
- `winning_score = 95`
- `runner_up_score = 20`
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
