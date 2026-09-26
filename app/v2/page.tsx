"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatGen, parseGen, readClient, sendWrite, walletClient } from "../../lib/genlayer";
import styles from "./v2.module.css";

type BountyView = {
  id?: string;
  program_id?: string;
  prerequisite_bounty_id?: string;
  phase_index?: string | number | bigint;
  creator?: string;
  question?: string;
  rubric?: string;
  reward?: string | number | bigint;
  deadline?: string | number | bigint;
  max_submissions?: string | number | bigint;
  submission_count?: string | number | bigint;
  status?: string;
  winner_submission_id?: string;
  winner?: string;
  winning_score?: string | number | bigint;
  runner_up_score?: string | number | bigint;
  reason_code?: string;
  initial_recorded?: boolean;
  initial_winner_submission_id?: string;
  initial_winning_score?: string | number | bigint;
  initial_runner_up_score?: string | number | bigint;
  initial_reason_code?: string;
  resolution_round?: string | number | bigint;
  winner_report_snapshot?: string;
  winner_source_1_snapshot?: string;
  winner_source_2_snapshot?: string;
  rationale?: string;
  reward_claimed?: boolean;
  challenge_count?: string | number | bigint;
  challenge_note?: string;
  policy_version?: string;
};

type ProgramProgress = {
  program_id?: string;
  total_phases?: string | number | bigint;
  open_phases?: string | number | bigint;
  closed_phases?: string | number | bigint;
  resolved_phases?: string | number | bigint;
  rejected_phases?: string | number | bigint;
  challenged_phases?: string | number | bigint;
  paid_phases?: string | number | bigint;
  refunded_phases?: string | number | bigint;
  total_reward?: string | number | bigint;
  settled_reward?: string | number | bigint;
};

type ResearcherStats = {
  submissions?: string | number | bigint;
  wins?: string | number | bigint;
  paid_wins?: string | number | bigint;
  challenges_raised?: string | number | bigint;
  total_earned?: string | number | bigint;
};

const CANONICAL_V2_ADDRESS = "0xf2dd996300750d880a7db948f41b639e1EA6624A";
const CANONICAL_PROGRAM = "researcharena-v2-program";
const CANONICAL_PHASE = "ra-v2-evidence-phase";
const CANONICAL_WORKFLOW = "https://github.com/maho0638/researcharena-genlayer/actions/runs/36269260931";
const RAW_V2_ADDRESS =
  process.env.NEXT_PUBLIC_RESEARCHARENA_V2_ADDRESS || CANONICAL_V2_ADDRESS;
const V2_CONFIGURED = /^0x[a-fA-F0-9]{40}$/.test(RAW_V2_ADDRESS);
const POLICY = "RA_V2_RESEARCH_PROGRAMS";
const explorerBase = "https://explorer-studio.genlayer.com";

function contractAddress() {
  if (!V2_CONFIGURED) {
    throw new Error("V2 contract is not promoted yet. Finish verification before production deployment.");
  }
  return RAW_V2_ADDRESS as `0x${string}`;
}

function deadlineFromHours(hours: number) {
  return BigInt(Math.floor(Date.now() / 1000) + Math.floor(hours * 3600));
}

function short(value?: string) {
  if (!value) return "—";
  return value.length > 18 ? value.slice(0, 8) + "…" + value.slice(-6) : value;
}

