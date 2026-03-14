"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { buildSubjectTrackerSummary } from "@/lib/db/schema";
import { Paper, Subject } from "@/lib/types";

type SubjectTrackerProps = {
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

function buildTopicCounts(papers: Paper[]) {
  const counts = new Map<string, number>();

  papers.forEach((paper) => {
    paper.performance.topicsForImprovement.forEach((topic) => {
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
}

export function SubjectTracker({ subject }: SubjectTrackerProps) {
  const years = useMemo(
    () =>
      Array.from(new Set(subject.papers.map((paper) => `${paper.year}`))).sort(
        (left, right) => Number(right) - Number(left),
      ),
    [subject.papers],
  );
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedPaperId, setSelectedPaperId] = useState<string>("all");

  const paperOptions = useMemo(
    () =>
      subject.papers.filter(
        (paper) => selectedYear === "all" || `${paper.year}` === selectedYear,
      ),
    [selectedYear, subject.papers],
  );

  useEffect(() => {
    if (
      selectedPaperId !== "all" &&
      !paperOptions.some((paper) => paper.id === selectedPaperId)
    ) {
      setSelectedPaperId("all");
    }
  }, [paperOptions, selectedPaperId]);

  const filteredPapers = useMemo(
    () =>
      subject.papers.filter((paper) => {
        const matchesYear =
          selectedYear === "all" || `${paper.year}` === selectedYear;
        const matchesPaper =
          selectedPaperId === "all" || paper.id === selectedPaperId;

        return matchesYear && matchesPaper;
      }),
    [selectedPaperId, selectedYear, subject.papers],
  );

  const filteredSubject = useMemo(
    () => ({
      ...subject,
      papers: filteredPapers,
    }),
    [filteredPapers, subject],
  );
  const summary = buildSubjectTrackerSummary(filteredSubject);
  const papersByYear = filteredPapers.reduce<Record<number, Subject["papers"]>>(
    (groups, paper) => {
      if (!groups[paper.year]) {
        groups[paper.year] = [];
      }

      groups[paper.year].push(paper);
      return groups;
    },
    {},
  );
  const filteredYears = Object.keys(papersByYear)
    .map(Number)
    .sort((left, right) => right - left);
  const pendingPapers = filteredPapers.filter(
    (paper) => paper.performance.status !== "Completed",
  );
  const topicCounts = buildTopicCounts(filteredPapers);
  const hasActiveFilters = selectedYear !== "all" || selectedPaperId !== "all";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Back to dashboard
            </Link>
            <Link
              href="/manage-papers"
              className="inline-flex items-center rounded-full border border-cyan-600/50 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-400 hover:text-white"
            >
              Manage papers
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center rounded-full border border-cyan-600/50 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-400 hover:text-white"
            >
              Calendar
            </Link>
            <LogoutButton />
            <a
              href="#paper-list"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Browse papers
            </a>
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Subject Tracker
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Completion</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.completionPercent}%
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {summary.completedPapers}/{summary.totalPapers} done
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Pending papers</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.pendingPapers}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Average percentage</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.averagePercentage != null
                    ? `${summary.averagePercentage}%`
                    : "-"}
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

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Filter this subject</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Narrow the tracker by year and then by a specific paper.
                </p>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear("all");
                    setSelectedPaperId("all");
                  }}
                  className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span>Year</span>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                >
                  <option value="all">All years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-200">
                <span>Paper</span>
                <select
                  value={selectedPaperId}
                  onChange={(event) => setSelectedPaperId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                >
                  <option value="all">All papers</option>
                  {paperOptions.map((paper) => (
                    <option key={paper.id} value={paper.id}>
                      {paper.year} | {paper.paperCode} | {paper.assessmentComponent}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Ready to log next
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Jump straight into papers that still need a score.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {pendingPapers.length > 0 ? (
                pendingPapers.slice(0, 6).map((paper) => (
                  <div
                    key={paper.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
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
                      <p className="mt-3 text-lg font-semibold text-white">
                        {paper.paperCode}
                      </p>
                      <p className="text-sm text-slate-300">
                        {paper.assessmentComponent}
                      </p>
                    </div>

                    <Link
                      href={`/subjects/${subject.id}/papers/${paper.id}`}
                      className="inline-flex items-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
                    >
                      Log this paper
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  {filteredPapers.length > 0
                    ? "Every paper in this filtered view is marked completed."
                    : "No papers match the current filters."}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
            <h2 className="text-2xl font-semibold text-white">Review hotspots</h2>
            <p className="mt-1 text-sm text-slate-400">
              Topics that are showing up most often in your notes.
            </p>

            <div className="mt-5 grid gap-3">
              {topicCounts.length > 0 ? (
                topicCounts.map(([topic, count]) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <p className="text-sm text-slate-100">{topic}</p>
                    <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm text-cyan-200">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  {filteredPapers.length > 0
                    ? "No review topics logged yet for this filtered view."
                    : "No papers match the current filters."}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          id="paper-list"
          className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Paper list</h2>
              <p className="mt-1 text-sm text-slate-400">
                Browse by year, then open a single paper page to log or edit it.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredYears.map((year) => (
                <a
                  key={year}
                  href={`#year-${year}`}
                  className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  {year}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {filteredYears.length > 0 ? (
              filteredYears.map((year) => (
                <div key={year} id={`year-${year}`} className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{year}</h3>
                    <p className="text-sm text-slate-400">
                      {papersByYear[year].length} tracked paper
                      {papersByYear[year].length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {papersByYear[year].map((paper) => (
                      <article
                        key={paper.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 xl:flex-row xl:items-center xl:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                              {paper.source}
                            </span>
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
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

                          <div className="mt-3">
                            <p className="text-lg font-semibold text-white">
                              {paper.paperCode}
                            </p>
                            <p className="text-sm text-slate-300">
                              {paper.assessmentComponent}
                            </p>
                          </div>
                        </div>

                        <dl className="grid min-w-full grid-cols-3 gap-3 text-sm md:min-w-[360px] xl:max-w-md">
                          <div className="rounded-2xl bg-slate-900 p-3">
                            <dt className="text-slate-400">Score</dt>
                            <dd className="mt-1 text-base font-semibold text-white">
                              {paper.performance.score ?? "-"}
                            </dd>
                          </div>
                          <div className="rounded-2xl bg-slate-900 p-3">
                            <dt className="text-slate-400">%</dt>
                            <dd className="mt-1 text-base font-semibold text-white">
                              {paper.performance.percentage != null
                                ? `${paper.performance.percentage}%`
                                : "-"}
                            </dd>
                          </div>
                          <div className="rounded-2xl bg-slate-900 p-3">
                            <dt className="text-slate-400">Grade</dt>
                            <dd className="mt-1 text-base font-semibold text-white">
                              {paper.performance.grade ?? "-"}
                            </dd>
                          </div>
                        </dl>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/subjects/${subject.id}/papers/${paper.id}`}
                            className="inline-flex items-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
                          >
                            {paper.performance.status === "Completed"
                              ? "Edit paper"
                              : "Log paper"}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No papers match the current filters.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
