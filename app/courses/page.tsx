import { Sidebar } from "@/components/dashboard/sidebar";
import { getCourses } from "@/app/actions/course";
import { CoursePageClient } from "./CoursePageClient";

export default async function CoursesPage() {
  const result = await getCourses();

  if (!result.success) {
    // 에러 발생 시 처리 (단순 안내 또는 리다이렉트)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-bold">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <CoursePageClient initialCourses={result.data || []} />
    </div>
  );
}
