"use client";

import { useEffect, useRef, useState } from "react";
import {
  createJournalEntry,
  getJournalEntries,
  getNudge,
} from "@/lib/api";
import type { JournalEntryOut, NudgeOut } from "@/lib/types";
import Button from "@/components/ui/Button";
import MoodSelector from "@/components/ui/MoodSelector";
import InterventionCard from "@/components/InterventionCard";

export default function JournalPage() {
  const [mood, setMood] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntryOut[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nudge, setNudge] = useState<{ entryId: string; nudge: NudgeOut } | null>(null);
  const [savedEntry, setSavedEntry] = useState<JournalEntryOut | null>(null);

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

  const todayIso = new Date().toLocaleDateString("en-CA");
  const yesterdayIso = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-CA");
  })();
  const previousEntry = entries
    .filter((e) => e.date < todayIso && e.content.trim().length > 0)
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))[0];
  const previousHint = previousEntry
    ? (() => {
        const flat = previousEntry.content.replace(/\s+/g, " ").trim();
        const truncated = flat.length > 80 ? flat.slice(0, 80) + "…" : flat;
        const prefix =
          previousEntry.date === yesterdayIso ? "Yesterday you wrote" : "Last time you wrote";
        return `${prefix}: "${truncated}"`;
      })()
    : null;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    getJournalEntries()
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const save = async () => {
    if (mood === null || saving) return;
    setSaving(true);
    setError(null);
    try {
      const entry = await createJournalEntry({ mood, content });
      setEntries((prev) => [entry, ...prev]);
      setSavedEntry(entry);
      setMood(null);
      setContent("");
      if (entry.mood < 6) {
        try {
          const n = await getNudge(entry.id);
          setNudge({ entryId: entry.id, nudge: n });
        } catch {
          /* ignore */
        }
      } else {
        setNudge(null);
      }
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-medium text-ink-primary">Journal</h1>
      <p className="mt-1 text-sm text-ink-muted">{today}</p>

      {previousHint ? (
        <p className="mt-6 mb-6 text-sm text-ink-muted italic">{previousHint}</p>
      ) : null}

      <div className="mt-10 space-y-8">
        <section>
          <label className="block text-base font-medium text-ink-primary mb-3">
            How are you feeling today?
          </label>
          <MoodSelector value={mood} onChange={setMood} disabled={saving} />
        </section>

        <section>
          <label className="block text-base font-medium text-ink-primary mb-3">Notes</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="What's on your mind?"
            className="w-full p-4 text-base bg-bg-card-sand focus:bg-bg-card border border-line-soft rounded-input focus:outline-none focus:border-ink-muted resize-y"
          />
        </section>

        <div>
          <Button
            onClick={save}
            disabled={mood === null || saving}
            className="w-full md:w-auto md:px-8"
          >
            {saving ? "Saving…" : "Save entry"}
          </Button>
          {error && <p className="mt-3 text-sm text-state-error">{error}</p>}
        </div>

        {savedEntry && nudge ? (
          <div ref={interventionRef} className="transition-opacity duration-200">
            <InterventionCard entryId={nudge.entryId} initialNudge={nudge.nudge} />
          </div>
        ) : null}
      </div>

      <section className="mt-16">
        <h2 className="text-lg font-medium text-ink-primary">Previous entries</h2>
        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No entries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line-soft">
            {entries.map((e) => (
              <li key={e.id} className="py-4">
                <div className="text-sm text-ink-secondary">
                  {new Date(e.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {"  ·  Mood: "}
                  {e.mood}
                </div>
                {e.content && (
                  <p className="mt-2 text-ink-primary whitespace-pre-wrap line-clamp-3">
                    {e.content}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
