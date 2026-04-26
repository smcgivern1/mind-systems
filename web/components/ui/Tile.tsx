"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export default function Tile({
  label,
  value,
  filled,
  onClick,
  children,
}: {
  label: string;
  value?: string;
  filled: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex-1 rounded-tile p-4 text-left transition-colors",
        filled
          ? "bg-bg-card shadow-card"
          : "bg-bg-tile-empty hover:bg-bg-card-sand",
      )}
    >
      <div className="text-lg font-medium text-ink-primary min-h-[24px] flex items-center gap-2">
        {filled ? (children ?? value) : <span className="text-ink-secondary text-sm">Log</span>}
      </div>
      <div className="mt-1 text-xs text-ink-secondary">{label}</div>
    </button>
  );
}
