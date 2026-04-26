"use client";

import { useEffect, useRef, useState } from "react";
import { StepHeader } from "../StepHeader";
import { api } from "@/lib/api";
import type { Step } from "@/lib/types";

interface Props {
  step: Step;
  initialValue: string | null;
  locked: boolean;
  onChange?: (value: string) => void;
}

export function MultiLineStep({ step, initialValue, locked, onChange }: Props) {
  const [value, setValue] = useState<string>(initialValue ?? "");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [step.id, initialValue]);

  const handleChange = (v: string) => {
    setValue(v);
    onChange?.(v);
    if (locked || !step.field_key) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.putAnswer(step.id, step.field_key as string, v).catch(() => {});
    }, 500);
  };

  return (
    <div>
      <StepHeader prompt={step.prompt} helperText={step.helper_text} body={step.body} />
      <textarea
        rows={6}
        disabled={locked}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full border border-line-soft rounded-md p-3 bg-bg-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-sage disabled:bg-bg-card-sand"
        placeholder="Write your answer..."
      />
    </div>
  );
}
