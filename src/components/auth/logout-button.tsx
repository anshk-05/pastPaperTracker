"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        setMessage("Could not sign out. Please try again.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setMessage("Could not sign out. Check the connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
      {message ? (
        <p className="text-sm text-rose-300" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
