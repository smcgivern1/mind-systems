"use client";

import { useEffect, useRef, useState } from "react";
import { StepHeader } from "../StepHeader";
import { api } from "@/lib/api";
import type { Step } from "@/lib/types";

interface Props {
  step: Step;
  initialValue: string[] | null;
  locked: boolean;
  onChange?: (value: string[]) => void;
}

export function ListStep({ step, initialValue, locked, onChange }: Props) {
  const slotCount = (step.config["slot_count"] as number) ?? 3;
  const multiline = (step.config["multiline"] as boolean) ?? false;

  const initial = Array.from({ length: slotCount }, (_, i) => initialValue?.[i] ?? "");
  const [values, setValues] = useState<string[]>(initial);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValues(Array.from({ length: slotCount }, (_, i) => initialValue?.[i] ?? ""));
  }, [step.id, slotCount, initialValue]);

  const queueSave = (next: string[]) => {
    onChange?.(next);
    if (locked || !step.field_key) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.putAnswer(step.id, step.field_key as string, next).catch(() => {});
    }, 500);
  };

  const updateAt = (i: number, v: string) => {
    const next = values.slice();
    next[i] = v;
    setValues(next);
    queueSave(next);
  };

  return (
    <div>
      <StepHeader prompt={step.prompt} helperText={step.helper_text} body={step.body} />
      <div className="space-y-3">
        {values.map((v, i) =>
          multiline ? (
            <textarea
              key={i}
              rows={3}
              disabled={locked}
              value={v}
              onChange={(e) => updateAt(i, e.target.value)}
              className="w-full border border-line-soft rounded-md p-3 bg-bg-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-sage disabled:bg-bg-card-sand"
              placeholder={`${i + 1}.`}
            />
          ) : (
            <input
              key={i}
              type="text"
              disabled={locked}
              value={v}
              onChange={(e) => updateAt(i, e.target.value)}
              className="w-full border border-line-soft rounded-md p-3 bg-bg-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-sage disabled:bg-bg-card-sand"
              placeholder={`${i + 1}.`}
            />
          ),
        )}
      </div>
    </div>
  );
}
