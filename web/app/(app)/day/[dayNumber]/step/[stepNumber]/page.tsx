"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Action, DayData, Progress } from "@/lib/types";
import { InfoStep } from "@/components/steps/InfoStep";
import { ListStep } from "@/components/steps/ListStep";
import { MultiLineStep } from "@/components/steps/MultiLineStep";
import { ActionsListStep } from "@/components/steps/ActionsListStep";
import { ActionCompleteStep } from "@/components/steps/ActionCompleteStep";

const MISSING_LABELS: Record<string, string> = {
  decisions: "Add at least 2 decisions.",
  min_3_actions: "Add at least 3 actions.",
  min_4_actions: "Add at least 4 actions.",
  min_1_action_completed: "Mark at least one action complete.",
  positive_associations: "Fill in 3 positive associations.",
  disempowering_associations: "Fill in 3 disempowering associations.",
  identity_statement: "Fill in your identity statement.",
};

function describeMissing(key: string): string {
  if (MISSING_LABELS[key]) return MISSING_LABELS[key];
  if (key.startsWith("empty:")) return `Fill in: ${key.slice("empty:".length)}.`;
  return key;
}

export default function StepPage() {
  const params = useParams<{ dayNumber: string; stepNumber: string }>();
  const router = useRouter();
  const dayNumber = parseInt(params.dayNumber, 10);
  const stepNumber = parseInt(params.stepNumber, 10);

  const [data, setData] = useState<DayData | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [missing, setMissing] = useState<string[] | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, p] = await Promise.all([api.getDay(dayNumber), api.getProgress()]);
      setData(d);
      setProgress(p);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [dayNumber, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!progress || !data) return;
    if (Number.isNaN(stepNumber) || stepNumber < 1 || stepNumber > data.steps.length) {
      router.replace(`/day/${dayNumber}/step/1`);
      return;
    }
    const isCompleted = progress.completed_days.includes(dayNumber);
    if (!isCompleted && stepNumber > progress.current_step_number) {
      router.replace(`/day/${dayNumber}/step/${progress.current_step_number}`);
    }
  }, [progress, data, dayNumber, stepNumber, router]);

  const persistProgress = async (day: number, step: number) => {
    try {
      const next = await api.putProgress(day, step);
      setProgress(next);
    } catch {
      /* non-fatal */
    }
  };

  const handleActionsChanged = (next: Action[]) => {
    if (!data) return;
    setData({ ...data, actions: next });
  };

  if (loading || !data || !progress) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-ink-muted">{error ?? "Loading..."}</p>
      </div>
    );
  }

  const step = data.steps.find((s) => s.step_number === stepNumber);
  if (!step) {
    return (
      <div className="flex items-center justify-center">
        <p>Step not found.</p>
      </div>
    );
  }

  const isDayCompleted = progress.completed_days.includes(dayNumber);
  const locked = isDayCompleted;
  const totalSteps = data.steps.length;
  const isLastStep = stepNumber === totalSteps;
  const isSecondToLast = stepNumber === totalSteps - 1;

  const stepAnswer = data.answers[step.id]?.[step.field_key ?? ""];

  const goBack = async () => {
    if (stepNumber > 1) {
      const next = stepNumber - 1;
      router.push(`/day/${dayNumber}/step/${next}`);
      if (!locked) await persistProgress(dayNumber, next);
    } else if (dayNumber > 1) {
      router.push(`/day/${dayNumber - 1}/step/1`);
    }
  };

  const goNext = async () => {
    setMissing(null);
    if (locked) {
      if (!isLastStep) {
        router.push(`/day/${dayNumber}/step/${stepNumber + 1}`);
      } else {
        const totalDays = progress.completed_days.length + (isDayCompleted ? 0 : 1);
        if (dayNumber < Math.max(totalDays, dayNumber + 1)) {
          router.push(`/day/${dayNumber + 1}/step/1`);
        }
      }
      return;
    }

    if (isSecondToLast || isLastStep) {
      setCompleting(true);
      try {
        const result = await api.completeDay(dayNumber);
        if (!result.ok) {
          setMissing(result.missing ?? []);
          setCompleting(false);
          return;
        }
        if (result.next_day_number) {
          router.push(`/day/${result.next_day_number}/step/1`);
        } else {
          if (!isLastStep) {
            const next = stepNumber + 1;
            router.push(`/day/${dayNumber}/step/${next}`);
            await persistProgress(dayNumber, next);
          } else {
            router.push("/done");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      } finally {
        setCompleting(false);
      }
      return;
    }

    const next = stepNumber + 1;
    router.push(`/day/${dayNumber}/step/${next}`);
    await persistProgress(dayNumber, next);
  };

  const renderStep = () => {
    switch (step.step_type) {
      case "info":
        return <InfoStep step={step} />;
      case "list":
        return (
          <ListStep
            step={step}
            initialValue={Array.isArray(stepAnswer) ? (stepAnswer as string[]) : null}
            locked={locked}
          />
        );
      case "multi_line":
        return (
          <MultiLineStep
            step={step}
            initialValue={typeof stepAnswer === "string" ? stepAnswer : null}
            locked={locked}
          />
        );
      case "actions_list":
        return (
          <ActionsListStep
            step={step}
            dayId={data.day.id}
            actions={data.actions}
            locked={locked}
            onActionsChanged={handleActionsChanged}
          />
        );
      case "action_complete":
        return (
          <ActionCompleteStep
            step={step}
            actions={data.actions}
            locked={locked}
            onActionsChanged={handleActionsChanged}
          />
        );
      default:
        return <p>Unsupported step type.</p>;
    }
  };

  const showCompleteButton = !locked && (isSecondToLast || isLastStep);
  const nextLabel = showCompleteButton ? "Complete day" : "Next";

  return (
    <div className="max-w-md mx-auto bg-bg-card rounded-card shadow-card p-6 md:p-8">
      <header className="flex items-center justify-between text-sm text-ink-muted mb-6">
        <span>
          Day {dayNumber} · Step {stepNumber} of {totalSteps}
        </span>
        <span className="font-semibold text-ink-primary">{data.day.title}</span>
      </header>

      {locked ? (
        <p className="mb-4 text-sm italic text-accent-sage">
          This day is complete — you can review your answers but not edit them.
        </p>
      ) : null}

      {renderStep()}

      {missing && missing.length > 0 ? (
        <div className="mt-6 p-4 border border-state-error/40 bg-state-error/10 rounded-md text-sm text-ink-primary">
          <p className="font-semibold mb-2">Before completing the day:</p>
          <ul className="list-disc pl-5 space-y-1">
            {missing.map((m, i) => (
              <li key={i}>{describeMissing(m)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={goBack}
          disabled={dayNumber === 1 && stepNumber === 1}
          className="px-4 py-2 border border-line-soft rounded-md text-ink-primary disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={goNext}
          disabled={completing}
          className="px-5 py-2 bg-accent-sage hover:bg-accent-sage-hover text-white rounded-md disabled:opacity-50"
        >
          {completing ? "Working..." : nextLabel}
        </button>
      </div>
    </div>
  );
}
