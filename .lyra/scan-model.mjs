/* MAP Control Centre — portfolio source-of-truth + freshness model.
 *
 * Pure logic, no I/O. Shared by:
 *   - tools/sync/scan.mjs   (the local companion scanner, Node)
 *   - app/api/sync/import   (the hosted import endpoint, via TS types)
 *   - tests/                (vitest)
 *
 * Two jobs:
 *   1. Decide WHICH document in a repo speaks for the current state of a field.
 *   2. Decide HOW FRESH the Control Centre's stored record is versus the repo.
 *
 * It never reads files and never holds a secret value.
 */

/* ---------------------------------------------------------------- sources */

/* Document classes, strongest first. A newer SESSION_HANDOVER may outrank an
   older PROJECT_OPERATING_STATE — that is deliberate (§Step 2) and is handled
   by rankDoc(): rank is the primary key, recency the tie-breaker, but a
   handover that is NEWER than the operating state wins outright. */
export const DOC_CLASS = {
  founder: "founder",           // founder-confirmed structured data (lives in the CC, not the repo)
  handover: "handover",         // SESSION_HANDOVER.md — last session, next action
  currentStatus: "currentStatus", // CURRENT_PROJECT_STATUS.md — explicit "freshest snapshot" docs
  operatingState: "operatingState", // PROJECT_OPERATING_STATE.md — current reality
  decisions: "decisions",       // FOUNDER_DECISIONS.md
  deployment: "deployment",     // LIVE_READINESS / LIVE_STATE_REPORT — deployment evidence
  git: "git",                   // repository/commit evidence
  readme: "readme",             // README + general project docs
  buildLog: "buildLog",         // BUILD_LOG.md — historical narrative
  superseded: "superseded",     // explicitly marked historical/superseded
};

export const DOC_RANK = {
  founder: 100,
  handover: 80,
  currentStatus: 78,
  operatingState: 70,
  decisions: 60,
  deployment: 50,
  git: 45,
  readme: 30,
  buildLog: 15,
  superseded: 0,
};

/* Default filename → class map. Repos are NOT assumed to share filenames; a
   file that is absent simply contributes nothing, and unknown files fall back
   to `readme` (low confidence) rather than being trusted. */
export const DEFAULT_DOC_MAP = {
  "SESSION_HANDOVER.md": DOC_CLASS.handover,
  "HANDOVER.md": DOC_CLASS.handover,
  "CURRENT_PROJECT_STATUS.md": DOC_CLASS.currentStatus,
  "CURRENT_STATUS.md": DOC_CLASS.currentStatus,
  "PROJECT_OPERATING_STATE.md": DOC_CLASS.operatingState,
  "STATE_OF_PLAY.md": DOC_CLASS.operatingState,
  "docs/STATE_OF_PLAY.md": DOC_CLASS.operatingState,
  "FOUNDER_DECISIONS.md": DOC_CLASS.decisions,
  "LIVE_READINESS.md": DOC_CLASS.deployment,
  "docs/LIVE_READINESS.md": DOC_CLASS.deployment,
  "docs/production-launch/LIVE_STATE_REPORT.md": DOC_CLASS.deployment,
  "REALITY_LEDGER.md": DOC_CLASS.deployment,
  "docs/REALITY_LEDGER.md": DOC_CLASS.deployment,
  "AI_START_HERE.md": DOC_CLASS.readme,
  "README.md": DOC_CLASS.readme,
  "CLAUDE.md": DOC_CLASS.readme,
  "STATE.md": DOC_CLASS.readme,
  "BUILD_LOG.md": DOC_CLASS.buildLog,
};

/* Documents whose CONTENT declares them historical. Checked against the head of
   the file so a passing mention deep in a log does not demote a live doc. */
