import { notFound } from "next/navigation";
import { SubjectTracker } from "@/components/tracker/subject-tracker";
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

  return <SubjectTracker subject={subject} />;
}
