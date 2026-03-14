import { notFound } from "next/navigation";
import { SubjectPaperCatalog } from "@/components/subjects/subject-paper-catalog";
import { getSubjectById, seedDatabase } from "@/lib/db/seed";

type SubjectPageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

export function generateStaticParams() {
  return seedDatabase.subjects.map((subject) => ({
    subjectId: subject.id,
  }));
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;
  const subject = getSubjectById(subjectId);

  if (!subject) {
    notFound();
  }

  return <SubjectPaperCatalog subject={subject} />;
}
