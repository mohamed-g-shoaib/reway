import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { getUser } from "./layout";
import { getBookmarks, getGroups } from "@/lib/supabase/queries";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cookies } from "next/headers";

export const metadata = {
  title: "Dashboard",
  description: "Organize and search your bookmarks with Reway.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const cookieStore = await cookies();

  // Helper to safely parse and validate cookie values
  const parseViewMode = (value: string | undefined) => {
    if (value && ["list", "card", "icon", "folders"].includes(value)) {
      return value as "list" | "card" | "icon" | "folders";
    }
    return "list";
  };

  const parseRowContent = (value: string | undefined) => {
    if (value && ["date", "group"].includes(value)) {
      return value as "date" | "group";
    }
    return "date";
  };

  const parseCommandMode = (value: string | undefined) => {
    if (value && ["add", "search"].includes(value)) {
      return value as "add" | "search";
    }
    return "add";
  };

  // Read and validate dashboard preferences from cookies
  const viewModeAll = parseViewMode(
    cookieStore.get("reway.dashboard.viewMode.all")?.value,
  );
  const viewModeGroups = parseViewMode(
    cookieStore.get("reway.dashboard.viewMode.groups")?.value,
  );
  const rowContent = parseRowContent(
    cookieStore.get("reway.dashboard.rowContent")?.value,
  );
  const commandMode = parseCommandMode(
    cookieStore.get("reway.dashboard.commandMode")?.value,
  );

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
            initialViewModeAll={viewModeAll}
            initialViewModeGroups={viewModeGroups}
            initialRowContent={rowContent}
            initialCommandMode={commandMode}
          />
        </main>

        <MobileNav />
      </div>
    </ErrorBoundary>
  );
}
