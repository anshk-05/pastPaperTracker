"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const isTrackerUnavailable = error.message.includes("Tracker data");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-slate-950/40 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-300">
            Tracker Unavailable
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            The tracker could not load safely
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            {isTrackerUnavailable
              ? error.message
              : "Something went wrong while loading the tracker."}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Saved data was not intentionally overwritten. Try again in a moment,
            then check the Cosmos DB connection if the issue keeps happening.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Try again
            </button>
            <a
              href="/login"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
