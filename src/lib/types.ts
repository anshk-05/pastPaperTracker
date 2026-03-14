export type PaperStatus = "Not Started" | "Completed";

export interface PaperPerformance {
  status: PaperStatus;
  score?: number;
  percentage?: number;
  grade?: string;
  topicsForImprovement: string[];
  notes?: string;
  updatedAt?: string;
}

export interface Paper {
  id: string;
  year: number;
  series: string;
  seriesLabel: string;
  paperCode: string;
  assessmentComponent: string;
  performance: PaperPerformance;
}

export interface Subject {
  id: string;
  name: string;
  catalogLabel: string;
  examBoard: string;
  specificationCode: string;
  tier?: string;
  route?: string;
  targetSeries: string;
  papers: Paper[];
}

export interface LocalDatabase {
  targetSeries: string;
  subjects: Subject[];
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  specificationLabel: string;
  latestSeriesLabel: string;
  completedPapers: number;
  totalPapers: number;
  completionPercent: number;
  pendingPapers: number;
  reviewItemCount: number;
  latestReviewTopics: string[];
}
