"use client";

import { useState } from "react";
import { StepHeader } from "../StepHeader";
import { api } from "@/lib/api";
import type { Action, Step } from "@/lib/types";

interface Props {
  step: Step;
  actions: Action[];
  locked: boolean;
  onActionsChanged: (next: Action[]) => void;
}

export function ActionCompleteStep({ step, actions, locked, onActionsChanged }: Props) {
  const minCompleted = (step.config["min_completed"] as number) ?? 1;
  const reinforcement = step.config["reinforcement"] as string | undefined;
  const completedCount = actions.filter((a) => a.completed).length;
  const [busy, setBusy] = useState<string | null>(null);

  const toggle = async (a: Action) => {
    if (locked) return;
    setBusy(a.id);
    try {
      const next = await api.patchAction(a.id, { completed: !a.completed });
      onActionsChanged(actions.map((x) => (x.id === a.id ? next : x)));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <StepHeader prompt={step.prompt} helperText={step.helper_text} body={step.body} />
      <p className="text-sm text-ink-muted mb-3">
        Mark at least {minCompleted} action{minCompleted === 1 ? "" : "s"} as complete.
        {" "}({completedCount}/{actions.length} done)
      </p>
      {actions.length === 0 ? (
        <p className="italic text-ink-muted">
          No actions to complete yet — go back and add some.
        </p>
      ) : (
        <ul className="space-y-2">
          {actions.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 p-3 border border-line-soft rounded-md bg-bg-card"
            >
              <input
                type="checkbox"
                checked={a.completed}
                disabled={locked || busy === a.id}
                onChange={() => toggle(a)}
                className="mt-1 h-5 w-5 accent-accent-sage"
              />
              <span className={`flex-1 whitespace-pre-wrap text-ink-primary ${a.completed ? "line-through text-ink-muted" : ""}`}>
                {a.text}
              </span>
            </li>
          ))}
        </ul>
      )}
      {completedCount >= minCompleted && reinforcement ? (
        <p className="mt-4 italic text-accent-sage">{reinforcement}</p>
      ) : null}
    </div>
  );
}
