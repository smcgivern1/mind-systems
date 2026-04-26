"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import type { ProgressSummaryOut } from "@/lib/types";

export default function ProgressSnapshotCard({
  summary,
}: {
  summary: ProgressSummaryOut;
}) {
  const router = useRouter();
  return (
    <Card variant="quiet" className="p-5 md:p-6">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="text-2xl font-medium text-ink-primary">
            {summary.program.completed_days}
          </div>
          <div className="text-xs text-ink-secondary mt-1">Days complete</div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-medium text-ink-primary">
            {summary.journal.entries_this_week}
          </div>
          <div className="text-xs text-ink-secondary mt-1">
            Journal entries
            <span className="block text-xs text-ink-muted">this week</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-medium text-ink-primary">{summary.streak}</div>
          <div className="text-xs text-ink-secondary mt-1">
            Streak
            <span className="block text-xs text-ink-muted">days</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => router.push("/progress")}
          className="text-sm text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
        >
          View all &rarr;
        </button>
      </div>
    </Card>
  );
}
