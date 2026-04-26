"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  me,
  getActiveProgram,
  getProgress,
  getJournalEntries,
  getPhysicalToday,
  getProgressSummary,
  getThoughtToday,
  getNudge,
  getWeeklyCurrent,
} from "@/lib/api";
import type {
  JournalEntryOut,
  NudgeOut,
  PhysicalOut,
  Program,
  Progress,
  ProgressSummaryOut,
  ThoughtOut,
  User,
  WeeklyReflectionOut,
} from "@/lib/types";
import GreetingBand from "@/components/dashboard/GreetingBand";
import ContinueProgramCard from "@/components/dashboard/ContinueProgramCard";
import MoodCaptureCard from "@/components/dashboard/MoodCaptureCard";
import PhysicalCheckInRow from "@/components/dashboard/PhysicalCheckInRow";
import ProgressSnapshotCard from "@/components/dashboard/ProgressSnapshotCard";
import DailyThought from "@/components/dashboard/DailyThought";
import InterventionCard from "@/components/InterventionCard";
import NextBestAction from "@/components/dashboard/NextBestAction";
import ShowedUpToday from "@/components/dashboard/ShowedUpToday";

type Slot<T> =
  | { state: "loading" }
  | { state: "ok"; data: T }
  | { state: "error" };

const Loading: Slot<never> = { state: "loading" };

function todayISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

