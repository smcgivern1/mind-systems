"use client";

type Inputs = {
  hasTodayJournal: boolean;
  todayMood: number | null;
  hasTodayPhysical: boolean;
  programComplete: boolean;
};

export function nextBestAction({
  hasTodayJournal,
  todayMood,
  hasTodayPhysical,
  programComplete,
}: Inputs): string {
  if (!hasTodayJournal && todayMood === null) {
    return "Next: take a moment to log how you're feeling.";
  }
  if (todayMood !== null && todayMood < 6 && !hasTodayJournal) {
    return "Next: write a few words — it doesn't have to be perfect.";
  }
  if (!hasTodayPhysical) {
    return "Next: even a short walk counts.";
  }
  if (!programComplete) {
    return "Next: continue where you left off.";
  }
  return "Next: rest is part of the work.";
}

export default function NextBestAction(props: Inputs) {
  return (
    <p className="text-base text-ink-secondary mt-4">
      {nextBestAction(props)}
    </p>
  );
}
