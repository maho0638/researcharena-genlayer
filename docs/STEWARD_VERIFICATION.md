# Steward Verification Guide

ResearchArena is designed so a reviewer can verify the project without creating a new bounty.

## 1. Open the live app

The production Vercel deployment is connected to the verified Studionet contract. The **Verified Live Proof** section loads the existing bounty `example-domain-research-v1` directly from on-chain state.

Expected stored result:

- status: `RESOLVED`
- winner: `primary-report`
- winning score: `92/100`
- runner-up score: `18/100`
- reason code: `RUBRIC_FIT`
- reward claimed: `true`

## 2. Verify the contract

Contract address:

`0x4c52bAEd4C5562864768BEd411804e56208D4347`

Explorer:

https://explorer-studio.genlayer.com/address/0x4c52bAEd4C5562864768BEd411804e56208D4347

## 3. Verify the complete economic lifecycle

Successful workflow:

https://github.com/maho0638/researcharena-genlayer/actions/runs/35881343633

The run performs:

1. contract deployment;
2. GEN-funded bounty creation;
3. two submissions from different accounts;
4. sponsor close;
5. GenLayer validator-consensus resolution;
6. winner-only reward claim;
7. final state read proving `reward_claimed = true`.

## 4. Reproduce

Use the repository workflow **Deploy & Verify Studionet** or run:

`gltest tests/integration/test_studionet_full_flow.py -v -s --network studionet`

Direct tests and frontend production build are enforced by CI.
