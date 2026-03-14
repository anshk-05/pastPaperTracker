import {
  LocalDatabase,
  Paper,
  Subject,
  SubjectProgress,
  SubjectTrackerSummary,
} from "@/lib/types";

export type { LocalDatabase, Paper, Subject, SubjectProgress };

export interface ReviewTopicGroup {
  subjectId: string;
  subjectName: string;
  topics: string[];
}

export function buildSubjectProgress(subject: Subject): SubjectProgress {
  const completedPapers = subject.papers.filter(
    (paper) => paper.performance.status === "Completed",
  ).length;
  const reviewTopics = subject.papers.flatMap(
    (paper) => paper.performance.topicsForImprovement,
  );

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    specificationLabel: `${subject.examBoard} ${subject.specificationCode}`,
    latestSeriesLabel: subject.papers[0]?.seriesLabel ?? "No papers loaded",
    completedPapers,
    totalPapers: subject.papers.length,
    completionPercent:
      subject.papers.length === 0
        ? 0
        : Math.round((completedPapers / subject.papers.length) * 100),
    pendingPapers: subject.papers.length - completedPapers,
    reviewItemCount: reviewTopics.length,
    latestReviewTopics: reviewTopics.slice(0, 3),
  };
}

export function buildReviewTopicGroups(
  database: LocalDatabase,
): ReviewTopicGroup[] {
  return database.subjects
    .map((subject) => ({
      subjectId: subject.id,
      subjectName: subject.name,
      topics: subject.papers.flatMap(
        (paper) => paper.performance.topicsForImprovement,
      ),
    }))
    .filter((group) => group.topics.length > 0);
}

export function buildSubjectTrackerSummary(
  subject: Subject,
): SubjectTrackerSummary {
  const completedPapers = subject.papers.filter(
    (paper) => paper.performance.status === "Completed",
  );
  const percentages = completedPapers
    .map((paper) => paper.performance.percentage)
    .filter((value): value is number => value != null);
  const reviewTopics = subject.papers.flatMap(
    (paper) => paper.performance.topicsForImprovement,
  );

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    completedPapers: completedPapers.length,
    pendingPapers: subject.papers.length - completedPapers.length,
    totalPapers: subject.papers.length,
    completionPercent:
      subject.papers.length === 0
        ? 0
        : Math.round((completedPapers.length / subject.papers.length) * 100),
    averagePercentage:
      percentages.length > 0
        ? Math.round(
            percentages.reduce((sum, value) => sum + value, 0) /
              percentages.length,
          )
        : undefined,
    reviewItemCount: reviewTopics.length,
    pendingPaperIds: subject.papers
      .filter((paper) => paper.performance.status !== "Completed")
      .map((paper) => paper.id),
    reviewTopics,
  };
}
