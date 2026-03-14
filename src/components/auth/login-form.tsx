"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setMessage("Login failed. Please check the username and password.");
      return;
    }

    const nextPathParam = searchParams.get("next");
    const nextPath =
      nextPathParam && nextPathParam.startsWith("/") ? nextPathParam : "/";
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-slate-950/40">
      <label className="block space-y-2 text-sm text-slate-200">
        <span>Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          autoComplete="username"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          autoComplete="current-password"
          required
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {message ?? "Use the app credentials to open the tracker."}
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {isSaving ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
