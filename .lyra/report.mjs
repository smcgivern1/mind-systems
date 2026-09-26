#!/usr/bin/env node
/* Lyra report — a repository telling Lyra about itself (D-26).
 *
 * Runs inside the repository's own GitHub Actions job, on its own checkout.
 * Builds the same no-secrets snapshot the laptop scanner builds (git activity,
 * current-state documents ranked by Lyra's shared rules, Fly app names) and
 * posts it to Lyra authenticated by GitHub's signed identity for this run.
 * There is no stored secret: GitHub issues the identity token to the job
 * because the workflow grants `id-token: write`.
 *
 * Reads only. Never writes to the repository, never deploys, never prints the
 * identity token or document text. Vendored from map-control-centre
 * tools/reporting/ — do not edit here; re-vendor instead.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CANDIDATE_DOCS, buildDocEvidence, excerpt, redact } from "./scan-model.mjs";

export const LYRA_URL = "https://control.lyracoach.co.uk";
const MAX_DOC_BYTES = 200_000;

function git(root, args) {
  try {
    return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 20000 }).trim();
  } catch { return ""; }
}

/** The snapshot for the repository at `root`. Pure apart from reading files and git. */
export function buildSnapshot(root) {
  const lastCommitAt = git(root, ["log", "-1", "--format=%ad", "--date=short"]);
  const lastMsg = git(root, ["log", "-1", "--format=%s"]);
  const branch = git(root, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const commits90 = Number(git(root, ["rev-list", "--count", "--since=90.days", "HEAD"]) || 0);

  const docs = [];
  for (const file of CANDIDATE_DOCS) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    let text = readFileSync(p, "utf8");
    if (text.length > MAX_DOC_BYTES) text = text.slice(0, MAX_DOC_BYTES);
    docs.push({ file, text, date: git(root, ["log", "-1", "--format=%ad", "--date=short", "--", file]) || null });
  }

  const flyApps = [];
  for (const f of readdirSync(root).filter((n) => n.startsWith("fly") && n.endsWith(".toml"))) {
    const m = /^\s*app\s*=\s*["']([^"']+)["']/m.exec(readFileSync(join(root, f), "utf8"));
    if (m) flyApps.push(m[1]);
  }

  let declaredTier = null;
  try { declaredTier = JSON.parse(readFileSync(join(root, ".mapfactory", "state.json"), "utf8")).tier ?? null; } catch { /* not a MAP-bootstrapped repo */ }

  return {
    declaredTier,
    snapshot: {
      lastActivity: lastCommitAt || undefined,
      lastActivityNote: lastMsg ? excerpt(lastMsg, 200) : undefined,
      lastCommitAt: lastCommitAt || undefined,
      branch: branch || undefined,
      isGit: true,
      commitsLast90: commits90,
      flyApps,
      ...buildDocEvidence(docs, { lastCommitAt, isGit: true, commits90 }),
    },
  };
}

async function identityToken(audience) {
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const bearer = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !bearer) throw new Error("no GitHub identity available — the workflow needs `permissions: id-token: write`");
  const res = await fetch(`${url}&audience=${encodeURIComponent(audience)}`, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) throw new Error(`GitHub identity request failed (${res.status})`);
  return (await res.json()).value;
}

async function main() {
  const body = buildSnapshot(process.cwd());
  const flat = JSON.stringify(body);
  if (redact(flat) !== flat) { console.error("Refusing to send: the snapshot contained secret-shaped content."); process.exit(1); }

  const token = await identityToken(LYRA_URL);
  const res = await fetch(`${LYRA_URL}/api/sync/report`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: flat,
    signal: AbortSignal.timeout(60_000),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) { console.error(`Lyra refused the report: ${res.status} ${out.error ?? ""}`); process.exit(1); }
  console.log(`Reported to Lyra as "${out.project}"${out.onboarded ? " (onboarded; classification unconfirmed)" : ""}: ${out.updated ?? 0} field(s) updated, ${out.conflicts ?? 0} conflict(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`Lyra report failed: ${e.message}`); process.exit(1); });
}
