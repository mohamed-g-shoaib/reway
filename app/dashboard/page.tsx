import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { getUser } from "./layout";
import { getBookmarks, getGroups } from "@/lib/supabase/queries";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata = {
  title: "Dashboard",
  description: "Organize and search your bookmarks with Reway.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const [user, bookmarks, groups] = await Promise.all([
    getUser(),
    getBookmarks(),
    getGroups(),
  ]).catch((error) => {
    console.error("Failed to load dashboard:", error);
    throw error;
  });

  return (
    <ErrorBoundary>
      <div className="h-dvh overflow-hidden bg-background text-foreground">
        <main className="mx-auto w-full max-w-3xl px-4 py-6">
          <DashboardContent
            user={user}
            initialBookmarks={bookmarks}
            initialGroups={groups}
          />
        </main>

        <MobileNav />
      </div>
    </ErrorBoundary>
  );
}
