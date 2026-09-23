"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CONTRACT_ADDRESS,
  formatGen,
  parseGen,
  readClient,
  sendWrite,
  walletClient,
} from "../lib/genlayer";

type BountyView = {
  id?: string;
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
  rationale?: string;
  reward_claimed?: boolean;
};

const explorerBase = "https://explorer-studio.genlayer.com";

const verifiedDemo = {
  bountyId: "example-domain-research-v1",
  workflow: "https://github.com/maho0638/researcharena-genlayer/actions/runs/35912412402",
  transactions: [
    ["Create escrow", "0xad4b1139b373a2a56981dcf34455e6da52ecebfa1934054ab7cb3141c9d8d5d5"],
    ["Submit primary", "0xbe796ea1d7d3187b3b905897e682edbd4ccd346c5c4a784add109e400484226c"],
    ["Submit competitor", "0xfd6bca0f3dc250372033d63b4b416ee1779e1684d0a9f41a05b4e575d7bae46d"],
    ["Close entries", "0xb4ff58beec90ce06b20a6bd62fe13845430a2d718823f48527af2ad7088bd6de"],
    ["Resolve consensus", "0x772d1b88fa3b8ef1fca179fa00866b3228a6e9ffa9b5c2f816069bf36cd186b6"],
    ["Claim reward", "0xf193bdbb97ac9dae55939065718a07e1b0925cbcdc551d547cf6b6be39b3ef34"],
  ] as const,
};

