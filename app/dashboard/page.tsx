import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { getUser } from "./layout";
import { getBookmarks, getGroups } from "@/lib/supabase/queries";

export const metadata = {
  title: "Dashboard | Reway",
  description: "Organize and search your bookmarks with Reway.",
};

export default async function DashboardPage() {
  const [user, bookmarks, groups] = await Promise.all([
    getUser(),
    getBookmarks(),
    getGroups(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <DashboardNav user={user} />

      {/* Main Content - Global width container */}
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-16">
        <DashboardContent initialBookmarks={bookmarks} initialGroups={groups} />
      </main>

      <MobileNav />
    </div>
  );
}
