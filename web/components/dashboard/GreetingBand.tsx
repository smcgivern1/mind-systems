"use client";

import { identityLineFor } from "@/lib/identity";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(email: string): string {
  const local = email.split("@")[0];
  const cleaned = local.replace(/[._-]/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function GreetingBand({
  email,
  userId,
}: {
  email: string | null;
  userId?: string | null;
}) {
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const todayIso = new Date().toLocaleDateString("en-CA");
  const identity = userId ? identityLineFor(userId, todayIso) : null;
  return (
    <div>
      <h1 className="text-display text-ink-primary mb-2">
        {greeting()}
        {email ? `, ${firstName(email)}` : ""}
      </h1>
      <p className="text-sm text-ink-muted">{dateLabel}</p>
      {identity ? (
        <p className="text-sm text-ink-muted italic mt-1">{identity}</p>
      ) : null}
    </div>
  );
}