function short(value?: string) {
  if (!value) return "—";
  if (value.length < 18) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function toTimestamp(hours: number) {
  return BigInt(Math.floor(Date.now() / 1000) + hours * 3600);
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function hostOf(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export default function Home() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<"create" | "submit" | "judge">("judge");
  const [copiedContract, setCopiedContract] = useState(false);

  const [bountyId, setBountyId] = useState("research-demo-1");
  const [question, setQuestion] = useState(
    "Which report most directly answers the research question with authoritative evidence?"
  );
  const [rubric, setRubric] = useState(
    "Prefer primary sources, independent corroboration, direct relevance, and internally consistent claims."
  );
  const [reward, setReward] = useState("0.01");
  const [hours, setHours] = useState("24");
  const [maxSubmissions, setMaxSubmissions] = useState("3");

  const [submitBountyId, setSubmitBountyId] = useState("research-demo-1");
  const [submissionId, setSubmissionId] = useState("entry-1");
  const [reportUrl, setReportUrl] = useState("");
  const [source1, setSource1] = useState("");
  const [source2, setSource2] = useState("");

  const [inspectId, setInspectId] = useState("example-domain-research-v1");
  const [bounty, setBounty] = useState<BountyView | null>(null);
  const [marketBounties, setMarketBounties] = useState<BountyView[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [lastTx, setLastTx] = useState("");

  const deployed = Boolean(CONTRACT_ADDRESS);
  const statusTone = useMemo(() => {
    const value = status.toLowerCase();
    if (value.includes("failed") || value.includes("error")) return "bad";
    if (value.includes("submitted") || value.includes("resolved") || value.includes("loaded") || value.includes("claimed")) return "good";
    return "neutral";
  }, [status]);

  useEffect(() => {
    if (deployed) {
      void loadBounty(verifiedDemo.bountyId);
      void loadMarket();
    }
  }, []);

  async function connectWallet() {
    try {
      setBusy(true);
      setStatus("Connecting wallet...");
      const { account: selected } = await walletClient();
      setAccount(selected);
      setStatus("Wallet connected");
    } catch (error: any) {
      setStatus(error?.message || "Wallet connection failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyContract() {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 1800);
    } catch {
      setStatus("Could not copy contract address");
    }
  }

  async function createBounty(event: FormEvent) {
    event.preventDefault();
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    if (!bountyId.trim() || !question.trim() || !rubric.trim()) {
      return setStatus("Bounty ID, question and scoring rubric are required.");
    }
    if (Number(reward) <= 0 || Number(hours) <= 0) {
      return setStatus("Reward and deadline must be greater than zero.");
    }

    try {
      setBusy(true);
      setStatus("Creating escrowed research bounty...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "create_bounty",
        args: [
          bountyId,
          question,
          rubric,
          toTimestamp(Number(hours)),
          BigInt(maxSubmissions),
        ],
        value: parseGen(reward),
      });
      setLastTx(hash);
      setInspectId(bountyId);
      setSubmitBountyId(bountyId);
      setStatus("Bounty submitted on GenLayer");
      await loadMarket();
    } catch (error: any) {
      setStatus(error?.message || "Create bounty failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitResearch(event: FormEvent) {
    event.preventDefault();
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    if (!submitBountyId.trim() || !submissionId.trim()) {
      return setStatus("Bounty ID and submission ID are required.");
    }
    if (![reportUrl, source1, source2].every(isHttpsUrl)) {
      return setStatus("Report and both evidence links must use HTTPS.");
    }
    if (hostOf(source1) === hostOf(source2)) {
      return setStatus("Primary and independent evidence must use different domains.");
    }

    try {
      setBusy(true);
      setStatus("Submitting research evidence...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "submit_research",
        args: [submitBountyId, submissionId, reportUrl, source1, source2],
      });
      setLastTx(hash);
      setInspectId(submitBountyId);
      setStatus("Research submission accepted");
    } catch (error: any) {
      setStatus(error?.message || "Submit research failed");
    } finally {
      setBusy(false);
    }
  }

  async function closeBounty() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setBusy(true);
      setStatus("Closing submissions...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "close_bounty",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Bounty closed for judging");
      await loadBounty();
    } catch (error: any) {
      setStatus(error?.message || "Close failed");
    } finally {
      setBusy(false);
    }
  }

  async function resolveBounty() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setBusy(true);
      setStatus("Validators are evaluating live evidence...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "resolve_bounty",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Bounty resolved by validator consensus");
      await loadBounty();
      await loadMarket();
    } catch (error: any) {
      setStatus(error?.message || "Resolve failed");
    } finally {
      setBusy(false);
    }
  }

  async function refundUnfilledBounty() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setBusy(true);
      setStatus("Refunding an unfilled bounty...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "refund_unfilled_bounty",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Unfilled bounty refunded");
      await loadBounty();
      await loadMarket();
    } catch (error: any) {
      setStatus(error?.message || "Refund failed");
    } finally {
      setBusy(false);
    }
  }

  async function claimReward() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setBusy(true);
      setStatus("Claiming escrowed GEN reward...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "claim_reward",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Winner reward claimed");
      await loadBounty();
      await loadMarket();
    } catch (error: any) {
      setStatus(error?.message || "Claim failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadMarket() {
    if (!deployed) return;
    try {
      const client: any = readClient();
      const countRaw: any = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_bounty_count",
        args: [],
      });
      const total = Number(countRaw ?? 0);
      const start = Math.max(0, total - 6);
      const loaded: BountyView[] = [];

      for (let index = start; index < total; index++) {
        const id: any = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_bounty_id",
          args: [BigInt(index)],
        });
        const item: any = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_bounty",
          args: [id],
        });
        loaded.push(item);
      }

      setMarketBounties(loaded.reverse());
    } catch {
      setMarketBounties([]);
    }
  }

  async function loadBounty(targetId?: string) {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    const id = targetId || inspectId;
    try {
      setStatus("Reading on-chain bounty...");
      const client: any = readClient();
      const data: any = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_bounty",
        args: [id],
      });
      setBounty(data);

      const count = Number(data?.submission_count ?? 0);
      const loaded: any[] = [];
      for (let index = 0; index < Math.min(count, 5); index++) {
        const sid = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_submission_id",
          args: [id, BigInt(index)],
        });
        const submission = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_submission",
          args: [id, sid],
        });
        loaded.push(submission);
      }
      setSubmissions(loaded);
      setStatus("Bounty loaded");
    } catch (error: any) {
      setStatus(error?.message || "Read failed");
      setBounty(null);
      setSubmissions([]);
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#">
          <img className="brandLogo" src="/researcharena-logo.webp" alt="ResearchArena logo" />
          <span>
            <strong>ResearchArena</strong>
            <small>Consensus research market</small>
          </span>
        </a>
        <div className="navLinks">
          <a href="#market">Market</a>
          <a href="#proof">Live proof</a>
          <a href="#app">Workspace</a>
          <a href="#why">Why GenLayer</a>
          <button className="wallet" onClick={connectWallet} disabled={busy}>
            <span className="walletDot" />
            {account ? short(account) : "Connect wallet"}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <div className="heroEyebrow">
            <span className="verifiedPill"><i /> LIVE ON STUDIONET</span>
            <span>Chain 61999 · Native GEN settlement</span>
          </div>
          <span className="kicker">ESCROW + LIVE WEB + VALIDATOR CONSENSUS</span>
          <h1>
            Pay for the <em>best-supported</em> research, not the loudest answer.
          </h1>
          <p>
            Sponsors lock GEN behind a natural-language research brief.
            Researchers compete with public reports and evidence. GenLayer reads
            the live sources, judges every entry under the same rubric, and
            settles the bounty to the consensus-selected winner.
          </p>
          <div className="heroActions">
            <a className="primaryCta" href="#app" onClick={() => setWorkspaceTab("create")}>Launch a bounty</a>
            <a className="ghostCta" href="#proof">Inspect verified settlement</a>
          </div>
          <div className="heroTrust">
            <span>✓ Escrow before competition</span>
            <span>✓ Independent evidence domains</span>
            <span>✓ Validator re-execution</span>
          </div>
        </div>

        <div className="heroPanel">
          <div className="panelIdentity">
            <img src="/researcharena-logo.webp" alt="ResearchArena" />
            <div>
              <small>RESEARCHARENA PROTOCOL</small>
              <strong>Evidence-backed settlement</strong>
            </div>
            <span className="identitySeal">RA</span>
          </div>
          <div className="panelTop">
            <span className="pulse" />
            <span>{deployed ? "LIVE ON STUDIONET" : "DEPLOYMENT PENDING"}</span>
            <code>61999</code>
          </div>
          <div className="flow">
            <div><b>01</b><span>GEN escrow</span><small>Economic consequence</small></div>
            <i>→</i>
            <div><b>02</b><span>Evidence race</span><small>Independent reports</small></div>
            <i>→</i>
            <div><b>03</b><span>AI consensus</span><small>Validator re-check</small></div>
            <i>→</i>
            <div><b>04</b><span>Winner claim</span><small>Native GEN payout</small></div>
          </div>
          <div className="contractRow">
            <span>Contract</span>
            <code>{deployed ? short(CONTRACT_ADDRESS) : "not deployed yet"}</code>
            {deployed && (
              <a
                href={`${explorerBase}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                Explorer ↗
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="trustStrip">
        <div><strong>2–5</strong><span>competing reports</span></div>
        <div><strong>3 URLs</strong><span>report + 2 evidence sources</span></div>
        <div><strong>1 winner</strong><span>consensus-selected</span></div>
        <div><strong>GEN</strong><span>native escrow & payout</span></div>
      </section>

      <section className="signalGrid">
        <article>
          <span className="signalIcon">◎</span>
          <div><b>Escrowed stake</b><p>Rewards are locked before researchers compete.</p></div>
        </article>
        <article>
          <span className="signalIcon">⌁</span>
          <div><b>Independent evidence</b><p>Each entry carries public sources from separate domains.</p></div>
        </article>
        <article>
          <span className="signalIcon">✦</span>
          <div><b>Consensus settlement</b><p>Validators re-check the same live evidence before payout.</p></div>
        </article>
      </section>

      <section className="marketSection" id="market">
        <div className="marketHeader">
          <div className="sectionHeading">
            <span>LIVE MARKET</span>
            <h2>One market. One auditable winner.</h2>
            <p>
              ResearchArena turns a subjective research brief into an escrowed,
              evidence-backed market that anyone can inspect on-chain.
            </p>
          </div>
          <div className="networkBadge">
            <span className="pulse" />
            Studionet operational
            <b>61999</b>
          </div>
        </div>

        <div className="marketBoard">
          <article className="featuredBounty">
            <div className="featuredTop">
              <div>
                <span className="miniLabel">VERIFIED BOUNTY</span>
                <h3>{verifiedDemo.bountyId}</h3>
              </div>
              <span className={"badge " + String(bounty?.status || "loading").toLowerCase()}>
                {bounty?.status || "Loading"}
              </span>
            </div>
            <p className="featuredQuestion">
              {bounty?.question || "Loading the canonical on-chain benchmark..."}
            </p>
            <div className="featuredMetrics">
              <div><small>Entries</small><strong>{String(bounty?.submission_count ?? "—")}</strong></div>
              <div><small>Winner</small><strong>{bounty?.winner_submission_id || "—"}</strong></div>
              <div><small>Score</small><strong>{bounty?.winning_score ? String(bounty.winning_score) + "/100" : "—"}</strong></div>
              <div><small>Reason</small><strong>{bounty?.reason_code || "—"}</strong></div>
            </div>
            <div className="featuredActions">
              <a href="#proof">Audit settlement</a>
              <button onClick={() => { setWorkspaceTab("judge"); document.getElementById("app")?.scrollIntoView({ behavior: "smooth" }); }}>
                Open in workspace
              </button>
            </div>
          </article>

          <aside className="protocolPanel">
            <div className="protocolHeader">
              <span>Protocol health</span>
              <b>VERIFIED</b>
            </div>
            <div className="protocolRow"><span>Contract</span><code>{short(CONTRACT_ADDRESS)}</code></div>
            <div className="protocolRow"><span>Consensus</span><strong>Independent re-check</strong></div>
            <div className="protocolRow"><span>Evidence rule</span><strong>2 independent hosts</strong></div>
            <div className="protocolRow"><span>Economic action</span><strong>GEN escrow → winner</strong></div>
            <div className="protocolRow"><span>CI / GenVM</span><strong className="healthy">Passing</strong></div>
            <a className="protocolLink" href={verifiedDemo.workflow} target="_blank" rel="noreferrer">Open verification run ↗</a>
          </aside>
        </div>

        <div className="marketListHeader">
          <div>
            <span className="miniLabel">ON-CHAIN DISCOVERY</span>
            <h3>Indexed bounties</h3>
          </div>
          <span>{marketBounties.length ? String(marketBounties.length) + " loaded" : "Loading markets…"}</span>
        </div>
        <div className="marketList">
          {marketBounties.length ? marketBounties.map((item) => (
            <button
              className="marketCard"
              key={item.id}
              onClick={() => {
                if (!item.id) return;
                setInspectId(item.id);
                setWorkspaceTab("judge");
                void loadBounty(item.id);
                document.getElementById("app")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="marketCardTop">
                <span>{item.status || "UNKNOWN"}</span>
                <small>{formatGen(item.reward)}</small>
              </div>
              <strong>{item.id}</strong>
              <p>{item.question}</p>
              <div className="marketCardMeta">
                <span>{String(item.submission_count ?? 0)} entries</span>
                <span>{item.winner_submission_id ? "Winner: " + item.winner_submission_id : "Awaiting settlement"}</span>
              </div>
            </button>
          )) : (
            <div className="marketEmpty">Reading the on-chain bounty index…</div>
          )}
        </div>
      </section>

      <section className="proofSection" id="proof">
        <div className="sectionHeading">
          <span>VERIFIED LIVE PROOF</span>
          <h2>A complete bounty settled on Studionet.</h2>
          <p>
            No wallet is required to audit this demo. The page loads the stored
            result directly from the deployed Intelligent Contract, and every
            transaction in the lifecycle is linked below.
          </p>
        </div>

        <div className="proofGrid">
          <div className="proofResult">
            <div className="proofTop">
              <span className="liveDot" />
              <strong>Consensus settlement</strong>
              <a href={verifiedDemo.workflow} target="_blank" rel="noreferrer">
                CI proof ↗
              </a>
            </div>
            <div className="proofMetrics">
              <div><small>Bounty</small><b>{verifiedDemo.bountyId}</b></div>
              <div><small>Status</small><b>{bounty?.status || "Loading..."}</b></div>
              <div><small>Winner</small><b>{bounty?.winner_submission_id || "Loading..."}</b></div>
              <div><small>Score</small><b>{bounty?.winning_score ? `${bounty.winning_score}/100` : "Loading..."}</b></div>
              <div><small>Runner-up</small><b>{bounty?.runner_up_score ? `${bounty.runner_up_score}/100` : "Loading..."}</b></div>
              <div><small>Agreed reason</small><b>{bounty?.reason_code || "Loading..."}</b></div>
              <div><small>Reward claimed</small><b>{bounty?.reward_claimed ? "Yes" : "Loading..."}</b></div>
            </div>
            {bounty?.rationale && <blockquote>{bounty.rationale}</blockquote>}
          </div>

          <div className="proofTransactions">
            {verifiedDemo.transactions.map(([label, hash], index) => (
              <a
                key={hash}
                href={`${explorerBase}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{label}</b><small>{short(hash)}</small></div>
                <i>↗</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="workspace" id="app">
        <div className="workspaceHeader">
          <div className="sectionHeading">
            <span>PROTOCOL WORKSPACE</span>
            <h2>Run the full transaction lifecycle.</h2>
            <p>
              Create, compete and settle through the Intelligent Contract directly.
              Every write waits for GenLayer finalization before the UI reports success.
            </p>
          </div>
          <div className={"systemStatus workspaceStatus " + statusTone}>
            <span />
            {busy ? "Transaction in progress…" : status}
          </div>
        </div>

        <div className="workspaceShell">
          <div className="workspaceTabs">
            <button className={workspaceTab === "create" ? "active" : ""} onClick={() => setWorkspaceTab("create")}>
              <small>01</small><span>Create bounty</span><b>Sponsor</b>
            </button>
            <button className={workspaceTab === "submit" ? "active" : ""} onClick={() => setWorkspaceTab("submit")}>
              <small>02</small><span>Submit research</span><b>Researcher</b>
            </button>
            <button className={workspaceTab === "judge" ? "active" : ""} onClick={() => setWorkspaceTab("judge")}>
              <small>03</small><span>Resolve market</span><b>Consensus</b>
            </button>
          </div>

          <div className="workspaceMain">
            <div className="formsGrid">
          {workspaceTab === "create" && <form id="create" className="card appCard" onSubmit={createBounty}>
            <div className="cardNumber">01</div>
            <h3>Create an escrowed bounty</h3>
            <p className="cardIntro">
              Define the research target and the exact scoring rules before
              anyone submits.
            </p>

            <label>
              Bounty ID
              <input value={bountyId} onChange={(e) => setBountyId(e.target.value)} />
            </label>
            <label>
              Research question
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
            </label>
            <label>
              Scoring rubric
              <textarea value={rubric} onChange={(e) => setRubric(e.target.value)} />
            </label>
            <div className="split">
              <label>
                Reward (GEN)
                <input value={reward} onChange={(e) => setReward(e.target.value)} />
              </label>
              <label>
                Deadline (hours)
                <input value={hours} onChange={(e) => setHours(e.target.value)} />
              </label>
              <label>
                Max entries
                <select
                  value={maxSubmissions}
                  onChange={(e) => setMaxSubmissions(e.target.value)}
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </label>
            </div>
            <div className="formFootnote">Funds remain locked in the Intelligent Contract until consensus settlement or guarded refund.</div>
            <button className="action" type="submit" disabled={busy}>{busy ? "Processing…" : "Lock GEN & create bounty"}</button>
          </form>}

          {workspaceTab === "submit" && <form id="submit" className="card appCard" onSubmit={submitResearch}>
            <div className="cardNumber">02</div>
            <h3>Submit a research entry</h3>
            <p className="cardIntro">
              Each wallet gets one entry per bounty. Evidence must be public and
              HTTPS-addressable.
            </p>

            <label>
              Bounty ID
              <input
                value={submitBountyId}
                onChange={(e) => setSubmitBountyId(e.target.value)}
              />
            </label>
            <label>
              Submission ID
              <input
                value={submissionId}
                onChange={(e) => setSubmissionId(e.target.value)}
              />
            </label>
            <label>
              Public report URL
              <input
                placeholder="https://..."
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
              />
            </label>
            <label>
              Primary evidence URL
              <input
                placeholder="https://..."
                value={source1}
                onChange={(e) => setSource1(e.target.value)}
              />
            </label>
            <label>
              Independent evidence URL
              <input
                placeholder="https://..."
                value={source2}
                onChange={(e) => setSource2(e.target.value)}
              />
            </label>
            <div className="sourceRule">
              <b>Evidence rule</b>
              <span>Both evidence URLs must be HTTPS and come from different domains.</span>
            </div>
            <button className="action" type="submit" disabled={busy}>{busy ? "Processing…" : "Enter the research arena"}</button>
          </form>}
        </div>

        {workspaceTab === "judge" && <div id="judge" className="judge card appCard">
          <div className="judgeHeader">
            <div>
              <div className="cardNumber">03</div>
              <h3>Close, judge, settle</h3>
              <p className="cardIntro">
                GenLayer fetches every report and citation, then validators
                independently confirm the winning entry.
              </p>
            </div>
            <div className={`systemStatus ${statusTone}`}>
              <span />
              {status}
            </div>
          </div>

          <div className="inspectControls">
            <label>
              Bounty ID
              <input value={inspectId} onChange={(e) => setInspectId(e.target.value)} />
            </label>
            <button onClick={() => void loadBounty()} disabled={busy}>Read state</button>
            <button onClick={closeBounty} disabled={busy}>Close entries</button>
            <button className="resolve" onClick={resolveBounty} disabled={busy}>Resolve by consensus</button>
            <button onClick={claimReward} disabled={busy}>Claim winner reward</button>
            <button onClick={refundUnfilledBounty} disabled={busy}>Refund unfilled</button>
          </div>

          {lastTx && (
            <div className="txLine">
              <span>Latest transaction</span>
              <a href={`${explorerBase}/tx/${lastTx}`} target="_blank" rel="noreferrer">
                {short(lastTx)} ↗
              </a>
            </div>
          )}

          <div className="resultGrid">
            <div className="resultMain">
              <span className="miniLabel">ON-CHAIN BOUNTY</span>
              {bounty ? (
                <>
                  <div className="resultTitle">
                    <h4>{bounty.id}</h4>
                    <span className={`badge ${String(bounty.status).toLowerCase()}`}>
                      {bounty.status}
                    </span>
                  </div>
                  <p>{bounty.question}</p>
                  <div className="metrics">
                    <div><small>Escrow</small><strong>{formatGen(bounty.reward)}</strong></div>
                    <div><small>Entries</small><strong>{String(bounty.submission_count ?? 0)}</strong></div>
                    <div><small>Winner</small><strong>{bounty.winner_submission_id || "Pending"}</strong></div>
                    <div><small>Score</small><strong>{bounty.winning_score ? `${bounty.winning_score}/100` : "—"}</strong></div>
                  </div>
                  {bounty.rationale && (
                    <blockquote>{bounty.rationale}</blockquote>
                  )}
                </>
              ) : (
                <p className="empty">
                  Read a bounty to inspect its escrow, entries and consensus verdict.
                </p>
              )}
            </div>

            <div className="entryList">
              <span className="miniLabel">COMPETING ENTRIES</span>
              {submissions.length ? submissions.map((entry, index) => (
                <div className="entry" key={entry?.id || index}>
                  <div>
                    <b>{entry?.id || `entry-${index + 1}`}</b>
                    <small>{short(entry?.researcher)}</small>
                  </div>
                  <a href={entry?.report_url} target="_blank" rel="noreferrer">
                    Report ↗
                  </a>
                </div>
              )) : <p className="empty">No entries loaded.</p>}
            </div>
          </div>
        </div>}
          </div>
        </div>
      </section>

      <section className="rulesSection">
        <div className="sectionHeading">
          <span>MARKET GUARDRAILS</span>
          <h2>Rules that protect the settlement.</h2>
          <p>These checks are enforced by the contract or mirrored in the frontend before a transaction is sent.</p>
        </div>
        <div className="rulesGrid">
          <article><b>01</b><h3>Escrow first</h3><p>A sponsor cannot create a bounty without locking a positive native GEN reward.</p></article>
          <article><b>02</b><h3>One entry per wallet</h3><p>Each researcher address gets one submission per bounty, reducing spam and duplicate influence.</p></article>
          <article><b>03</b><h3>Independent sources</h3><p>Supporting evidence must use separate HTTPS hostnames before it can enter the judging set.</p></article>
          <article><b>04</b><h3>Consensus before payout</h3><p>The winner, scores and structured reason code must survive validator re-execution before claim.</p></article>
        </div>
      </section>

      <section className="why" id="why">
        <div>
          <span className="kicker">WHY GENLAYER IS CENTRAL</span>
          <h2>A normal smart contract cannot do this.</h2>
        </div>
        <div className="whyGrid">
          <article>
            <b>01</b>
            <h3>Live web evidence</h3>
            <p>Every report and citation is rendered at judgment time with GenLayer web access.</p>
          </article>
          <article>
            <b>02</b>
            <h3>Subjective but auditable</h3>
            <p>A shared rubric turns messy research quality into a structured winner and score.</p>
          </article>
          <article>
            <b>03</b>
            <h3>Validator re-execution</h3>
            <p>The leader proposes a winner; validators independently repeat the evidence review.</p>
          </article>
          <article>
            <b>04</b>
            <h3>Economic settlement</h3>
            <p>The result unlocks real native GEN held in escrow for the winning researcher.</p>
          </article>
        </div>
      </section>

      <footer>
        <div className="footerBrand">
          <img src="/researcharena-logo.webp" alt="ResearchArena" />
          <div>
            <strong>ResearchArena</strong>
            <span>Competitive research with on-chain consequences.</span>
          </div>
        </div>
        <div>
          <a href="https://github.com/maho0638/researcharena-genlayer" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          {deployed && (
            <a href={`${explorerBase}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
              GenLayer Explorer ↗
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}
