"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Program, Progress } from "@/lib/types";

function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export default function ContinueProgramCard({
  program,
  progress,
}: {
  program: Program;
  progress: Progress;
}) {
  const router = useRouter();

  if (progress.program_completed_at) {
    return (
      <Card variant="confirmation" className="p-8 md:p-10">
        <div className="text-xs uppercase tracking-wide text-ink-muted">Personal Power</div>
        <h2 className="mt-2 text-2xl font-medium text-ink-primary">Personal Power</h2>
        <p className="mt-3 text-base text-ink-secondary">
          You&rsquo;ve completed all three days.
        </p>
      </Card>
    );
  }

  const day = program.days.find(
    (d) => d.day_number === progress.current_day_number,
  );
  if (!day) {
    return (
      <Card variant="primary" className="p-8 md:p-10">
        <p className="text-sm text-ink-muted">Couldn&rsquo;t locate current day.</p>
      </Card>
    );
  }
  const totalSteps = day.steps.length;
  const stepNum = progress.current_step_number;
  const step = day.steps.find((s) => s.step_number === stepNum);
  const stepPrompt = step ? truncate(step.prompt, 60) : "";

  return (
    <Card variant="primary" className="p-8 md:p-10">
      <div className="text-xs uppercase tracking-wide text-ink-muted">Personal Power</div>
      <h2 className="mt-2 text-2xl font-medium text-ink-primary">{day.title}</h2>
      <p className="mt-3 text-base text-ink-secondary">
        Step {stepNum} of {totalSteps}
        {stepPrompt ? ` — ${stepPrompt}` : ""}
      </p>
      <div className="mt-6">
        <ProgressBar current={stepNum} total={totalSteps} />
      </div>
      <div className="mt-6 md:flex md:justify-end">
        <Button
          onClick={() =>
            router.push(`/day/${day.day_number}/step/${stepNum}`)
          }
          className="w-full md:w-auto md:px-10"
        >
          Continue
        </Button>
      </div>
    </Card>
  );
}
