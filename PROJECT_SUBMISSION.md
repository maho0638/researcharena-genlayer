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
https://explorer-studio.genlayer.com/address/0x3877C0a69a42a01c9c6a4708aCca25bA5573814C

Address:
`0x3877C0a69a42a01c9c6a4708aCca25bA5573814C`

Successful full lifecycle:
https://github.com/maho0638/researcharena-genlayer/actions/runs/35918043606

Create bounty:
https://explorer-studio.genlayer.com/tx/0x926e60299187d2b00106b7b3db49b5983b0f39f9e5cb7803da8187ecacdb52b1

Primary submission:
https://explorer-studio.genlayer.com/tx/0xdb1febe4ee75e62840789ba08009be3fc7cf88fdb88801dee0733df5bc8dfeb0

Competing submission:
https://explorer-studio.genlayer.com/tx/0x6783c4df8188c817574cc3529bcd67928fa942e64c65c3e280fa73026afefde4

Close:
https://explorer-studio.genlayer.com/tx/0x8bc3d071e8580b3dd544b358d40b46a30007cc080f1fdd24efbe94238b62b18e

Consensus resolution:
https://explorer-studio.genlayer.com/tx/0x014a214af5be604a1c4dfd5b825c08facb3d203f661fa4c32983d1ac3e8bda06

Winner reward claim:
https://explorer-studio.genlayer.com/tx/0x262268fff6d4a0e875ec44119883aeb459528d4279a01d45d471af4b78299e3f

Verified stored result:

- `status = RESOLVED`
- `winner_submission_id = primary-report`
- `winning_score = 98`
- `runner_up_score = 32`
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
