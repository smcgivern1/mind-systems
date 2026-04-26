"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MoodSelector from "@/components/ui/MoodSelector";
import { createJournalEntry, getNudge } from "@/lib/api";
import type { JournalEntryOut, NudgeOut } from "@/lib/types";

export default function MoodCaptureCard({
  initialEntry,
  onEntryChange,
  onNudgeReady,
}: {
  initialEntry: JournalEntryOut | null;
  onEntryChange: (entry: JournalEntryOut) => void;
  onNudgeReady: (entryId: string, nudge: NudgeOut) => void;
}) {
  const router = useRouter();
  const [pickedMood, setPickedMood] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const handleMood = async (mood: number) => {
    if (busy || initialEntry) return;
    setPickedMood(mood);
    setBusy(true);
    try {
      const entry = await createJournalEntry({ mood, content: "" });
      onEntryChange(entry);
      if (mood < 6) {
        const nudge = await getNudge(entry.id);
        onNudgeReady(entry.id, nudge);
      }
    } catch {
      setPickedMood(null);
    } finally {
      setBusy(false);
    }
  };

  const saveWithNote = async () => {
    if (!pickedMood || busy) return;
    setBusy(true);
    try {
      const entry = await createJournalEntry({ mood: pickedMood, content: note });
      onEntryChange(entry);
      if (entry.mood < 6) {
        const nudge = await getNudge(entry.id);
        onNudgeReady(entry.id, nudge);
      }
      setNoteOpen(false);
      setNote("");
    } finally {
      setBusy(false);
    }
  };

  if (initialEntry) {
    const time = new Date(initialEntry.created_at).toLocaleTimeString(
      undefined,
      { hour: "numeric", minute: "2-digit" },
    );
    return (
      <Card variant="secondary" className="p-5 md:p-6">
        <div className="flex items-baseline gap-3">
          <p className="text-sm text-ink-muted">Logged at {time}</p>
        </div>
        <p className="mt-2 text-2xl font-medium text-ink-primary">{initialEntry.mood}</p>
        <button
          onClick={() => router.push("/journal")}
          className="mt-4 text-sm text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
        >
          Write more in your journal &rarr;
        </button>
      </Card>
    );
  }

  return (
    <Card variant="secondary" className="p-5 md:p-6">
      <h3 className="text-base font-medium text-ink-primary">
        How are you feeling right now?
      </h3>
      <div className="mt-4">
        <MoodSelector value={pickedMood} onChange={handleMood} disabled={busy} />
      </div>
      <div className="mt-3">
        {noteOpen ? (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Anything to flag?"
              className="w-full p-4 text-base bg-bg-card-sand focus:bg-bg-card border border-line-soft rounded-input focus:outline-none focus:border-ink-muted resize-y"
            />
            <Button onClick={saveWithNote} disabled={!pickedMood || busy} className="px-6">
              Save
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setNoteOpen(true)}
            className="text-sm text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
          >
            Add a note
          </button>
        )}
      </div>
    </Card>
  );
}
