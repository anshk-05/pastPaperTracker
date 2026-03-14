import { notFound } from "next/navigation";
import { SubjectPaperCatalog } from "@/components/subjects/subject-paper-catalog";
import { getSubjectById } from "@/lib/db/storage";

type SubjectPageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;
  const subject = await getSubjectById(subjectId);

  if (!subject) {
    notFound();
  }

  return <SubjectPaperCatalog subject={subject} />;
}
