"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { me } from "@/lib/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    me().catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-primary text-ink-primary">
      <Topbar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-xl mx-auto px-6 py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}
