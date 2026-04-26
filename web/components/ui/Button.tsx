"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "inline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  className,
  children,
  disabled,
  ...rest
}: Props) {
  const base = "transition-colors font-medium";
  const styles: Record<Variant, string> = {
    primary: clsx(
      "h-14 px-6 rounded-button text-base text-white",
      disabled
        ? "bg-accent-sage/40 cursor-not-allowed"
        : "bg-accent-sage hover:bg-accent-sage-hover",
    ),
    secondary: clsx(
      "h-14 px-6 rounded-button text-base text-ink-primary border border-line-soft bg-bg-card",
      disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-bg-card-sand",
    ),
    inline: clsx(
      "text-sm text-ink-secondary underline-offset-4 hover:text-ink-primary hover:underline",
      disabled && "opacity-40 cursor-not-allowed",
    ),
  };
  return (
    <button
      disabled={disabled}
      className={clsx(base, styles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
