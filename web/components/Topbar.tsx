"use client";

import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="md:hidden h-14 bg-bg-card border-b border-line-soft sticky top-0 z-30 flex items-center px-4">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="p-2 -ml-2 rounded-lg hover:bg-bg-card-sand"
      >
        <Menu className="w-5 h-5 text-ink-secondary" />
      </button>
      <div className="flex-1 text-center text-sm font-medium text-ink-primary">
        Mind Systems
      </div>
      <div className="w-9" />
    </header>
  );
}