function pickTodayEntry(entries: JournalEntryOut[]): JournalEntryOut | null {
  const today = todayISO();
  const todays = entries.filter((e) => e.date === today);
  if (todays.length === 0) return null;
  return todays.reduce((latest, e) =>
    new Date(e.created_at) > new Date(latest.created_at) ? e : latest,
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-bg-card-sand rounded-card animate-pulse ${className ?? ""}`}
    />
  );
}

function SectionError() {
  return <p className="text-sm text-ink-muted">Couldn&rsquo;t load this section.</p>;
}

export default function DashboardPage() {
  const [user, setUser] = useState<Slot<User>>(Loading);
  const [program, setProgram] = useState<Slot<Program>>(Loading);
  const [progress, setProgress] = useState<Slot<Progress>>(Loading);
  const [journal, setJournal] = useState<Slot<JournalEntryOut[]>>(Loading);
  const [physical, setPhysical] = useState<Slot<PhysicalOut | null>>(Loading);
  const [summary, setSummary] = useState<Slot<ProgressSummaryOut>>(Loading);
  const [thought, setThought] = useState<Slot<ThoughtOut>>(Loading);

  const [todayEntry, setTodayEntry] = useState<JournalEntryOut | null>(null);
  const [nudge, setNudge] = useState<{ entryId: string; nudge: NudgeOut } | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReflectionOut | null>(null);

  const interventionRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToInterventionRef = useRef(false);

  useEffect(() => {
    if (nudge) {
      if (!hasScrolledToInterventionRef.current && interventionRef.current) {
        interventionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        hasScrolledToInterventionRef.current = true;
      }
    } else {
      hasScrolledToInterventionRef.current = false;
    }
  }, [nudge]);

  useEffect(() => {
    (async () => {
      const [
        meR,
        programR,
        progressR,
        journalR,
        physicalR,
        summaryR,
        thoughtR,
        weeklyR,
      ] = await Promise.allSettled([
        me(),
        getActiveProgram(),
        getProgress(),
        getJournalEntries(),
        getPhysicalToday(),
        getProgressSummary(),
        getThoughtToday(),
        getWeeklyCurrent(),
      ]);
      if (weeklyR.status === "fulfilled") setWeekly(weeklyR.value);

      setUser(meR.status === "fulfilled"
        ? { state: "ok", data: meR.value }
        : { state: "error" });
      setProgram(programR.status === "fulfilled"
        ? { state: "ok", data: programR.value }
        : { state: "error" });
      setProgress(progressR.status === "fulfilled"
        ? { state: "ok", data: progressR.value }
        : { state: "error" });
      if (journalR.status === "fulfilled") {
        setJournal({ state: "ok", data: journalR.value });
        const today = pickTodayEntry(journalR.value);
        setTodayEntry(today);
        if (today && today.mood < 6) {
          getNudge(today.id)
            .then((n) => setNudge({ entryId: today.id, nudge: n }))
            .catch(() => {});
        }
      } else {
        setJournal({ state: "error" });
      }
      setPhysical(physicalR.status === "fulfilled"
        ? { state: "ok", data: physicalR.value }
        : { state: "error" });
      setSummary(summaryR.status === "fulfilled"
        ? { state: "ok", data: summaryR.value }
        : { state: "error" });
      setThought(thoughtR.status === "fulfilled"
        ? { state: "ok", data: thoughtR.value }
        : { state: "error" });
    })();
  }, []);

  const handleEntryChange = (entry: JournalEntryOut) => {
    setTodayEntry(entry);
    setJournal((prev) =>
      prev.state === "ok" ? { state: "ok", data: [entry, ...prev.data] } : prev,
    );
  };

  const handleNudgeReady = (entryId: string, n: NudgeOut) => {
    setNudge({ entryId, nudge: n });
  };

  const todayIso = todayISO();
  const journalEntries = journal.state === "ok" ? journal.data : [];
  const todayEntries = journalEntries.filter((e) => e.date === todayIso);
  const wroteJournal = todayEntries.some((e) => e.content.trim().length > 0);
  const loggedMood = todayEntries.length > 0;
  const physicalToday = physical.state === "ok" ? physical.data : null;
  const loggedPhysical = !!(
    physicalToday &&
    (physicalToday.sleep_band !== null ||
      physicalToday.energy !== null ||
      physicalToday.moved !== null)
  );
  const programComplete =
    progress.state === "ok" && progress.data.program_completed_at !== null;
  const allLoaded =
    journal.state !== "loading" &&
    physical.state !== "loading" &&
    progress.state !== "loading";

  return (
    <div className="space-y-10">
      <GreetingBand
        email={user.state === "ok" ? user.data.email : null}
        userId={user.state === "ok" ? user.data.id : null}
      />

      {allLoaded ? (
        <NextBestAction
          hasTodayJournal={wroteJournal}
          todayMood={todayEntry?.mood ?? null}
          hasTodayPhysical={loggedPhysical}
          programComplete={programComplete}
        />
      ) : null}

      {program.state === "loading" || progress.state === "loading" ? (
        <Skeleton className="h-48" />
      ) : program.state === "error" || progress.state === "error" ? (
        <SectionError />
      ) : (
        <ContinueProgramCard program={program.data} progress={progress.data} />
      )}

      <div className="space-y-4">
        {journal.state === "loading" ? (
          <Skeleton className="h-40" />
        ) : journal.state === "error" ? (
          <SectionError />
        ) : (
          <MoodCaptureCard
            initialEntry={todayEntry}
            onEntryChange={handleEntryChange}
            onNudgeReady={handleNudgeReady}
          />
        )}

        {todayEntry && todayEntry.mood < 6 && nudge ? (
          <div ref={interventionRef} className="transition-opacity duration-200">
            <InterventionCard entryId={nudge.entryId} initialNudge={nudge.nudge} />
          </div>
        ) : null}
      </div>

      {physical.state === "loading" ? (
        <Skeleton className="h-24" />
      ) : physical.state === "error" ? (
        <SectionError />
      ) : (
        <PhysicalCheckInRow entry={physical.data} />
      )}

      {summary.state === "loading" ? (
        <Skeleton className="h-32" />
      ) : summary.state === "error" ? (
        <SectionError />
      ) : (
        <ProgressSnapshotCard summary={summary.data} />
      )}

      <ShowedUpToday
        loggedMood={loggedMood}
        wroteJournal={wroteJournal}
        loggedPhysical={loggedPhysical}
      />

      {(() => {
        const weekday = new Date().getDay();
        const isSunOrMon = weekday === 0 || weekday === 1;
        if (!isSunOrMon || !weekly) return null;
        const filled = Object.values(weekly.answers ?? {}).filter(
          (v) => typeof v === "string" && v.trim().length > 0,
        ).length;
        if (filled === 0) {
          return (
            <div className="text-center">
              <Link
                href="/weekly"
                className="text-sm text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
              >
                Take five minutes for a weekly reflection &rarr;
              </Link>
            </div>
          );
        }
        if (filled < 4) {
          return (
            <div className="text-center">
              <Link
                href="/weekly"
                className="text-sm text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
              >
                Continue your weekly reflection &rarr;
              </Link>
            </div>
          );
        }
        return null;
      })()}

      {thought.state === "ok" ? <DailyThought thought={thought.data} /> : null}
    </div>
  );
}
