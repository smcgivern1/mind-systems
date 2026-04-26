"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { NudgeOut } from "@/lib/types";
import { getNudge, submitNudgeFeedback } from "@/lib/api";

export default function InterventionCard({
  entryId,
  initialNudge,
}: {
  entryId: string;
  initialNudge: NudgeOut;
}) {
  const [nudge, setNudge] = useState<NudgeOut>(initialNudge);
  const [excludes, setExcludes] = useState<string[]>([initialNudge.id]);
  const [feedback, setFeedback] = useState<"none" | "submitted">("none");
  const [loading, setLoading] = useState(false);

  const tryAnother = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const next = await getNudge(entryId, excludes.slice(-3));
      setNudge(next);
      setExcludes((prev) => [...prev, next.id]);
      setFeedback("none");
    } catch {
      // swallow — keep current nudge visible
    } finally {
      setLoading(false);
    }
  };

  const give = async (helpful: boolean) => {
    await submitNudgeFeedback(entryId, nudge.id, helpful);
    setFeedback("submitted");
  };

  return (
    <Card variant="secondary" className="p-5 md:p-6">
      <p className="text-base text-ink-primary">{nudge.acknowledgement}</p>

      <div key={nudge.id} className="mt-5 transition-opacity duration-150">
        <div className="text-xs uppercase tracking-wide text-ink-muted">
          {nudge.category}
        </div>
        <h3 className="mt-1 text-base font-medium text-ink-primary">{nudge.name}</h3>
        <p className="mt-2 text-base text-ink-primary">{nudge.prompt}</p>
        <p className="mt-3 text-sm text-ink-secondary">
          <span className="text-xs uppercase tracking-wide text-ink-muted mr-2">Why</span>
          {nudge.why}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="inline" onClick={tryAnother} disabled={loading}>
          {loading ? "Loading…" : "Try another"}
        </Button>
        {feedback === "submitted" ? (
          <span className="text-sm text-ink-muted">Thanks — noted.</span>
        ) : (
          <div className="flex gap-4">
            <Button variant="inline" onClick={() => give(true)}>Helpful</Button>
            <Button variant="inline" onClick={() => give(false)}>Not really</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
