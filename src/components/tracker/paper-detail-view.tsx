import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { PaperProgressForm } from "@/components/papers/paper-progress-form";
import { buildSubjectTrackerSummary } from "@/lib/db/schema";
import { Paper, Subject } from "@/lib/types";

type PaperDetailViewProps = {
  subject: Subject;
  paper: Paper;
};

function buildStatusClass(status: string) {
  return status === "Completed"
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-amber-500/15 text-amber-200";
}

export function PaperDetailView({ subject, paper }: PaperDetailViewProps) {
  const summary = buildSubjectTrackerSummary(subject);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 shadow-2xl shadow-sky-950/30 sm:p-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/subjects/${subject.id}`}
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Back to {subject.name}
            </Link>
            <Link
              href="/manage-papers"
              className="inline-flex items-center rounded-full border border-sky-600/50 px-4 py-2 text-sm text-sky-100 transition hover:border-sky-400 hover:text-white"
            >
              Manage papers
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center rounded-full border border-sky-600/50 px-4 py-2 text-sm text-sky-100 transition hover:border-sky-400 hover:text-white"
            >
              Calendar
            </Link>
            <LogoutButton />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">
                Paper Tracker
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {paper.paperCode}
              </h1>
              <p className="text-base text-slate-200">
                {paper.assessmentComponent}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {paper.source}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {paper.seriesLabel}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${buildStatusClass(
                    paper.performance.status,
                  )}`}
                >
                  {paper.performance.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Subject completion</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.completionPercent}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Pending in subject</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.pendingPapers}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Review topics</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.reviewItemCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
            <h2 className="text-2xl font-semibold text-white">Log this paper</h2>
            <p className="mt-1 text-sm text-slate-400">
              Save the score, grade, and improvement notes just for this paper.
            </p>
            <PaperProgressForm paper={paper} />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
            <h2 className="text-2xl font-semibold text-white">Current paper snapshot</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Score</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {paper.performance.score ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Percentage</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {paper.performance.percentage != null
                    ? `${paper.performance.percentage}%`
                    : "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Grade</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {paper.performance.grade ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Last updated</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {paper.performance.updatedAt ?? "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-medium text-slate-200">
                Improvement topics on this paper
              </p>
              {paper.performance.topicsForImprovement.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {paper.performance.topicsForImprovement.map((topic) => (
                    <li
                      key={topic}
                      className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  No topics recorded yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
