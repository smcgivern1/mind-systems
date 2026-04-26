"use client";

import type { ThoughtOut } from "@/lib/types";

export default function DailyThought({ thought }: { thought: ThoughtOut }) {
  return (
    <div className="max-w-sm mx-auto text-center mt-12 pb-12">
      <p className="text-base text-ink-secondary italic">{thought.text}</p>
      {thought.attribution ? (
        <p className="mt-2 text-xs text-ink-muted">— {thought.attribution}</p>
      ) : null}
    </div>
  );
}
