export type PaperStatus = "Not Started" | "Completed";
export type PaperSource = "catalog" | "custom";

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
  source: PaperSource;
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

export interface CustomPaper extends Paper {
  subjectId: string;
}

export interface RemovedPaper {
  subjectId: string;
  subjectName: string;
  paper: Paper;
}

export interface TrackerState {
  progressByPaperId: Record<string, PaperPerformance>;
  removedPaperIds: string[];
  customPapers: CustomPaper[];
}

export interface TrackerSnapshot {
  database: LocalDatabase;
  removedPapers: RemovedPaper[];
}

export interface PaperFormValues {
  status: PaperStatus;
  score?: number;
  percentage?: number;
  grade?: string;
  topicsForImprovement: string[];
  notes?: string;
}

export interface CreatePaperInput {
  subjectId: string;
  year: number;
  series: string;
  paperCode: string;
  assessmentComponent: string;
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
