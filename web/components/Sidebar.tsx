"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import { logout } from "@/lib/api";

type NavItem = { label: string; href: string; matcher: (path: string) => boolean };

const SECTIONS: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [
      { label: "Home", href: "/dashboard", matcher: (p) => p === "/dashboard" },
    ],
  },
  {
    title: "Happiness Programs",
    items: [
      {
        label: "Personal Power",
        href: "/day/1",
        matcher: (p) => p.startsWith("/day"),
      },
    ],
  },
  {
    title: "Daily",
    items: [
      { label: "Journal", href: "/journal", matcher: (p) => p.startsWith("/journal") },
      { label: "Physical", href: "/physical", matcher: (p) => p.startsWith("/physical") },
    ],
  },
  {
    title: "Reflection",
    items: [
      { label: "Progress", href: "/progress", matcher: (p) => p.startsWith("/progress") },
      { label: "Resources", href: "/resources", matcher: (p) => p.startsWith("/resources") },
    ],
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-ink-primary/30 z-40 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-line-soft p-6 flex flex-col",
          "transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-sm" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="text-lg font-medium text-ink-primary mb-10">Mind Systems</div>

        <nav className="flex-1 space-y-6">
          {SECTIONS.map((section, idx) => (
            <div key={section.title ?? `untitled-${idx}`}>
              {section.title ? (
                <div className="text-xs uppercase tracking-wide text-ink-muted mb-2">
                  {section.title}
                </div>
              ) : null}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = item.matcher(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={clsx(
                          "block px-3 py-2 rounded-lg text-sm transition-colors",
                          active
                            ? "bg-bg-card-sand text-ink-primary font-medium"
                            : "text-ink-secondary hover:bg-bg-primary hover:text-ink-primary",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="text-left text-sm text-ink-muted hover:text-ink-primary px-3 py-2"
        >
          Sign out
        </button>
      </aside>
    </>
  );
}
