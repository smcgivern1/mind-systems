"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.login(email.trim());
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md p-8 border border-line-soft rounded-card shadow-card bg-bg-card"
      >
        <h1 className="text-3xl font-medium text-ink-primary mb-2">Mind Systems</h1>
        <p className="text-ink-muted mb-6">Personal Power II — daily program.</p>
        <label className="block mb-2 text-sm text-ink-secondary">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line-soft rounded-input p-3 bg-bg-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-sage mb-4"
          placeholder="you@example.com"
        />
        {error ? <p className="text-state-error text-sm mb-3">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !email}
          className="w-full px-4 py-3 bg-accent-sage hover:bg-accent-sage-hover text-white rounded-button disabled:opacity-40"
        >
          {busy ? "Continuing..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
