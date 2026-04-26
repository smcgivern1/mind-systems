"use client";

import { StepHeader } from "../StepHeader";
import type { Step } from "@/lib/types";

export function InfoStep({ step }: { step: Step }) {
  return <StepHeader prompt={step.prompt} helperText={step.helper_text} body={step.body} />;
}
