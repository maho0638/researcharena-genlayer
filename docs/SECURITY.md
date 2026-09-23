# Security and Failure Modes

## Input and market integrity

- non-zero bounty reward required;
- future deadline required;
- 2–5 submission cap;
- one submission per researcher wallet;
- sponsor cannot enter their own bounty;
- duplicate submission IDs rejected;
- all evidence URLs must use HTTPS;
- the two supporting evidence URLs must be different and use distinct hostnames; this is an anti-duplication rule, while actual source authority and organizational independence are judged from the live evidence;
- question, rubric, IDs, URLs, and stored rationale are length-bounded;
- before the deadline, a sponsor can close only when the declared submission cap is full, preventing selective early truncation of the competition.

## Prompt-injection resistance

Fetched reports and webpages are explicitly marked as untrusted evidence. The judging prompt tells the model never to follow instructions embedded in submitted content and to use only the sponsor's research question and rubric as instructions.

## Consensus integrity

The validator independently repeats web retrieval and evaluation. Acceptance requires:

- the same winning submission ID;
- winner score agreement within a bounded tolerance;
- runner-up score agreement within a bounded tolerance;
- runner-up score cannot exceed winner score;
- both leader and validator must return an allowed structured reason category, but exact category equality is not required because subjective labels are less stable than the payout-critical winner and scores;
- the displayed rationale is deterministically composed from agreed settlement fields rather than storing unconstrained leader prose.

## Funds safety

- reward is stored from `gl.message.value`;
- only a resolved winner can claim;
- claim is single-use;
- settlement state is updated before value transfer;
- an unfilled bounty has a sponsor-only refund path;
- if one submission exists, refund is blocked until the deadline has passed.

## Known trade-offs

Public web sources can change, fail, or disagree. ResearchArena therefore favors precommitted rubrics, public evidence, source independence, and bounded structured outcomes. The contract does not claim that an LLM judgment is legal arbitration or objective truth.
