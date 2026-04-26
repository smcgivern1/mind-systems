"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type Variant = "default" | "primary" | "secondary" | "quiet" | "confirmation";

const VARIANT_BG: Record<Variant, string> = {
  default: "bg-bg-card",
  primary: "bg-bg-card-sage",
  secondary: "bg-bg-card-sky",
  quiet: "bg-bg-card-sand",
  confirmation: "bg-bg-card-apricot",
};

export default function Card({
  variant = "default",
  className,
  children,
  onClick,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={clsx(
        VARIANT_BG[variant],
        "rounded-card shadow-card p-6 md:p-8",
        interactive && "cursor-pointer transition-colors hover:brightness-[0.98]",
        className,
      )}
    >
      {children}
    </div>
  );
}
