import Link from "next/link";
import { Subject } from "@/lib/types";

type SubjectPaperCatalogProps = {
  subject: Subject;
};

function formatMetaLine(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" | ");
}

function buildStatusClass(status: string) {
  return status === "Completed"
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-amber-500/15 text-amber-200";
}

export function SubjectPaperCatalog({
  subject,
}: SubjectPaperCatalogProps) {
  const papersByYear = subject.papers.reduce<Record<number, Subject["papers"]>>(
    (groups, paper) => {
      if (!groups[paper.year]) {
        groups[paper.year] = [];
      }

      groups[paper.year].push(paper);
      return groups;
    },
    {},
  );

  const years = Object.keys(papersByYear)
    .map(Number)
    .sort((left, right) => right - left);

  const completedPapers = subject.papers.filter(
    (paper) => paper.performance.status === "Completed",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Back to dashboard
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Full Past Paper Catalog
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {subject.name}
              </h1>
              <p className="text-sm leading-6 text-slate-300 sm:text-base">
                {formatMetaLine([
                  `${subject.examBoard} ${subject.specificationCode}`,
                  subject.tier,
                  subject.route,
                ])}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Available papers</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {subject.papers.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Completed</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {completedPapers}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Target series</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {subject.targetSeries}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {years.map((year) => (
            <div key={year} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{year}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {papersByYear[year].length} paper
                    {papersByYear[year].length === 1 ? "" : "s"} available
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {papersByYear[year].map((paper) => (
                  <article
                    key={paper.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm font-medium text-sky-200">
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
                        <div>
                          <p className="text-sm text-slate-400">Paper code</p>
                          <p className="text-lg font-semibold text-white">
                            {paper.paperCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">
                            Assessment component
                          </p>
                          <p className="text-base text-slate-100">
                            {paper.assessmentComponent}
                          </p>
                        </div>
                      </div>

                      <dl className="grid min-w-full grid-cols-2 gap-3 text-sm sm:min-w-[320px] lg:max-w-sm">
                        <div className="rounded-2xl bg-slate-900 p-3">
                          <dt className="text-slate-400">Score</dt>
                          <dd className="mt-1 text-lg font-semibold text-white">
                            {paper.performance.score ?? "-"}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-slate-900 p-3">
                          <dt className="text-slate-400">Percentage</dt>
                          <dd className="mt-1 text-lg font-semibold text-white">
                            {paper.performance.percentage != null
                              ? `${paper.performance.percentage}%`
                              : "-"}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-slate-900 p-3">
                          <dt className="text-slate-400">Grade</dt>
                          <dd className="mt-1 text-lg font-semibold text-white">
                            {paper.performance.grade ?? "-"}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-slate-900 p-3">
                          <dt className="text-slate-400">Updated</dt>
                          <dd className="mt-1 text-lg font-semibold text-white">
                            {paper.performance.updatedAt ?? "-"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-200">
                        Topics for improvement
                      </p>
                      {paper.performance.topicsForImprovement.length > 0 ? (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {paper.performance.topicsForImprovement.map((topic) => (
                            <li
                              key={`${paper.id}-${topic}`}
                              className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200"
                            >
                              {topic}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">
                          No improvement notes logged yet.
                        </p>
                      )}
                    </div>

                    {paper.performance.notes ? (
                      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-sm text-slate-400">Notes</p>
                        <p className="mt-1 text-sm leading-6 text-slate-200">
                          {paper.performance.notes}
                        </p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
