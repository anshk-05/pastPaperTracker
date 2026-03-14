import { LocalDatabase, Paper, Subject, SubjectProgress } from "@/lib/types";

export type { LocalDatabase, Paper, Subject, SubjectProgress };

export interface ReviewTopicGroup {
  subjectId: string;
  subjectName: string;
  topics: string[];
}

export function buildSubjectProgress(subject: Subject): SubjectProgress {
  const completedPapers = subject.papers.filter(
    (paper) => paper.status === "Completed",
  ).length;
  const reviewTopics = subject.papers.flatMap((paper) => paper.reviewTopics);

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    specificationLabel: `${subject.examBoard} ${subject.specificationCode}`,
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
      topics: subject.papers.flatMap((paper) => paper.reviewTopics),
    }))
    .filter((group) => group.topics.length > 0);
}
