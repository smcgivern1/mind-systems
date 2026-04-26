"use client";

import clsx from "clsx";

export default function MoodSelector({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={clsx(
              "w-10 h-10 rounded-full text-sm transition-colors",
              selected
                ? "bg-accent-sage text-white"
                : "bg-bg-card border border-line-soft text-ink-secondary hover:border-ink-muted",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
