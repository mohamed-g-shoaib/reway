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
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <DashboardContent
          user={user}
          initialBookmarks={bookmarks}
          initialGroups={groups}
        />
      </main>

      <MobileNav />
    </div>
  );
}
