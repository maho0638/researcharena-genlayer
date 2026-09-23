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
- validators independently repeat the comparison and must agree on the same winner, bounded winner/runner-up scores, and the exact structured reason code;
- consensus fixes the winner, score, runner-up score, and rationale on-chain;
- the result controls a native GEN reward held by the contract.

## Complete user flow

1. Sponsor creates a bounty and deposits native GEN.
2. Independent researcher wallets submit one report each plus two HTTPS evidence URLs from independent hostnames.
3. Sponsor closes entries once at least two reports exist, or resolution waits for the deadline.
4. GenLayer renders every report and source.
5. The leader proposes the best-supported entry.
6. Validators independently re-evaluate the same evidence.
7. The consensus winner is stored on-chain.
8. Only that winning researcher can claim the escrowed GEN.
9. If a bounty remains unfilled, the creator has a guarded refund path instead of leaving GEN permanently locked.

## Live Studionet evidence

Contract:
https://explorer-studio.genlayer.com/address/0x4c52bAEd4C5562864768BEd411804e56208D4347

Address:
`0x4c52bAEd4C5562864768BEd411804e56208D4347`

Successful full lifecycle:
https://github.com/maho0638/researcharena-genlayer/actions/runs/35881343633

Create bounty:
https://explorer-studio.genlayer.com/tx/0x2449fde5eb396e2a6e395f294b16a0c8244e5735dbfd8b3f1d885d535aae70ce

Primary submission:
https://explorer-studio.genlayer.com/tx/0x88e8580ac40751891dc9ae32f89808b2bda08f8df5c89f1344cada6aaab86445

Competing submission:
https://explorer-studio.genlayer.com/tx/0xa6650fc4c5ca6c16f82444427ed056975e2f9e93ec253ea10a5eaed5abf8b483

Close:
https://explorer-studio.genlayer.com/tx/0x66e8b7d083112f7fec43577ce11447b15554ed6dae275abb441da38c3de347a3

Consensus resolution:
https://explorer-studio.genlayer.com/tx/0xbe2332d2c8db6819ffaae661edfbea023763638e1157852a8c62d7036217cd28

Winner reward claim:
https://explorer-studio.genlayer.com/tx/0x9ccd75dd3d210eaa76ee1ddd3f0e111598ebc7550df0c5c23be08295459db237

Verified stored result:

- `status = RESOLVED`
- `winner_submission_id = primary-report`
- `winning_score = 92`
- `runner_up_score = 18`
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
