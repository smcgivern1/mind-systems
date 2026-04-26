"use client";

import Link from "next/link";

export default function Done() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-medium text-ink-primary mb-3">Program complete.</h1>
      <p className="text-ink-muted mb-6">You finished Personal Power II.</p>
      <Link href="/" className="px-4 py-2 border border-line-soft rounded-button text-ink-primary hover:bg-bg-card-sand">
        Review
      </Link>
    </div>
  );
}
