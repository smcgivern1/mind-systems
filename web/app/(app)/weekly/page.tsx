"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getWeeklyCurrent, putWeeklyAnswer } from "@/lib/api";
import ProgressBar from "@/components/ui/ProgressBar";

const QUESTIONS: { field_key: string; prompt: string }[] = [
  { field_key: "felt_good", prompt: "What felt good this week?" },
  { field_key: "was_difficult", prompt: "What was more difficult than you expected?" },
  { field_key: "what_helped", prompt: "What helped, even a little?" },
  { field_key: "next_week", prompt: "What would you like to do more of next week?" },
];

export default function WeeklyPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getWeeklyCurrent()
      .then((r) => setAnswers(r.answers ?? {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const total = QUESTIONS.length;
  const current = QUESTIONS[stepIdx];
  const value = answers[current.field_key] ?? "";
  const isLast = stepIdx === total - 1;
  const allFilled = QUESTIONS.every(
    (q) => (answers[q.field_key] ?? "").trim().length > 0,
  );
  const canContinue = isLast ? allFilled : value.trim().length > 0;

  const handleChange = (v: string) => {
    setAnswers((prev) => ({ ...prev, [current.field_key]: v }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      putWeeklyAnswer(current.field_key, v).catch(() => {});
    }, 500);
  };

  const goNext = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      try {
        await putWeeklyAnswer(current.field_key, value);
      } catch {
        /* ignore */
      }
    }
    if (isLast) {
      router.push("/dashboard");
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const goBack = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  if (!loaded) {
    return (
      <div className="max-w-md mx-auto bg-bg-card rounded-card shadow-card p-6 md:p-8">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-bg-card rounded-card shadow-card p-6 md:p-8">
      <header className="flex items-center justify-between text-sm text-ink-muted mb-6">
        <span>
          Question {stepIdx + 1} of {total}
        </span>
        <span className="font-semibold text-ink-primary">Weekly reflection</span>
      </header>

      <div className="mb-6">
        <ProgressBar current={stepIdx + 1} total={total} />
      </div>

      <h2 className="text-2xl font-medium text-ink-primary mb-4">
        {current.prompt}
      </h2>

      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={6}
        placeholder="Take your time."
        className="w-full p-4 text-base bg-bg-card border border-line-soft rounded-input text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-sage resize-y"
      />

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={goBack}
          disabled={stepIdx === 0}
          className="px-4 py-2 border border-line-soft rounded-md text-ink-primary disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="px-5 py-2 bg-accent-sage hover:bg-accent-sage-hover text-white rounded-md disabled:opacity-50"
        >
          {isLast ? "Done" : "Continue"}
        </button>
      </div>
    </div>
  );
}
