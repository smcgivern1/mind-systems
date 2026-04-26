"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { getProgressSummary } from "@/lib/api";
import type { ProgressSummaryOut } from "@/lib/types";

function interpretWeek(s: ProgressSummaryOut): string {
  const j = s.journal.entries_this_week ?? 0;
  const p = s.physical.checkins_this_week ?? 0;
  const a = s.program.actions_completed ?? 0;
  const total = j + p + a;
  const lowMoodWeek =
    s.journal.avg_mood_this_week !== null && s.journal.avg_mood_this_week < 5;

  if (total === 0) {
    return "A quiet week. Resting counts too.";
  }
  if (lowMoodWeek) {
    return "Some days were harder than others — that's part of it.";
  }
  if (total <= 3) {
    return "You showed up a few times this week. That matters.";
  }
  if (total <= 8) {
    return "A steady week. Keep going.";
  }
  return "You've been consistent. The work is doing its work.";
}

function formatMinutes(total: number): string {
  if (!total) return "0 min";
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function moodColor(mood: number | null): string {
  if (mood === null) return "bg-bg-card-sand";
  if (mood <= 3) return "bg-state-low";
  if (mood <= 6) return "bg-state-mid";
  return "bg-state-high";
}

function MoodDotStrip({ strip }: { strip: (number | null)[] }) {
  return (
    <div className="flex items-center gap-2">
      {strip.map((m, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${moodColor(m)}`}
          aria-label={m === null ? "no entry" : `mood ${m}`}
        />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-bg-card-sand rounded-card animate-pulse" />
      <div className="h-32 bg-bg-card-sand rounded-card animate-pulse" />
      <div className="h-32 bg-bg-card-sand rounded-card animate-pulse" />
    </div>
  );
}

export default function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummaryOut | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProgressSummary()
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-medium text-ink-primary">Progress</h1>
      <p className="mt-1 text-sm text-ink-muted">Last 7 days</p>

      {summary ? (
        <p className="text-base text-ink-primary mt-4 mb-6">
          {interpretWeek(summary)}
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        {error ? (
          <p className="text-sm text-ink-muted">Couldn&rsquo;t load progress.</p>
        ) : !summary ? (
          <Skeleton />
        ) : (
          <>
            <Card>
              <h2 className="text-xl font-medium text-ink-primary">Personal Power</h2>
              <div className="mt-6 flex gap-6">
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {summary.program.completed_days} of {summary.program.total_days}
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Days complete</div>
                </div>
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {summary.program.actions_completed}
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Actions taken</div>
                </div>
              </div>
              {summary.program.identity_statement ? (
                <div className="mt-6 p-4 rounded-input bg-bg-card-sand italic text-ink-primary">
                  &ldquo;{summary.program.identity_statement}&rdquo;
                </div>
              ) : null}
            </Card>

            <Card>
              <h2 className="text-xl font-medium text-ink-primary">Journal</h2>
              <div className="mt-6 flex gap-6">
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {summary.journal.entries_this_week}
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Entries this week</div>
                </div>
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {summary.journal.avg_mood_this_week ?? "—"}
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Average mood</div>
                </div>
              </div>
              <div className="mt-6">
                <MoodDotStrip strip={summary.journal.mood_strip} />
                <p className="text-xs text-ink-muted mt-2">Last 7 days</p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-medium text-ink-primary">Physical</h2>
              <div className="mt-6 flex gap-6">
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {summary.physical.checkins_this_week} of 7
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Check-ins</div>
                </div>
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {summary.physical.avg_sleep_band ?? "—"}
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Avg sleep</div>
                </div>
                <div className="flex-1">
                  <div className="text-display text-ink-primary">
                    {formatMinutes(summary.physical.total_minutes_this_week)}
                  </div>
                  <div className="text-sm text-ink-secondary mt-1">Total time moved</div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/weekly"
          className="text-sm text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
        >
          Reflect on this week &rarr;
        </Link>
      </div>
    </div>
  );
}