function n(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isHttps(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export default function ResearchArenaV2Page() {
  const [account, setAccount] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(
    V2_CONFIGURED ? "V2 contract configured" : "Verification build — V2 contract not promoted"
  );
  const [lastTx, setLastTx] = useState("");

  const [programId, setProgramId] = useState("research-program-1");
  const [phaseId, setPhaseId] = useState("phase-1");
  const [prerequisite, setPrerequisite] = useState("");
  const [question, setQuestion] = useState(
    "Which research submission best answers the sponsor's question with current public evidence?"
  );
  const [rubric, setRubric] = useState(
    "Prefer direct, authoritative and independently corroborated evidence. Reject unavailable or contradictory evidence."
  );
  const [reward, setReward] = useState("0.01");
  const [deadlineHours, setDeadlineHours] = useState("24");
  const [maxSubmissions, setMaxSubmissions] = useState("3");

  const [submitBountyId, setSubmitBountyId] = useState("phase-1");
  const [submissionId, setSubmissionId] = useState("entry-1");
  const [reportUrl, setReportUrl] = useState("");
  const [source1, setSource1] = useState("");
  const [source2, setSource2] = useState("");

  const [inspectId, setInspectId] = useState(CANONICAL_PHASE);
  const [bounty, setBounty] = useState<BountyView | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [challengeNote, setChallengeNote] = useState(
    "Please refetch the public evidence and run one fresh consensus pass before settlement."
  );

  const [inspectProgramId, setInspectProgramId] = useState(CANONICAL_PROGRAM);
  const [program, setProgram] = useState<ProgramProgress | null>(null);
  const [programPhases, setProgramPhases] = useState<BountyView[]>([]);

  const [researcher, setResearcher] = useState("");
  const [researcherStats, setResearcherStats] = useState<ResearcherStats | null>(null);

  const settlementSafe = useMemo(() => {
    if (!bounty) return false;
    if (bounty.status === "RESOLVED") return n(bounty.winning_score) >= 70 && Boolean(bounty.winner_submission_id);
    if (bounty.status === "PAID" || bounty.status === "REFUNDED") return bounty.reward_claimed === true;
    if (bounty.status === "REJECTED") return !bounty.winner_submission_id;
    return true;
  }, [bounty]);

  useEffect(() => {
    if (!V2_CONFIGURED) return;
    void loadBounty(CANONICAL_PHASE);
    void loadProgram(CANONICAL_PROGRAM);
  }, []);

  async function connect() {
    try {
      setBusy(true);
      const result = await walletClient();
      setAccount(result.account);
      setResearcher(result.account);
      setStatus("Wallet connected");
    } catch (error: any) {
      setStatus(error?.message || "Wallet connection failed");
    } finally {
      setBusy(false);
    }
  }

  async function write(functionName: string, args: unknown[], value?: bigint) {
    const hash = await sendWrite({
      address: contractAddress(),
      functionName,
      args,
      ...(value !== undefined ? { value } : {}),
    });
    setLastTx(hash);
    return hash;
  }

  async function createPhase(event: FormEvent) {
    event.preventDefault();
    try {
      setBusy(true);
      if (!programId.trim() || !phaseId.trim()) throw new Error("Program and phase IDs are required.");
      if (question.trim().length < 20 || rubric.trim().length < 20) {
        throw new Error("Question and rubric must each be at least 20 characters.");
      }
      const hours = Number(deadlineHours);
      const cap = Number(maxSubmissions);
      if (!Number.isFinite(hours) || hours <= 0) throw new Error("Deadline must be in the future.");
      if (!Number.isInteger(cap) || cap < 2 || cap > 5) throw new Error("Submission cap must be 2–5.");

      setStatus("Locking GEN and creating program phase...");
      await write(
        "create_program_phase",
        [
          programId.trim(),
          phaseId.trim(),
          prerequisite.trim(),
          question.trim(),
          rubric.trim(),
          deadlineFromHours(hours),
          BigInt(cap),
        ],
        parseGen(reward)
      );
      setInspectId(phaseId.trim());
      setSubmitBountyId(phaseId.trim());
      setInspectProgramId(programId.trim());
      setStatus("Program phase finalized on Studionet");
      await Promise.all([loadBounty(phaseId.trim()), loadProgram(programId.trim())]);
    } catch (error: any) {
      setStatus(error?.message || "Create phase failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitResearch(event: FormEvent) {
    event.preventDefault();
    try {
      setBusy(true);
      if (![reportUrl, source1, source2].every(isHttps)) {
        throw new Error("Report and both evidence sources must be HTTPS.");
      }
      const h1 = new URL(source1).hostname.replace(/^www./, "").toLowerCase();
      const h2 = new URL(source2).hostname.replace(/^www./, "").toLowerCase();
      if (h1 === h2) throw new Error("Evidence sources must use independent domains.");
      setStatus("Submitting immutable research URLs...");
      await write("submit_research", [
        submitBountyId.trim(),
        submissionId.trim(),
        reportUrl.trim(),
        source1.trim(),
        source2.trim(),
      ]);
      setInspectId(submitBountyId.trim());
      setStatus("Research submission finalized");
      await loadBounty(submitBountyId.trim());
    } catch (error: any) {
      setStatus(error?.message || "Research submission failed");
    } finally {
      setBusy(false);
    }
  }

  async function action(functionName: string, success: string, args: unknown[] = [inspectId]) {
    try {
      setBusy(true);
      if (!inspectId.trim()) throw new Error("Load a bounty first.");
      setStatus(success + "...");
      await write(functionName, args);
      setStatus(success);
      await loadBounty(inspectId.trim());
      if (bounty?.program_id) await loadProgram(String(bounty.program_id));
    } catch (error: any) {
      setStatus(error?.message || success + " failed");
    } finally {
      setBusy(false);
    }
  }

  async function challenge() {
    if (challengeNote.trim().length < 10) return setStatus("Challenge note is too short.");
    await action("challenge_resolution", "Challenge recorded", [inspectId, challengeNote.trim()]);
  }

  async function loadBounty(idArg?: string) {
    const id = (idArg || inspectId).trim();
    if (!id) return setStatus("Enter a bounty/phase ID.");
    try {
      const client: any = readClient();
      const address = contractAddress();
      const data: BountyView = await client.readContract({
        address,
        functionName: "get_bounty",
        args: [id],
      });
      setBounty(data);
      setInspectId(id);

      const count = Math.min(n(data.submission_count), 5);
      const loaded: any[] = [];
      for (let index = 0; index < count; index += 1) {
        const sid = await client.readContract({
          address,
          functionName: "get_submission_id",
          args: [id, BigInt(index)],
        });
        loaded.push(
          await client.readContract({
            address,
            functionName: "get_submission",
            args: [id, sid],
          })
        );
      }
      setSubmissions(loaded);
      setStatus("Bounty loaded from Studionet");
    } catch (error: any) {
      setBounty(null);
      setSubmissions([]);
      setStatus(error?.message || "Bounty read failed");
    }
  }

  async function loadProgram(idArg?: string) {
    const id = (idArg || inspectProgramId).trim();
    if (!id) return setStatus("Enter a program ID.");
    try {
      const client: any = readClient();
      const address = contractAddress();
      const progress: ProgramProgress = await client.readContract({
        address,
        functionName: "get_program_progress",
        args: [id],
      });
      const countRaw = await client.readContract({
        address,
        functionName: "get_program_phase_count",
        args: [id],
      });
      const count = n(countRaw);
      const phases: BountyView[] = [];
      for (let index = 0; index < count; index += 1) {
        const phase = await client.readContract({
          address,
          functionName: "get_program_phase_id",
          args: [id, BigInt(index)],
        });
        phases.push(
          await client.readContract({
            address,
            functionName: "get_bounty",
            args: [phase],
          })
        );
      }
      setProgram(progress);
      setProgramPhases(phases);
      setInspectProgramId(id);
      setStatus("Program state loaded");
    } catch (error: any) {
      setProgram(null);
      setProgramPhases([]);
      setStatus(error?.message || "Program read failed");
    }
  }

  async function loadResearcher() {
    if (!researcher.trim()) return setStatus("Enter a researcher address.");
    try {
      const client: any = readClient();
      const data: ResearcherStats = await client.readContract({
        address: contractAddress(),
        functionName: "get_researcher_stats",
        args: [researcher.trim()],
      });
      setResearcherStats(data);
      setStatus("Researcher settlement history loaded");
    } catch (error: any) {
      setResearcherStats(null);
      setStatus(error?.message || "Researcher stats read failed");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>ResearchArena</a>
        <div className={styles.headerRight}>
          <span className={V2_CONFIGURED ? styles.live : styles.pending}>
            {V2_CONFIGURED ? "V2 LIVE · SOURCE VERIFIED" : "PRE-DEPLOY VERIFICATION"}
          </span>
          <a className={styles.proofLink} href={CANONICAL_WORKFLOW} target="_blank" rel="noreferrer">
            Canonical proof ↗
          </a>
          <button onClick={connect} disabled={busy}>
            {account ? short(account) : "Connect wallet"}
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>RESEARCH PROGRAMS · EVIDENCE-BOUND CONSENSUS · NATIVE GEN</p>
        <h1>ResearchArena <em>V2</em></h1>
        <p className={styles.lead}>
          Chain research phases together, lock GEN per phase, settle only evidence-backed winners,
          challenge once before payout, and expose objective researcher settlement history for other agents and apps.
        </p>
        <div className={styles.chips}>
          <span>Policy {POLICY}</span><span>Winner threshold 70/100</span><span>Max 8 phases</span>
          <span>1 challenge</span><span>24h stalled recovery</span><span>Canonical Studionet proof ✓</span>
        </div>
        {!V2_CONFIGURED && (
          <div className={styles.guard}>
            Production writes are intentionally disabled until direct tests, lint, SDK, frontend build,
            live Studionet lifecycle, source-match and reviewer proof all pass.
          </div>
        )}
      </section>

      <section className={styles.statusBar}>
        <div><small>STATUS</small><strong>{status}</strong></div>
        <div><small>CONTRACT</small><strong>{V2_CONFIGURED ? short(RAW_V2_ADDRESS) : "not promoted"}</strong></div>
        <div><small>LAST TX</small><strong>{lastTx ? short(lastTx) : "—"}</strong></div>
        {lastTx && <a href={explorerBase + "/transactions/" + lastTx} target="_blank" rel="noreferrer">Explorer ↗</a>}
      </section>

      <section className={styles.grid}>
        <form className={styles.card} onSubmit={createPhase}>
          <div className={styles.cardTitle}><span>01</span><div><b>Create program phase</b><small>Each phase locks its own GEN escrow.</small></div></div>
          <div className={styles.two}>
            <label>Program ID<input value={programId} onChange={(e) => setProgramId(e.target.value)} /></label>
            <label>Phase ID<input value={phaseId} onChange={(e) => setPhaseId(e.target.value)} /></label>
          </div>
          <label>Previous phase (blank for first)<input value={prerequisite} onChange={(e) => setPrerequisite(e.target.value)} /></label>
          <label>Research question<textarea value={question} onChange={(e) => setQuestion(e.target.value)} /></label>
          <label>Precommitted rubric<textarea value={rubric} onChange={(e) => setRubric(e.target.value)} /></label>
          <div className={styles.three}>
            <label>Reward GEN<input value={reward} onChange={(e) => setReward(e.target.value)} /></label>
            <label>Deadline hours<input value={deadlineHours} onChange={(e) => setDeadlineHours(e.target.value)} /></label>
            <label>Submission cap<input value={maxSubmissions} onChange={(e) => setMaxSubmissions(e.target.value)} /></label>
          </div>
          <button className={styles.primary} disabled={busy || !V2_CONFIGURED}>Lock GEN & create phase</button>
        </form>

        <form className={styles.card} onSubmit={submitResearch}>
          <div className={styles.cardTitle}><span>02</span><div><b>Submit research</b><small>One report + two independent HTTPS evidence domains.</small></div></div>
          <div className={styles.two}>
            <label>Phase / bounty ID<input value={submitBountyId} onChange={(e) => setSubmitBountyId(e.target.value)} /></label>
            <label>Submission ID<input value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} /></label>
          </div>
          <label>Public report URL<input value={reportUrl} onChange={(e) => setReportUrl(e.target.value)} placeholder="https://..." /></label>
          <label>Evidence source 1<input value={source1} onChange={(e) => setSource1(e.target.value)} placeholder="https://..." /></label>
          <label>Evidence source 2<input value={source2} onChange={(e) => setSource2(e.target.value)} placeholder="https://..." /></label>
          <button className={styles.primary} disabled={busy || !V2_CONFIGURED}>Submit immutable URLs</button>
        </form>
      </section>

      <section className={styles.card}>
        <div className={styles.cardTitle}><span>03</span><div><b>Judge, challenge & settle</b><small>Inspect the exact on-chain state before taking economic action.</small></div></div>
        <div className={styles.inspect}>
          <input value={inspectId} onChange={(e) => setInspectId(e.target.value)} placeholder="phase / bounty ID" />
          <button onClick={() => loadBounty()} disabled={busy || !V2_CONFIGURED}>Load</button>
          <button onClick={() => action("close_bounty", "Bounty closed")} disabled={busy || !V2_CONFIGURED}>Close</button>
          <button onClick={() => action("resolve_bounty", "Consensus resolution finalized")} disabled={busy || !V2_CONFIGURED}>Resolve</button>
          <button onClick={() => action("resolve_challenge", "Challenge re-resolved")} disabled={busy || !V2_CONFIGURED}>Re-resolve</button>
          <button onClick={() => action("claim_reward", "Winner reward claimed")} disabled={busy || !V2_CONFIGURED}>Claim</button>
          <button onClick={() => action("refund_rejected", "Rejected bounty refunded")} disabled={busy || !V2_CONFIGURED}>Refund</button>
        </div>
        <div className={styles.challenge}>
          <input value={challengeNote} onChange={(e) => setChallengeNote(e.target.value)} />
          <button onClick={challenge} disabled={busy || !V2_CONFIGURED}>Challenge once</button>
        </div>

        {bounty && (
          <div className={styles.result}>
            <div className={styles.resultTop}>
              <div><small>STATUS</small><strong>{bounty.status || "—"}</strong></div>
              <div><small>PROGRAM / PHASE</small><strong>{bounty.program_id || "—"} · #{n(bounty.phase_index) + 1}</strong></div>
              <div><small>ESCROW</small><strong>{formatGen(bounty.reward)}</strong></div>
              <div><small>CONSENSUS</small><strong className={settlementSafe ? styles.good : styles.bad}>{settlementSafe ? "materially valid" : "check failed"}</strong></div>
            </div>
            <h2>{bounty.question}</h2>
            <p>{bounty.rationale || "No settlement rationale yet."}</p>
            {n(bounty.resolution_round) > 1 && (
              <>
              <div className={styles.appealDiff}>
                <div><small>INITIAL WINNER</small><b>{bounty.initial_winner_submission_id || "No winner"}</b></div>
                <div><small>INITIAL SCORE</small><b>{n(bounty.initial_winning_score)}/100</b></div>
                <div><small>INITIAL REASON</small><b>{bounty.initial_reason_code || "—"}</b></div>
                <div><small>FRESH ROUND</small><b>#{n(bounty.resolution_round)}</b></div>
                <div><small>CURRENT WINNER</small><b>{bounty.winner_submission_id || "No winner"}</b></div>
                <div><small>CURRENT SCORE</small><b>{n(bounty.winning_score)}/100</b></div>
              </div>
              {bounty.challenge_note && <p className={styles.challengeHistory}><b>Challenge:</b> {bounty.challenge_note}</p>}
              </>
            )}
            <div className={styles.metrics}>
              <div><small>Winner</small><b>{bounty.winner_submission_id || "No winner"}</b></div>
              <div><small>Score</small><b>{n(bounty.winning_score)}/100</b></div>
              <div><small>Runner-up</small><b>{n(bounty.runner_up_score)}/100</b></div>
              <div><small>Reason</small><b>{bounty.reason_code || "—"}</b></div>
              <div><small>Entries</small><b>{n(bounty.submission_count)}/{n(bounty.max_submissions)}</b></div>
              <div><small>Challenges</small><b>{n(bounty.challenge_count)}/1</b></div>
            </div>
            <div className={styles.snapshots}>
              <article><small>WINNER REPORT SNAPSHOT</small><p>{bounty.winner_report_snapshot || "—"}</p></article>
              <article><small>EVIDENCE 1 SNAPSHOT</small><p>{bounty.winner_source_1_snapshot || "—"}</p></article>
              <article><small>EVIDENCE 2 SNAPSHOT</small><p>{bounty.winner_source_2_snapshot || "—"}</p></article>
            </div>
            {submissions.length > 0 && (
              <div className={styles.entries}>
                {submissions.map((item, index) => (
                  <article key={String(item?.id || index)}>
                    <span>#{index + 1}</span>
                    <div><b>{item?.id || "entry"}</b><small>{short(String(item?.researcher || ""))}</small></div>
                    <a href={String(item?.report_url || "#")} target="_blank" rel="noreferrer">Report ↗</a>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>04</span><div><b>Program progress</b><small>Read ordered phases and cumulative escrow.</small></div></div>
          <div className={styles.inspect}>
            <input value={inspectProgramId} onChange={(e) => setInspectProgramId(e.target.value)} />
            <button onClick={() => loadProgram()} disabled={!V2_CONFIGURED}>Load program</button>
          </div>
          {program && (
            <>
              <div className={styles.metrics}>
                <div><small>Phases</small><b>{n(program.total_phases)}</b></div>
                <div><small>Paid</small><b>{n(program.paid_phases)}</b></div>
                <div><small>Open</small><b>{n(program.open_phases)}</b></div>
                <div><small>Refunded</small><b>{n(program.refunded_phases)}</b></div>
                <div><small>Total escrow</small><b>{formatGen(program.total_reward)}</b></div>
                <div><small>Settled</small><b>{formatGen(program.settled_reward)}</b></div>
              </div>
              <div className={styles.timeline}>
                {programPhases.map((phase, index) => (
                  <button key={String(phase.id || index)} onClick={() => loadBounty(String(phase.id || ""))}>
                    <span>{index + 1}</span><div><b>{phase.id}</b><small>{phase.status} · {formatGen(phase.reward)}</small></div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}><span>05</span><div><b>Researcher settlement history</b><small>Objective on-chain outcomes, not an opaque reputation score.</small></div></div>
          <div className={styles.inspect}>
            <input value={researcher} onChange={(e) => setResearcher(e.target.value)} placeholder="0x researcher address" />
            <button onClick={loadResearcher} disabled={!V2_CONFIGURED}>Load stats</button>
          </div>
          {researcherStats && (
            <div className={styles.metrics}>
              <div><small>Submissions</small><b>{n(researcherStats.submissions)}</b></div>
              <div><small>Wins</small><b>{n(researcherStats.wins)}</b></div>
              <div><small>Paid wins</small><b>{n(researcherStats.paid_wins)}</b></div>
              <div><small>Challenges</small><b>{n(researcherStats.challenges_raised)}</b></div>
              <div><small>Total earned</small><b>{formatGen(researcherStats.total_earned)}</b></div>
            </div>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <span>ResearchArena V2 · GenLayer Studionet</span>
        <span>Deployment is the final promotion gate — never the development loop.</span>
      </footer>
    </main>
  );
}
