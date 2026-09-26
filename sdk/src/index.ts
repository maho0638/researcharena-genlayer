import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export type ContractAddress = string;
export const RESEARCHARENA_V2_POLICY = "RA_V2_RESEARCH_PROGRAMS";
export const MIN_WINNER_SCORE = 70;

export type Bounty = {
  id?: string;
  program_id?: string;
  prerequisite_bounty_id?: string;
  phase_index?: bigint | number | string;
  status?: string;
  winner_submission_id?: string;
  winning_score?: bigint | number | string;
  reason_code?: string;
  reward_claimed?: boolean;
  challenge_count?: bigint | number | string;
  challenge_note?: string;
  resolution_round?: bigint | number | string;
  initial_recorded?: boolean;
  initial_winner_submission_id?: string;
  initial_winning_score?: bigint | number | string;
  initial_runner_up_score?: bigint | number | string;
  initial_reason_code?: string;
  winner_report_snapshot?: string;
  winner_source_1_snapshot?: string;
  winner_source_2_snapshot?: string;
  policy_version?: string;
};

export type ProgramProgress = Record<string, bigint | number | string | undefined>;
export type ResearcherStats = Record<string, bigint | number | string | undefined>;

export function auditBounty(bounty: Bounty) {
  const status = String(bounty.status ?? "");
  const score = Number(bounty.winning_score ?? 0);
  const settled = ["PAID", "REFUNDED"].includes(status);
  const resolutionState = ["RESOLVED", "REJECTED", "CHALLENGED", "PAID"].includes(status);
  const winnerState = ["RESOLVED", "PAID"].includes(status);
  const rejectionState = status === "REJECTED";
  const round = Number(bounty.resolution_round ?? 0);
  const challengeCount = Number(bounty.challenge_count ?? 0);
  const checks = {
    v2Policy: bounty.policy_version === RESEARCHARENA_V2_POLICY,
    winnerThreshold: !winnerState || score >= MIN_WINNER_SCORE,
    winnerStateHasWinner: !winnerState || Boolean(bounty.winner_submission_id),
    rejectedHasNoWinner: !rejectionState || !bounty.winner_submission_id,
    paidWasClaimed: status !== "PAID" || bounty.reward_claimed === true,
    refundWasSettled: status !== "REFUNDED" || bounty.reward_claimed === true,
    resolvedHasReason: round === 0 || Boolean(bounty.reason_code),
    resolutionRoundPresent: !resolutionState || round >= 1,
    challengedRoundAuditable:
      round <= 1 ||
      (
        challengeCount >= 1 &&
        bounty.initial_recorded === true &&
        Boolean(bounty.initial_reason_code) &&
        Boolean(bounty.challenge_note)
      ),
    terminalIsSettled: !settled || bounty.reward_claimed === true,
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

export class ResearchArenaClient {
  readonly address: ContractAddress;
  private readonly client: any;

  constructor(options: { address: ContractAddress; endpoint?: string }) {
    this.address = options.address;
    const config: any = { chain: studionet };
    if (options.endpoint) config.endpoint = options.endpoint;
    this.client = createClient(config);
  }

  getBounty(bountyId: string): Promise<Bounty> {
    return this.client.readContract({
      address: this.address,
      functionName: "get_bounty",
      args: [bountyId],
    });
  }

  getProgramProgress(programId: string): Promise<ProgramProgress> {
    return this.client.readContract({
      address: this.address,
      functionName: "get_program_progress",
      args: [programId],
    });
  }

  getResearcherStats(address: string): Promise<ResearcherStats> {
    return this.client.readContract({
      address: this.address,
      functionName: "get_researcher_stats",
      args: [address],
    });
  }

  async listProgram(programId: string): Promise<Bounty[]> {
    const raw = await this.client.readContract({
      address: this.address,
      functionName: "get_program_phase_count",
      args: [programId],
    });
    const count = Number(raw ?? 0);
    const phases: Bounty[] = [];
    for (let i = 0; i < count; i += 1) {
      const id = await this.client.readContract({
        address: this.address,
        functionName: "get_program_phase_id",
        args: [programId, BigInt(i)],
      });
      phases.push(await this.getBounty(String(id)));
    }
    return phases;
  }
}

export function createProgramPhaseRequest(p: {
  address: ContractAddress;
  programId: string;
  bountyId: string;
  prerequisiteBountyId?: string;
  question: string;
  rubric: string;
  deadline: bigint;
  maxSubmissions: bigint;
  reward: bigint;
}) {
  return {
    address: p.address,
    functionName: "create_program_phase",
    args: [
      p.programId,
      p.bountyId,
      p.prerequisiteBountyId ?? "",
      p.question,
      p.rubric,
      p.deadline,
      p.maxSubmissions,
    ],
    value: p.reward,
  } as const;
}

export const submitResearchRequest = (
  address: ContractAddress,
  bountyId: string,
  submissionId: string,
  reportUrl: string,
  source1: string,
  source2: string,
) => ({
  address,
  functionName: "submit_research",
  args: [bountyId, submissionId, reportUrl, source1, source2],
} as const);

export const resolveBountyRequest = (address: ContractAddress, bountyId: string) => ({
  address,
  functionName: "resolve_bounty",
  args: [bountyId],
} as const);

export const challengeRequest = (
  address: ContractAddress,
  bountyId: string,
  note: string,
) => ({
  address,
  functionName: "challenge_resolution",
  args: [bountyId, note],
} as const);

export const resolveChallengeRequest = (
  address: ContractAddress,
  bountyId: string,
) => ({
  address,
  functionName: "resolve_challenge",
  args: [bountyId],
} as const);

export const claimRequest = (address: ContractAddress, bountyId: string) => ({
  address,
  functionName: "claim_reward",
  args: [bountyId],
} as const);

export const closeBountyRequest = (address: ContractAddress, bountyId: string) => ({
  address,
  functionName: "close_bounty",
  args: [bountyId],
} as const);

export const refundRejectedRequest = (address: ContractAddress, bountyId: string) => ({
  address,
  functionName: "refund_rejected",
  args: [bountyId],
} as const);

export const refundUnfilledRequest = (address: ContractAddress, bountyId: string) => ({
  address,
  functionName: "refund_unfilled_bounty",
  args: [bountyId],
} as const);

export const recoverStalledRequest = (address: ContractAddress, bountyId: string) => ({
  address,
  functionName: "recover_stalled_bounty",
  args: [bountyId],
} as const);
