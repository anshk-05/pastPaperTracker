import { LogoutButton } from "@/components/auth/logout-button";
import { CalendarPlanner } from "@/components/calendar/calendar-planner";
import { loadTrackerSnapshot } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const snapshot = await loadTrackerSnapshot();

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl justify-end px-4 pt-6 sm:px-6 lg:px-8">
        <LogoutButton />
      </div>
      <CalendarPlanner
        subjects={snapshot.database.subjects}
        studySessions={snapshot.studySessions}
      />
    </>
  );
}
