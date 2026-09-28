# ResearchArena V2.1 — Provenance Record

This file records the public development and deployment provenance of ResearchArena V2.1 in this repository. It is an index of pre-existing, independently timestamped GitHub and Studionet evidence.

## Repository

- Repository: `maho0638/researcharena-genlayer`
- Public repository owner: `maho0638`
- Canonical implementation repository: https://github.com/maho0638/researcharena-genlayer

## V2.1 development history

- Pull request: #6 — `ResearchArena V2.1: guaranteed challenge window`
- PR URL: https://github.com/maho0638/researcharena-genlayer/pull/6
- PR created: `2026-09-27T20:37:39Z`
- PR merged: `2026-09-27T21:06:08Z`
- Development branch: `researcharena-v2-challenge-window`
- Final branch head: `0c54560815e0998f30deb1cfc7174b8b974fddeb`
- Merge commit: `b226d0896eace77ca42f0f221c10a578d8ef04f0`

The PR history predates this provenance file and provides the primary public timestamped record of the V2.1 implementation.

## Canonical V2.1 Studionet proof

- Policy: `RA_V2_1_CHALLENGE_WINDOW`
- Canonical Studionet contract: `0x069855c30BA2840E3eeD49787e1799BFa2bF7Da9`
- Canonical live verification workflow: https://github.com/maho0638/researcharena-genlayer/actions/runs/36349449658
- Pre-deploy CI workflow: `36349452189`
- Direct/repository tests passed: `49`
- Guaranteed challenge window: `3600 seconds`

## Source equality

- Deploy input SHA-256:
  `575981687aa3448b57272f1680ef9e9f6f2a541b5b4662a13ce25b362216b3d4`
- Normalized deployed source SHA-256:
  `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`
- Normalized repository source SHA-256:
  `4f097f22405c80c767b62cdf1b3eac24fbd6e4e7ddb49801679118f2d1d563ba`
- Source match: `true`

## Proof artifact

- Artifact ID: `10941524315`
- Name: `researcharena-v2-live-proof`
- Digest:
  `sha256:acb7e90f11071dc6948f16e8419e09b05e7b13628db8fee08decb49ea8b72be6`
- Recorded expiry: `2026-12-26T20:49:31Z`

## Canonical lifecycle evidence

### Phase 1 — `ra-v2-evidence-phase`

- Final status: `PAID`
- Initial score: `95/100`
- Initial reason: `RUBRIC_FIT`
- Challenge window enforced: `true`
- Challenge and fresh re-resolution verified: `true`

### Phase 2 — `ra-v2-synthesis-phase`

- Locked until Phase 1 was paid: `true`
- Final status: `PAID`
- Score: `95/100`
- Reason: `DIRECTNESS`
- Challenge and fresh re-resolution verified: `true`

### Negative path — `ra-v2-no-winner-refund`

- Resolution status: `REJECTED`
- Reason: `SOURCE_UNAVAILABLE`
- Challenge and fresh re-resolution verified: `true`
- Final status: `REFUNDED`

## Existing machine-readable evidence

The canonical proof manifest is maintained at:

- `docs/V2_PROOF_MANIFEST.json`

The public machine-readable production proof is:

- https://researcharena-genlayer.vercel.app/v2-proof.json

## Provenance statement

ResearchArena V2.1 was developed, tested, source-matched, deployed to GenLayer Studionet, and merged through the timestamped history above in `maho0638/researcharena-genlayer`.

This file does not replace the underlying GitHub commit/PR history, workflow records, transaction history, deployed contract, or source hashes. Those records are the primary evidence.

No license grant is made by this provenance record.
