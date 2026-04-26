"use client";

import { useEffect, useState } from "react";
import { getPhysicalRange, getPhysicalToday, upsertPhysical } from "@/lib/api";
import type { MovementType, PhysicalOut, SleepBand } from "@/lib/types";
import Button from "@/components/ui/Button";
import Chips from "@/components/ui/Chips";
import MoodSelector from "@/components/ui/MoodSelector";

const SLEEP_OPTIONS: { value: SleepBand; label: string }[] = [
  { value: "lt5", label: "<5h" },
  { value: "5to6", label: "5–6h" },
  { value: "6to7", label: "6–7h" },
  { value: "7to8", label: "7–8h" },
  { value: "gt8", label: "8h+" },
];

const MOVED_OPTIONS: { value: "yes" | "no"; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "Not yet" },
];

const MOVEMENT_OPTIONS: { value: MovementType; label: string }[] = [
  { value: "walk", label: "Walk" },
  { value: "workout", label: "Workout" },
  { value: "sport", label: "Sport" },
  { value: "other", label: "Other" },
];

type DurationBand = "5" | "15" | "30" | "60";

const DURATION_OPTIONS: { value: DurationBand; label: string }[] = [
  { value: "5", label: "< 10 min" },
  { value: "15", label: "10–20 min" },
  { value: "30", label: "20–40 min" },
  { value: "60", label: "40+ min" },
];

const MOVEMENT_TIPS: Record<MovementType, string> = {
  walk: "Even a slow walk counts. Outside if you can.",
  workout: "Form over intensity. Stop a rep before failure.",
  sport: "Warm up first. Notice how your body feels after.",
  other: "Anything that gets you moving counts.",
};

function nearestBand(minutes: number | null): DurationBand | null {
  if (minutes == null) return null;
  let best: DurationBand = "5";
  let bestDiff = Infinity;
  for (const opt of DURATION_OPTIONS) {
    const diff = Math.abs(parseInt(opt.value, 10) - minutes);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = opt.value;
    }
  }
  return best;
}

export default function PhysicalPage() {
  const [loaded, setLoaded] = useState(false);
  const [existing, setExisting] = useState<PhysicalOut | null>(null);

  const [sleepBand, setSleepBand] = useState<SleepBand | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [movedChoice, setMovedChoice] = useState<"yes" | "no" | null>(null);
  const [movementType, setMovementType] = useState<MovementType | null>(null);
  const [durationBand, setDurationBand] = useState<DurationBand | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [lastMovement, setLastMovement] = useState<PhysicalOut | null>(null);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const todayDate = new Date();
    const todayKey = todayDate.toLocaleDateString("en-CA");
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 14);
    const fromKey = fromDate.toLocaleDateString("en-CA");
    getPhysicalRange(fromKey, todayKey)
      .then((rows) => {
        const past = rows
          .filter((r) => r.moved === true && r.date !== todayKey)
          .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
        if (past.length > 0) setLastMovement(past[0]);
      })
      .catch(() => {});
    getPhysicalToday()
      .then((p) => {
        if (p) {
          setExisting(p);
          setSleepBand(p.sleep_band);
          setEnergy(p.energy);
          if (p.moved === true) setMovedChoice("yes");
          else if (p.moved === false) setMovedChoice("no");
          setMovementType(p.movement_type);
          setDurationBand(nearestBand(p.duration_minutes));
          if (p.note) {
            setNote(p.note);
            setNoteOpen(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const anyInput =
    sleepBand !== null ||
    energy !== null ||
    movedChoice !== null ||
    note.trim().length > 0;

  const save = async () => {
    if (!anyInput || saving) return;
    setSaving(true);
    try {
      const moved =
        movedChoice === "yes" ? true : movedChoice === "no" ? false : null;
      const movement_type = movedChoice === "yes" ? movementType : null;
      const duration_minutes =
        movedChoice === "yes" && durationBand !== null
          ? parseInt(durationBand, 10)
          : null;
      const updated = await upsertPhysical({
        sleep_band: sleepBand,
        energy,
        moved,
        movement_type,
        duration_minutes,
        note: note.trim() ? note : null,
      });
      setExisting(updated);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  const lastMovementHint = lastMovement
    ? (() => {
        if (lastMovement.movement_type) {
          const cap =
            lastMovement.movement_type.charAt(0).toUpperCase() +
            lastMovement.movement_type.slice(1);
          return lastMovement.duration_minutes
            ? `Last time: ${cap} · ${lastMovement.duration_minutes}m`
            : `Last time: ${cap}`;
        }
        return "Last time: moved";
      })()
    : null;

  return (
    <div>
      <h1 className="text-2xl font-medium text-ink-primary">Physical</h1>
      <p className="mt-1 text-sm text-ink-muted">{today}</p>

      {lastMovementHint ? (
        <p className="mt-6 mb-6 text-sm text-ink-muted">{lastMovementHint}</p>
      ) : null}

      <div className="mt-10 space-y-6">
        <section>
          <label className="block text-base font-medium text-ink-primary mb-3">
            Sleep last night
          </label>
          <Chips options={SLEEP_OPTIONS} value={sleepBand} onChange={setSleepBand} />
        </section>

        <section>
          <label className="block text-base font-medium text-ink-primary mb-3">
            Energy right now
          </label>
          <MoodSelector value={energy} onChange={setEnergy} />
        </section>

        <section>
          <label className="block text-base font-medium text-ink-primary mb-3">
            Have you moved today?
          </label>
          <Chips options={MOVED_OPTIONS} value={movedChoice} onChange={setMovedChoice} />
          {movedChoice === "yes" ? (
            <div className="mt-3">
              <select
                value={movementType ?? ""}
                onChange={(e) =>
                  setMovementType((e.target.value as MovementType) || null)
                }
                className="rounded-input bg-bg-card-sand p-3 text-base border border-line-soft focus:bg-bg-card focus:outline-none focus:border-ink-muted"
              >
                <option value="">Movement type…</option>
                {MOVEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </section>

        {movedChoice === "yes" ? (
          <section>
            <label className="block text-base font-medium text-ink-primary mb-3">
              For how long?
            </label>
            <Chips
              options={DURATION_OPTIONS}
              value={durationBand}
              onChange={setDurationBand}
            />
            {movementType ? (
              <p className="text-sm text-ink-secondary mt-3">
                {MOVEMENT_TIPS[movementType]}
              </p>
            ) : null}
          </section>
        ) : null}

        <section>
          {noteOpen ? (
            <div>
              <label className="block text-base font-medium text-ink-primary mb-3">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Anything to flag about your body today?"
                className="w-full p-4 text-base bg-bg-card-sand focus:bg-bg-card border border-line-soft rounded-input focus:outline-none focus:border-ink-muted resize-y"
              />
            </div>
          ) : (
            <Button variant="inline" onClick={() => setNoteOpen(true)}>
              Add a note
            </Button>
          )}
        </section>

        <div>
          {existing ? (
            <Button
              variant="secondary"
              onClick={save}
              disabled={!anyInput || saving}
              className="w-full md:w-auto md:px-8"
            >
              {saving ? "Saving…" : "Update"}
            </Button>
          ) : (
            <Button
              onClick={save}
              disabled={!anyInput || saving}
              className="w-full md:w-auto md:px-8"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>

      {toastVisible ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink-primary text-white px-4 py-2 rounded-full text-sm shadow-elevated z-40">
          Saved
        </div>
      ) : null}
    </div>
  );
}
