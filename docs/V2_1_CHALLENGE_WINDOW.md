# ResearchArena V2.1 — Guaranteed Challenge Window

Status: **verified canonical V2.1 candidate on Studionet**; production UI promotion is the remaining gate.

## Why this hardening exists

ResearchArena V2 already supports one fresh challenge/re-resolution round before settlement. The original V2 contract, however, allowed a winning researcher to claim immediately after an initial `RESOLVED` result and allowed a sponsor to refund immediately after an initial `REJECTED` result.

That created an economic race: an authorized participant could have a valid challenge right in theory but lose it if settlement happened first.

## V2.1 invariant

The first consensus result now opens a **1-hour guaranteed challenge window**.

During that window:

- `claim_reward` is blocked for an initial `RESOLVED` result;
- `refund_rejected` is blocked for an initial `REJECTED` result;
- sponsor or participating researcher may use the one allowed challenge;
- `get_challenge_deadline` exposes the exact on-chain deadline;
- `is_settlement_ready` exposes whether economic settlement is currently allowed.

If nobody challenges, settlement becomes available after the window expires.

If an authorized party challenges, the contract runs the existing fresh consensus round. After that one allowed re-resolution, settlement can proceed immediately because the challenge right has been consumed and the result already received a second consensus pass.

## Evidence-host normalization hardening

V2.1 also closes an evidence-independence bypass in the contract-level URL parser. Query strings, fragments, trailing-dot hostnames, and ambiguous `userinfo@host` authority forms can no longer make the same effective evidence host appear independent.

The frontend already uses the browser URL parser, but the contract is the security boundary and now performs its own deterministic normalization and rejects ambiguous authority forms.

## Cross-layer support

The V2.1 branch updates:

- Intelligent Contract settlement guards and evidence-host normalization;
- direct tests with `direct_vm.warp()` for challenge expiry;
- live Studionet integration test logic;
- SDK helpers for challenge deadline and settlement readiness;
- frontend state so Claim/Refund are disabled while review is still open;
- manual live-verification workflow markers.

## Promotion gates

This branch must not be promoted or deployed until all of the following pass:

1. direct contract tests;
2. GenVM lint;
3. SDK build/tests;
4. Next.js production build;
5. live Studionet lifecycle on a fresh diagnostic V2.1 deployment;
6. deployed-source equality;
7. reviewer proof update;
8. only then a controlled production promotion.

The previous V2 contract remains historical evidence. The V2.1 proof manifest now points to the source-matched Studionet contract `0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9` and workflow `36349449658`.
