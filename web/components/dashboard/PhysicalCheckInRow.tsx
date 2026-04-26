"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Tile from "@/components/ui/Tile";
import type { PhysicalOut, SleepBand } from "@/lib/types";

const SLEEP_DISPLAY: Record<SleepBand, string> = {
  lt5: "<5h",
  "5to6": "5–6h",
  "6to7": "6–7h",
  "7to8": "7–8h",
  gt8: "8h+",
};

export default function PhysicalCheckInRow({
  entry,
}: {
  entry: PhysicalOut | null;
}) {
  const router = useRouter();
  const go = () => router.push("/physical");

  const sleepFilled = !!entry?.sleep_band;
  const energyFilled = entry?.energy != null;
  const movedAnswered = entry?.moved != null;

  return (
    <section>
      <div className="text-xs uppercase tracking-wide text-ink-muted mb-3">
        Today&rsquo;s check-ins
      </div>
      <div className="flex gap-3">
        <Tile
          label="Sleep"
          filled={sleepFilled}
          value={sleepFilled ? SLEEP_DISPLAY[entry!.sleep_band as SleepBand] : undefined}
          onClick={go}
        />
        <Tile
          label="Energy"
          filled={energyFilled}
          value={energyFilled ? `${entry!.energy}/10` : undefined}
          onClick={go}
        />
        <Tile label="Move" filled={movedAnswered} onClick={go}>
          {entry?.moved === true ? (
            <>
              <Check size={16} className="text-accent-sage shrink-0" />
              <span className="leading-tight">
                {entry.movement_type && entry.duration_minutes
                  ? `${entry.movement_type.charAt(0).toUpperCase()}${entry.movement_type.slice(1)} · ${entry.duration_minutes}m`
                  : "Moved"}
              </span>
            </>
          ) : entry?.moved === false ? (
            <span className="text-ink-secondary">Not yet</span>
          ) : null}
        </Tile>
      </div>
    </section>
  );
}
