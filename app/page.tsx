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
  workflow: "https://github.com/maho0638/researcharena-genlayer/actions/runs/35881343633",
  transactions: [
    ["Create escrow", "0x2449fde5eb396e2a6e395f294b16a0c8244e5735dbfd8b3f1d885d535aae70ce"],
    ["Submit primary", "0x88e8580ac40751891dc9ae32f89808b2bda08f8df5c89f1344cada6aaab86445"],
    ["Submit competitor", "0xa6650fc4c5ca6c16f82444427ed056975e2f9e93ec253ea10a5eaed5abf8b483"],
    ["Close entries", "0x66e8b7d083112f7fec43577ce11447b15554ed6dae275abb441da38c3de347a3"],
    ["Resolve consensus", "0xbe2332d2c8db6819ffaae661edfbea023763638e1157852a8c62d7036217cd28"],
    ["Claim reward", "0x9ccd75dd3d210eaa76ee1ddd3f0e111598ebc7550df0c5c23be08295459db237"],
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

export default function Home() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Ready");

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
    if (deployed) void loadBounty(verifiedDemo.bountyId);
  }, []);

  async function connectWallet() {
    try {
      setStatus("Connecting wallet...");
      const { account: selected } = await walletClient();
      setAccount(selected);
      setStatus("Wallet connected");
    } catch (error: any) {
      setStatus(error?.message || "Wallet connection failed");
    }
  }

  async function createBounty(event: FormEvent) {
    event.preventDefault();
    if (!deployed) return setStatus("Contract deployment is not configured yet.");

    try {
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
    } catch (error: any) {
      setStatus(error?.message || "Create bounty failed");
    }
  }

  async function submitResearch(event: FormEvent) {
    event.preventDefault();
    if (!deployed) return setStatus("Contract deployment is not configured yet.");

    try {
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
    }
  }

  async function closeBounty() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
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
    }
  }

  async function resolveBounty() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setStatus("Validators are evaluating live evidence...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "resolve_bounty",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Bounty resolved by validator consensus");
      await loadBounty();
    } catch (error: any) {
      setStatus(error?.message || "Resolve failed");
    }
  }

  async function refundUnfilledBounty() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setStatus("Refunding an unfilled bounty...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "refund_unfilled_bounty",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Unfilled bounty refunded");
      await loadBounty();
    } catch (error: any) {
      setStatus(error?.message || "Refund failed");
    }
  }

  async function claimReward() {
    if (!deployed) return setStatus("Contract deployment is not configured yet.");
    try {
      setStatus("Claiming escrowed GEN reward...");
      const hash = await sendWrite({
        address: CONTRACT_ADDRESS,
        functionName: "claim_reward",
        args: [inspectId],
      });
      setLastTx(hash);
      setStatus("Winner reward claimed");
      await loadBounty();
    } catch (error: any) {
      setStatus(error?.message || "Claim failed");
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
          <a href="#create">Create</a>
          <a href="#submit">Compete</a>
          <a href="#judge">Judge</a>
          <button className="wallet" onClick={connectWallet}>
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
            <a className="primaryCta" href="#create">Launch a bounty</a>
            <a className="ghostCta" href="#judge">Inspect live proof</a>
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

      <section className="workspace">
        <div className="sectionHeading">
          <span>RUN THE MARKET</span>
          <h2>Full transaction lifecycle</h2>
          <p>
            The interface calls the Intelligent Contract directly. No off-chain
            admin decides the winner.
          </p>
        </div>

        <div className="formsGrid">
          <form id="create" className="card" onSubmit={createBounty}>
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
            <button className="action" type="submit">Lock GEN & create bounty</button>
          </form>

          <form id="submit" className="card" onSubmit={submitResearch}>
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
            <button className="action" type="submit">Enter the research arena</button>
          </form>
        </div>

        <div id="judge" className="judge card">
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
            <button onClick={() => void loadBounty()}>Read state</button>
            <button onClick={closeBounty}>Close entries</button>
            <button className="resolve" onClick={resolveBounty}>Resolve by consensus</button>
            <button onClick={claimReward}>Claim winner reward</button>
            <button onClick={refundUnfilledBounty}>Refund unfilled</button>
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
        </div>
      </section>

      <section className="why">
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
