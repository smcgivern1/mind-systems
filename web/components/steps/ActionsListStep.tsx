"use client";

import { useState } from "react";
import { StepHeader } from "../StepHeader";
import { api } from "@/lib/api";
import type { Action, Step } from "@/lib/types";

interface Props {
  step: Step;
  dayId: string;
  actions: Action[];
  locked: boolean;
  onActionsChanged: (next: Action[]) => void;
}

export function ActionsListStep({ step, dayId, actions, locked, onActionsChanged }: Props) {
  const minCount = (step.config["min_count"] as number) ?? 1;
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const text = draft.trim();
    if (!text || locked || busy) return;
    setBusy(true);
    try {
      const created = await api.createAction(dayId, text);
      onActionsChanged([...actions, created]);
      setDraft("");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (locked) return;
    await api.deleteAction(id);
    onActionsChanged(actions.filter((a) => a.id !== id));
  };

  return (
    <div>
      <StepHeader prompt={step.prompt} helperText={step.helper_text} body={step.body} />
      <p className="text-sm text-ink-muted mb-3">
        At least {minCount} required.
      </p>
      <ul className="space-y-2 mb-4">
        {actions.map((a, i) => (
          <li key={a.id} className="flex items-start gap-3 p-3 border border-line-soft rounded-md bg-bg-card">
            <span className="font-semibold w-6 text-ink-muted">{i + 1}.</span>
            <span className="flex-1 whitespace-pre-wrap text-ink-primary">{a.text}</span>
            {!locked && (
              <button
                onClick={() => remove(a.id)}
                className="text-xs text-ink-muted hover:text-state-error"
                aria-label="Delete action"
              >
                remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {!locked && (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Add an action..."
            className="flex-1 border border-line-soft rounded-md p-3 bg-bg-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-sage"
          />
          <button
            onClick={add}
            disabled={busy || !draft.trim()}
            className="px-4 py-2 bg-accent-sage hover:bg-accent-sage-hover text-white rounded-md disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
