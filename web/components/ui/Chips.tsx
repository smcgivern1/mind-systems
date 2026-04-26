"use client";

import clsx from "clsx";

export default function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "px-4 h-10 rounded-full text-sm transition-colors",
              selected
                ? "bg-accent-sage text-white"
                : "bg-bg-card border border-line-soft text-ink-secondary hover:border-ink-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
