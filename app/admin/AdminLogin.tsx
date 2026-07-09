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
    <main className="flex min-h-screen items-center justify-center bg-[#ede0d4] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#fffdfa] p-8 shadow-[0_14px_40px_rgba(127,85,57,0.12)]">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-[#b08968]">
          Satielle
        </p>
        <h1
          className="mt-2 text-center text-2xl text-[#7f5539]"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Order admin
        </h1>

        {configured ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-[#b08968]">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
                className="w-full rounded-xl border border-[#e6ccb2] bg-white px-4 py-3 text-[#7f5539] outline-none transition focus:border-[#b08968] focus:ring-2 focus:ring-[#ddb892]/40"
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
              className="w-full rounded-full bg-[#7f5539] py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#6b4429] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <p className="mt-8 rounded-xl bg-[#faf4ec] px-4 py-3 text-sm leading-relaxed text-[#9c6644]">
            Admin access is not configured yet. Set the{" "}
            <code className="font-mono text-xs">ADMIN_PASSWORD</code>{" "}
            environment variable and redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
