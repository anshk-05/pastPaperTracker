export type PaperStatus = "Not Started" | "Completed";

export interface Paper {
  id: string;
  paperCode: string;
  paperName: string;
  assessmentWindow: string;
  status: PaperStatus;
  score?: number;
  maxScore?: number;
  grade?: string;
  reviewTopics: string[];
  notes?: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
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
  completedPapers: number;
  totalPapers: number;
  completionPercent: number;
  pendingPapers: number;
  reviewItemCount: number;
  latestReviewTopics: string[];
}
