"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error || "Incorrect password.");
      setSubmitting(false);
      return;
    }

    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-nova-off px-4">
      <div className="w-full max-w-sm rounded-2xl border border-nova-border bg-white p-8 shadow-[0_24px_60px_rgba(10,47,107,0.09)]">
        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-nova-navy">
          Satielle
        </p>
        <h1 className="mt-2 text-center text-2xl font-extrabold text-nova-navy">
          Order admin
        </h1>

        {configured ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-nova-inkSoft">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
                className="w-full rounded-xl border border-nova-border bg-white px-4 py-3 text-nova-navy outline-none transition focus:border-nova-gold focus:ring-2 focus:ring-nova-gold/30"
                placeholder="Enter the admin password"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !password}
              className="w-full rounded-full bg-nova-navy py-3 text-sm font-bold tracking-wide text-white transition hover:bg-nova-navyDeep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <p className="mt-8 rounded-xl bg-nova-off px-4 py-3 text-sm leading-relaxed text-nova-navySoft">
            Admin access is not configured yet. Set the{" "}
            <code className="font-mono text-xs">ADMIN_PASSWORD</code>{" "}
            environment variable and redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
