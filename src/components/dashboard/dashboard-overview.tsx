import { buildSubjectProgress } from "@/lib/db/schema";
import { LocalDatabase } from "@/lib/types";

type DashboardOverviewProps = {
  database: LocalDatabase;
};

function formatMetaLine(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" | ");
}

export function DashboardOverview({
  database,
}: DashboardOverviewProps) {
  const subjectProgress = database.subjects.map(buildSubjectProgress);
  const totalCompleted = subjectProgress.reduce(
    (sum, subject) => sum + subject.completedPapers,
    0,
  );
  const totalPapers = subjectProgress.reduce(
    (sum, subject) => sum + subject.totalPapers,
    0,
  );
  const totalReviewItems = subjectProgress.reduce(
    (sum, subject) => sum + subject.reviewItemCount,
    0,
  );
  const overallPercent =
    totalPapers === 0 ? 0 : Math.round((totalCompleted / totalPapers) * 100);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 shadow-2xl shadow-sky-950/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">
                GCSE Past Paper Tracker
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Summer 2026 revision progress at a glance
              </h1>
              <p className="text-sm leading-6 text-slate-300 sm:text-base">
                A mobile-friendly dashboard for seeing which papers are done,
                where marks are slipping, and which topics need a review pass
                next.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Overall completion</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {overallPercent}%
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {totalCompleted} of {totalPapers} papers logged
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Subjects tracked</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {database.subjects.length}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Covering the full Summer 2026 study plan
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Review topics</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {totalReviewItems}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Focus points ready for the review dashboard
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjectProgress.map((subject) => {
            const source = database.subjects.find(
              (item) => item.id === subject.subjectId,
            );

            return (
              <article
                key={subject.subjectId}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {subject.subjectName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatMetaLine([
                        subject.specificationLabel,
                        source?.tier,
                        source?.route,
                      ])}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-300">
                    {subject.completedPapers}/{subject.totalPapers}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Progress</span>
                    <span>{subject.completionPercent}%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
                      style={{ width: `${subject.completionPercent}%` }}
                    />
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <dt className="text-slate-400">Pending papers</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {subject.pendingPapers}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <dt className="text-slate-400">Review items</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {subject.reviewItemCount}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-200">
                    Next review focus
                  </p>
                  {subject.latestReviewTopics.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      {subject.latestReviewTopics.map((topic) => (
                        <li
                          key={topic}
                          className="rounded-2xl border border-slate-800 bg-slate-950/50 px-3 py-2"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 rounded-2xl border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-400">
                      No flagged review topics yet.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