const SUPERSEDED_MARKERS = [
  /\bSUPERSEDED\b/i,
  /\bHISTORICAL ONLY\b/i,
  /\bRETAINED FOR (THE )?HISTORICAL RECORD\b/i,
  /\bdo not act on (this|them)\b/i,
  /\bthis file never holds content\b/i,
];

export function looksSuperseded(headText) {
  return SUPERSEDED_MARKERS.some((re) => re.test(headText));
}

/* Many MAP repos publish their own "which documents are historical" table in
   AI_START_HERE.md. Honour it: it is the project's own explicit supersession
   statement and outranks our defaults (§Step 2). Returns lowercase basenames. */
export function parseHistoricalDeclarations(startHereText) {
  if (!startHereText) return [];
  const out = new Set();
  const lines = startHereText.split(/\r?\n/);
  let inHistorical = false;
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) {
      inHistorical = /historical|do not act on|superseded/i.test(line);
      continue;
    }
    if (!inHistorical) continue;
    if (!line.trim()) continue;
    for (const m of line.matchAll(/`([^`]+?\.md)`/g)) {
      out.add(m[1].split("/").pop().toLowerCase());
    }
    for (const m of line.matchAll(/`([^`]*?\*\*)`/g)) {
      out.add(m[1].toLowerCase()); // glob-ish entries e.g. `Product Foundation/**`
    }
  }
  return [...out];
}

/* Rank two candidate documents for the SAME field. Returns the winner.
   Rule: higher class rank wins; equal ranks break on date; and a handover that
   is strictly newer than the operating state wins outright, because a fresh
   handover is the most current statement a repo makes about itself. */
export function rankDoc(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ra = DOC_RANK[a.cls] ?? 0;
  const rb = DOC_RANK[b.cls] ?? 0;

  /* Within the "current-state family" the DATE decides, in both directions.
     A newer handover outranks an older operating state (it is the most recent
     thing the repo says about itself) — but a stale handover must NOT outrank a
     freshly-updated operating state, which is the same rule run the other way. */
  const CURRENT_STATE_FAMILY = [DOC_CLASS.handover, DOC_CLASS.currentStatus, DOC_CLASS.operatingState];
  const bothCurrentState =
    CURRENT_STATE_FAMILY.includes(a.cls) && CURRENT_STATE_FAMILY.includes(b.cls);
  if (bothCurrentState && a.date && b.date && a.date !== b.date) {
    return a.date > b.date ? a : b;
  }

  if (ra !== rb) return ra > rb ? a : b;
  if ((a.date ?? "") !== (b.date ?? "")) return (a.date ?? "") > (b.date ?? "") ? a : b;
  return a;
}

/* A historical document can never win, whatever its date. */
export function isUsable(doc) {
  return !!doc && doc.cls !== DOC_CLASS.superseded && (DOC_RANK[doc.cls] ?? 0) > 0;
}

/* --------------------------------------------------------------- redaction */

/* Extraction quotes real document text, and some portfolio docs are known to
   contain plaintext credentials. Redact BEFORE anything leaves the machine. */
const SECRET_PATTERNS = [
  /\b(sk|pk|rk)[-_][A-Za-z0-9]{16,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}[A-Za-z0-9._-]*/g,
  /\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}/g,
  /-----BEGIN[\s\S]{0,40}?PRIVATE KEY-----/g,
  /\b(postgres(ql)?|mysql|mongodb(\+srv)?|redis|amqp):\/\/[^\s"']*@[^\s"']*/gi,
  /\b(password|passwd|pwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[^\s"'`,;]{6,}/gi,
];

export function redact(text) {
  if (!text) return text;
  let out = String(text);
  for (const re of SECRET_PATTERNS) out = out.replace(re, "[redacted]");
  /* Belt and braces: a long opaque run that looks like a generated credential.
     Deliberately excludes "/" and "." so file paths and URLs are not mangled,
     and requires BOTH letters and digits so prose and SCREAMING_SNAKE env-var
     names survive intact. */
  out = out.replace(/\b[A-Za-z0-9+_-]{40,}\b/g, (m) =>
    /[a-z]/.test(m) && /[A-Z]/.test(m) && /\d/.test(m) ? "[redacted]" : m
  );
  return out;
}

export function excerpt(text, max = 180) {
  if (!text) return undefined;
  const clean = redact(String(text)).replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

/* -------------------------------------------------------------- extraction */

const DATE_RE = /(20\d{2})-(\d{2})-(\d{2})/;

/* The date a document CLAIMS for itself ("Updated: 2026-08-16",
   "Last reviewed: …", "Snapshot date: …"). Falls back to null — callers then
   use the file's last COMMIT date, which is far more reliable than mtime. */
export function docSelfDate(headText) {
  if (!headText) return null;
  const labelled = /(?:updated|last reviewed|snapshot date|as at|last updated)\s*[::]?\s*\**\s*(20\d{2}-\d{2}-\d{2})/i.exec(headText);
  if (labelled) return labelled[1];
  const any = DATE_RE.exec(headText);
  return any ? any[0] : null;
}

/* Release/version evidence, e.g. "Web live: Fly v163", "v41 deployed",
   "Build 27", "release v2.1.0". Returns the strongest single match. */
export function extractRelease(text) {
  if (!text) return null;
  const patterns = [
    /(?:web\s+)?live\s*[::]?\s*(?:on\s+)?Fly\s+(v\d+)/i,
    /\bFly\s+(v\d+)\b/i,
    /\b(v\d+(?:\.\d+)*)\s+(?:is\s+)?(?:deployed|live|released|shipped)\b/i,
    /\b(?:deployed|live|released|shipped)\s+(v\d+(?:\.\d+)*)\b/i,
    /\bBuild\s+(\d+)\s+(?:is\s+)?(?:the\s+)?(?:release candidate|shipped|live)/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const raw = m[1];
    // "v0" is a placeholder, not a release — it wrongly overwrote Mergehold's
    // accurate "Local Godot build only" with a fictitious "v0 live".
    if (/^v0(\.0)*$/i.test(raw)) continue;
    return /^v/i.test(raw) ? raw : `Build ${raw}`;
  }
  return null;
}

/* Two git remotes are the same remote if they point at the same host+path;
   "github.com/x/y (private)" and "https://github.com/x/y.git" are one fact.
   Used so a curated, annotated remote is not flattened into a bare URL. */
export function sameRemote(a, b) {
  /* A remote never contains whitespace, and the register's annotations —
     "(private)", "— master is 50 commits behind" — always follow some. So the
     first token IS the remote. (This used to cut at the first hyphen, which
     made lyra-os equal lyra-advisory and pathguard-forge equal pathguard-godot.) */
  const norm = (s) =>
    (String(s ?? "").trim().split(/\s+/)[0] ?? "")
      .toLowerCase()
      .replace(/^git@([^:]+):/, "$1/")
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")
      .replace(/\.git$/, "");
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return false;
  return na === nb;
}

/* Verified-live evidence — an explicit statement that something was checked
   against the running system, not merely built. */
export function extractVerifiedLive(text) {
  if (!text) return null;
  /* Work line by line and take the SENTENCE containing the claim.
     Character-window matching produced fragments that began mid-word
     ("ate) and customised against…") — worse than the value they replaced. */
  const PHRASE = /\b(?:VERIFIED LIVE|verified live|live at|is live on|both live|now live|web live|live:\s*Fly)\b/i;
  // Boilerplate that mentions "LIVE_READINESS" without asserting anything live.
  const BOILERPLATE = /Generated from the|Factory template|\.template|map-software-factory/i;

  const candidates = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = stripMarkup(rawLine);
    if (!line || !PHRASE.test(line)) continue;
    /* Split into CLAUSES, not just sentences. The real claim is often buried
       mid-line after a semicolon — Ordo's "…; production live at
       www.ordoai.co.uk…" sat on the same line as a template credit. */
    for (const clause of line.split(/(?<=[.!?;])\s+/)) {
      const clean = stripMarkup(clause);
      if (!clean || clean.length < 12) continue;
      if (!PHRASE.test(clean)) continue;
      if (BOILERPLATE.test(clean)) continue;
      candidates.push(clean);
    }
  }
  if (!candidates.length) return null;
  /* Take the EARLIEST claim that carries real evidence (a hostname or a version).
     Document order matters: a handover states the primary release at the top,
     so preferring "most hosts named" would have reported Alongside Me's demo
     (v11) instead of the live web release (v163). */
  const qualifies = (c) =>
    /https?:\/\/|\b[a-z0-9-]+\.(co\.uk|com|dev|ai|io)\b/i.test(c) || /\bv\d+\b/i.test(c);
  return excerpt(candidates.find(qualifies) ?? candidates[0], 150);
}

/* Headings, emphasis and leading emoji are formatting, not content. */
export function stripMarkup(s) {
  return String(s)
    .replace(/^[\s#>*_`-]+/, "")
    .replace(/[*_`]+/g, "")
    .replace(/^[^\p{L}\p{N}("']+/u, "")
    .trim();
}

/* The project's own statement of what happens next / what it is focused on. */
export function extractNextAction(text) {
  if (!text) return null;
  // Unbounded lazy capture with a lookahead terminator: section bodies vary
  // wildly in length and a fixed cap silently loses long ones.
  const headings = [
    /#{2,}\s*NEXT ACTION[^\n]*\n+([\s\S]*?)(?=\n#{2,}\s|\n---|$)/i,
    /#{2,}\s*(?:Exact\s+)?next\s+(?:starting point|step|action)[^\n]*\n+([\s\S]*?)(?=\n#{2,}\s|\n---|$)/i,
    /\*\*Exact next starting point:?\*\*([\s\S]*?)(?=\n\n|\n#{2,}\s|$)/i,
    /#{2,}\s*What(?:'s| is)?\s+next[^\n]*\n+([\s\S]*?)(?=\n#{2,}\s|\n---|$)/i,
  ];
  for (const re of headings) {
    const m = re.exec(text);
    if (m) {
      const v = excerpt(stripMarkup(m[1]), 240);
      if (v) return v;
    }
  }
  return null;
}

/* An open founder decision the repo is explicitly waiting on. */
export function extractOpenDecision(text) {
  if (!text) return null;
  const patterns = [
    /\*\*([A-Z][^*\n]{0,120}?(?:DECISION REQUIRED|decision required)[^*\n]{0,120})\*\*/,
    /\b(?:Open|Outstanding)\s+Founder\s+decision[::]?\s*([^\n]{0,180})/i,
    /#{2,}\s*Awaiting decision[^\n]*\n+([\s\S]*?)(?=\n#{2,}\s|\n---|$)/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) {
      const v = excerpt(stripMarkup(m[1]), 200);
      if (v) return v;
    }
  }
  return null;
}

/* Explicit dormancy markers, so a deliberately quiet project is not reported as
   neglected (§Step 7).
 *
 * A FEATURE FREEZE is deliberately NOT dormancy — Alongside Me is frozen for V1
 * scope while shipping several times a week. Conflating the two would suppress
 * staleness warnings on the single most active project in the portfolio. */
export function extractPaused(text) {
  if (!text) return null;
  const m =
    /\b(project (?:is )?(?:paused|dormant|archived|mothballed|on hold|shelved)|\bDORMANT\b|\bARCHIVED\b|\bMOTHBALLED\b|no longer (?:being )?(?:developed|maintained)|superseded by)\b/i.exec(text);
  return m ? excerpt(stripMarkup(m[1]), 80) : null;
}

/* --------------------------------------------------------------- freshness */

export const FRESHNESS = {
  current: "current",
  probablyCurrent: "probably-current",
  stale: "stale",
  conflicted: "conflicted",
  needsScan: "needs-scan",
  neverScanned: "never-scanned",
};

const toTime = (d) => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/* The single freshness verdict for one project.
 *
 * `evidence` = newest repository facts the scanner saw.
 * `record`   = what the Control Centre currently stores.
 *
 * A project is STALE when the repository contains evidence newer than the last
 * reconciliation — which is precisely the failure this whole task fixes. Note
 * that a paused project with no new commits is naturally "current": staleness
 * is measured against evidence, never against the calendar. */
export function computeFreshness({ evidence = {}, record = {}, openConflicts = 0, now = Date.now() } = {}) {
  const lastScan = toTime(record.lastScanAt);
  const lastRecon = toTime(record.lastReconciledAt) || lastScan;

  if (!lastScan) {
    return {
      state: record.lastActivity ? FRESHNESS.neverScanned : FRESHNESS.neverScanned,
      detail: "This project has never been scanned by the companion scanner — everything shown came from the original discovery snapshot.",
    };
  }

  if (openConflicts > 0) {
    return {
      state: FRESHNESS.conflicted,
      detail: `${openConflicts} unresolved conflict${openConflicts === 1 ? "" : "s"} — the repository and the Control Centre disagree, and only you can settle it.`,
    };
  }

  // Newest thing the repository can prove about itself.
  const evidenceDates = [
    ["a commit", evidence.lastCommitAt],
    ["a session handover", evidence.lastHandoverAt],
    ["a current-state document", evidence.lastDocUpdateAt],
    ["deployment evidence", evidence.lastDeployEvidenceAt],
  ].filter(([, d]) => toTime(d) > 0);

  let newest = { label: null, time: 0, date: null };
  for (const [label, d] of evidenceDates) {
    const t = toTime(d);
    if (t > newest.time) newest = { label, time: t, date: d };
  }

  // Evidence dates are day-resolution: a reconciliation anywhere on or after
  // the evidence day counts as having taken that evidence in.
  if (newest.time && lastRecon < newest.time) {
    const days = Math.max(1, Math.round((now - newest.time) / 86400000));
    return {
      state: FRESHNESS.stale,
      detail: `The repository has ${newest.label} from ${newest.date} (${days} day${days === 1 ? "" : "s"} ago) that the Control Centre has not taken in.`,
    };
  }

  /* The scan itself can go out of date even when nothing was stale at the time:
     we simply cannot vouch for a repository we have not looked at recently. */
  const scanAgeDays = Math.round((now - lastScan) / 86400000);
  if (scanAgeDays > 14) {
    return {
      state: FRESHNESS.needsScan,
      detail: `Last scanned ${scanAgeDays} days ago — nothing was outstanding then, but the scan itself is now old.`,
    };
  }

  if (newest.time) {
    return {
      state: FRESHNESS.current,
      detail: `Reconciled against repository evidence up to ${newest.date}.`,
    };
  }

  return {
    state: FRESHNESS.probablyCurrent,
    detail: "Scanned recently, but the repository offered no dated current-state evidence — freshness rests on Git alone.",
  };
}

export const NEEDS_ATTENTION = [FRESHNESS.stale, FRESHNESS.conflicted, FRESHNESS.needsScan, FRESHNESS.neverScanned];

/* Human label for the UI. */
export const FRESHNESS_LABEL = {
  [FRESHNESS.current]: "Current",
  [FRESHNESS.probablyCurrent]: "Probably current",
  [FRESHNESS.stale]: "Stale",
  [FRESHNESS.conflicted]: "Conflicted",
  [FRESHNESS.needsScan]: "Needs scan",
  [FRESHNESS.neverScanned]: "Never scanned",
};

/* ------------------------------------------------------- document health */

/* Drift between a repo's own current-state documents — the signal that caught
   the v31/v41 problem in the first place. */
export function documentHealth({ handoverDate, operatingStateDate, lastCommitAt } = {}) {
  const issues = [];
  if (handoverDate && operatingStateDate && handoverDate > operatingStateDate) {
    issues.push(`The session handover (${handoverDate}) is newer than the operating state (${operatingStateDate}) — the handover is the current statement until the operating state catches up.`);
  }
  if (lastCommitAt && operatingStateDate && lastCommitAt > operatingStateDate) {
    const days = Math.round((toTime(lastCommitAt) - toTime(operatingStateDate)) / 86400000);
    if (days > 21) issues.push(`Commits continued for ${days} days after the operating state was last updated.`);
  }
  if (!handoverDate && !operatingStateDate) {
    issues.push("No standard current-state document found — freshness is inferred from Git alone.");
  }
  const label = issues.length === 0 ? "Healthy" : issues.length === 1 ? "Minor drift" : "Drifting";
  return { label, detail: issues.join(" "), conf: issues.length ? "repo" : "repo" };
}

/* ── Discovering repositories nobody listed ──────────────────────────────────
 *
 * The scanner used to walk a fixed allow-list, so every project started after
 * the July discovery was invisible: it was never scanned, so it never even
 * reached the "not on the register" question. This finds project folders in
 * the dev root (and one level inside plain container folders such as
 * "Game project") that the list does not already cover.
 *
 * Discovery only NAMES a folder. It is scanned exactly like a listed one —
 * read-only — and the import turns it into a founder question, never into a
 * project record (D-10). Pure: the file-system calls are passed in.
 */
const PROJECT_MARKERS = [".git", "CLAUDE.md", "package.json", "pyproject.toml", "project.godot"];

export function discoverUnlisted(devRoot, listed, fsx) {
  const sep = devRoot.includes("\\") ? "\\" : "/";
  const join2 = (...p) => p.join(sep);
  const taken = new Set(Object.values(listed).map((r) => r.toLowerCase()));
  const ids = new Set(Object.keys(listed));
  const isProject = (abs) => PROJECT_MARKERS.some((m) => fsx.exists(join2(abs, m)));
  const children = (abs) => {
    try { return fsx.dirs(abs).filter((n) => !n.startsWith(".") && !n.startsWith("_") && n !== "node_modules"); }
    catch { return []; }
  };
  const idFor = (rel) => {
    const base = rel.split(sep).pop().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let id = base || "repo";
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    return id;
  };

  const found = {};
  const consider = (rel) => {
    if (taken.has(rel.toLowerCase())) return;
    found[idFor(rel)] = rel;
  };
  for (const top of children(devRoot).sort()) {
    const abs = join2(devRoot, top);
    const holdsListed = [...taken].some((r) => r.startsWith((top + sep).toLowerCase()));
    if (!holdsListed && isProject(abs)) { consider(top); continue; }
    // A plain folder holding projects ("Game project", "Lyra-OS").
    for (const inner of children(abs).sort()) {
      if (isProject(join2(abs, inner))) consider(join2(top, inner));
    }
  }
  return found;
}

/* ── Document evidence from already-read documents ───────────────────────────
 *
 * The same ranking and extraction the laptop scanner does inside scanOne, as a
 * pure function over documents someone else has fetched — so the GitHub sync
 * (tools/sync/github-scan.mjs) reads a repository through the API and still
 * reports exactly what a local scan would. The laptop scanner is deliberately
 * left as it is: it stays the working fallback until the cloud sync is proven,
 * and then retires.
 *
 *   docs: [{ file, text, date? }]   date = the file's last commit, if known
 *   git:  { lastCommitAt, isGit, commits90 }
 */
export const CANDIDATE_DOCS = [
  "SESSION_HANDOVER.md", "HANDOVER.md",
  "CURRENT_PROJECT_STATUS.md", "CURRENT_STATUS.md",
  "PROJECT_OPERATING_STATE.md", "STATE_OF_PLAY.md", "docs/STATE_OF_PLAY.md",
  "FOUNDER_DECISIONS.md",
  "LIVE_READINESS.md", "docs/LIVE_READINESS.md",
  "docs/production-launch/LIVE_STATE_REPORT.md",
  "REALITY_LEDGER.md", "docs/REALITY_LEDGER.md",
  "AI_START_HERE.md", "README.md", "STATE.md",
];

export function buildDocEvidence(input, git) {
  const startHere = input.find((d) => d.file === "AI_START_HERE.md")?.text ?? "";
  const declaredHistorical = new Set(parseHistoricalDeclarations(startHere));

  const docs = [];
  for (const d of input) {
    const base = d.file.split("/").pop();
    const head = d.text.slice(0, 1600);
    let cls = DEFAULT_DOC_MAP[d.file] ?? DEFAULT_DOC_MAP[base] ?? DOC_CLASS.readme;
    if (declaredHistorical.has(base.toLowerCase()) || looksSuperseded(head)) cls = DOC_CLASS.superseded;
    docs.push({ file: d.file, cls, date: docSelfDate(head) ?? d.date ?? null, text: d.text });
  }

  const usable = docs.filter(isUsable);
  const byClass = (c) => usable.filter((d) => d.cls === c).reduce((a, b) => rankDoc(a, b), null);
  const handover = byClass(DOC_CLASS.handover);
  const currentStatus = byClass(DOC_CLASS.currentStatus);
  const opState = byClass(DOC_CLASS.operatingState);
  const deploy = byClass(DOC_CLASS.deployment);
  const primary = [handover, currentStatus, opState, deploy].reduce((a, b) => rankDoc(a, b), null);
  const fieldSources = [handover, currentStatus, opState, deploy].filter(Boolean);
  const firstField = (fn) => {
    for (const d of fieldSources) {
      const v = fn(d.text);
      if (v) return { value: v, file: d.file, cls: d.cls, date: d.date ?? null };
    }
    return null;
  };
  const release = firstField(extractRelease);
  const verified = firstField(extractVerifiedLive);
  const nextAction = firstField(extractNextAction);
  const openDecision = firstField(extractOpenDecision);
  const dormant = !!git.isGit && Number(git.commits90 || 0) === 0;
  const dormancyNote = firstField(extractPaused);
  const health = documentHealth({
    handoverDate: handover?.date ?? null,
    operatingStateDate: opState?.date ?? null,
    lastCommitAt: git.lastCommitAt || null,
  });

  return {
    docs: docs.map((d) => ({ file: d.file, cls: d.cls, date: d.date ?? undefined })),
    primaryDoc: primary ? { file: primary.file, cls: primary.cls, date: primary.date ?? undefined } : undefined,
    lastHandoverAt: handover?.date ?? undefined,
    lastDocUpdateAt: [handover?.date, currentStatus?.date, opState?.date].filter(Boolean).sort().pop() ?? undefined,
    lastDeployEvidenceAt: deploy?.date ?? undefined,
    docsAuthoritative: usable
      .filter((d) => [DOC_CLASS.handover, DOC_CLASS.currentStatus, DOC_CLASS.operatingState, DOC_CLASS.decisions, DOC_CLASS.deployment].includes(d.cls))
      .map((d) => d.file),
    docsHistorical: docs.filter((d) => d.cls === DOC_CLASS.superseded).map((d) => d.file),
    docHealthLabel: health.label,
    docHealthDetail: excerpt(health.detail, 300),
    facts: {
      latestRelease: release ?? undefined,
      verifiedLive: verified ?? undefined,
      focus: nextAction ?? undefined,
      openDecision: openDecision ?? undefined,
    },
    dormant,
    dormancyNote: dormant && dormancyNote ? dormancyNote.value : undefined,
  };
}
