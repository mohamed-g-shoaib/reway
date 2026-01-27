"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav, type User } from "@/components/dashboard/DashboardNav";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useIsMac } from "@/hooks/useIsMac";
import { toast } from "sonner";

interface DashboardContentProps {
  user: User;
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
}

import {
  updateBookmarksOrder,
  deleteBookmark as deleteAction,
  updateBookmark as updateBookmarkAction,
  updateGroup as updateGroupAction,
  deleteGroup as deleteGroupAction,
} from "@/app/dashboard/actions";

export function DashboardContent({
  user,
  initialBookmarks,
  initialGroups,
}: DashboardContentProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>(initialBookmarks);
  const [groups, setGroups] = useState<GroupRow[]>(initialGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [rowContent, setRowContent] = useState<"date" | "group">("date");
  const [viewMode, setViewMode] = useState<"list" | "card" | "icon">("list");
  const isMac = useIsMac();

  // Sync state with server props when they change (e.g. after revalidatePath)
  // Use useCallback to prevent unnecessary re-renders
  const syncBookmarks = React.useCallback(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  const syncGroups = React.useCallback(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  React.useEffect(syncBookmarks, [syncBookmarks]);
  React.useEffect(syncGroups, [syncGroups]);

  const addOptimisticBookmark = useCallback(
    (bookmark: BookmarkRow) => {
      // If we're in a specific group, ensure the new bookmark gets that group_id
      const newBookmark = {
        ...bookmark,
        group_id: activeGroupId !== "all" ? activeGroupId : bookmark.group_id,
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    },
    [activeGroupId],
  );

  const handleDeleteBookmark = useCallback(async (id: string) => {
    // Optimistic delete
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteAction(id);
    } catch (error) {
      console.error("Delete failed:", error);
      // Restore bookmark if delete failed
      setBookmarks((prev) => {
        const deletedBookmark = initialBookmarks.find((b) => b.id === id);
        return deletedBookmark ? [...prev, deletedBookmark] : prev;
      });
      // Show error to user
      toast.error("Failed to delete bookmark");
    }
  }, []);

  const handleReorder = useCallback(
    async (newOrder: BookmarkRow[]) => {
      // When reordering, we need to merge the new order back into the global bookmarks list
      // while maintaining bookmarks that aren't currently visible (if filtering)
      setBookmarks((prev) => {
        const otherBookmarks = prev.filter((b) =>
          activeGroupId === "all" ? false : b.group_id !== activeGroupId,
        );
        return [...newOrder, ...otherBookmarks];
      });

      // Prepare updates for the DB (only for those in the current view)
      const updates = newOrder.map((bookmark, index) => ({
        id: bookmark.id,
        order_index: index,
      }));

      try {
        await updateBookmarksOrder(updates);
      } catch (error) {
        console.error("Reorder failed:", error);
        toast.error("Failed to reorder bookmarks");
        // Restore original order by re-fetching or reverting
        setBookmarks(initialBookmarks);
      }
    },
    [activeGroupId],
  );

  // Filter bookmarks based on active group - memoized to prevent unnecessary re-renders
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) =>
      activeGroupId === "all" ? true : b.group_id === activeGroupId,
    );
  }, [bookmarks, activeGroupId]);


  const handleGroupCreated = useCallback(
    (id: string, name: string, icon: string) => {
      const newGroup: GroupRow = {
        id,
        name,
        icon,
        user_id: user.id,
        created_at: new Date().toISOString(),
        color: null,
        order_index: null,
      };
      setGroups((prev) => [...prev, newGroup]);
      setActiveGroupId(id);
    },
    [user.id],
  );

  const handleUpdateGroup = useCallback(
    async (id: string, name: string, icon: string) => {
      // Optimistic update
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, name, icon } : g)),
      );
      try {
        await updateGroupAction(id, { name, icon });
      } catch (error) {
        console.error("Update group failed:", error);
        toast.error("Failed to update group");
        // Revert optimistic update
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? groups.find((og) => og.id === id) || g : g)),
        );
      }
    },
    [],
  );

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      // Optimistic delete
      setGroups((prev) => prev.filter((g) => g.id !== id));
      if (activeGroupId === id) {
        setActiveGroupId("all");
      }
      try {
        await deleteGroupAction(id);
      } catch (error) {
        console.error("Delete group failed:", error);
        toast.error("Failed to delete group");
        // Restore group if delete failed
        setGroups((prev) => {
          const deletedGroup = initialGroups.find((g) => g.id === id);
          return deletedGroup ? [...prev, deletedGroup] : prev;
        });
      }
    },
    [activeGroupId],
  );

  const handleEditBookmark = useCallback(
    async (
      id: string,
      data: {
        title: string;
        url: string;
        description?: string;
        group_id?: string;
      },
    ) => {
      // Optimistic update
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                title: data.title,
                url: data.url,
                description: data.description ?? null,
                group_id: data.group_id ?? null,
              }
            : b,
        ),
      );

      try {
        await updateBookmarkAction(id, {
          title: data.title,
          url: data.url,
          description: data.description,
          group_id: data.group_id || null,
        });
      } catch (error) {
        console.error("Update bookmark failed:", error);
        toast.error("Failed to update bookmark");
        // Revert optimistic update
        setBookmarks((prev) =>
          prev.map((b) => {
            if (b.id === id) {
              const originalBookmark = initialBookmarks.find((ob) => ob.id === id);
              return originalBookmark || b;
            }
            return b;
          }),
        );
      }
    },
    [],
  );

  // Calculate bookmark counts per group (O(N) single-pass)
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookmarks) {
      if (b.group_id) {
        counts[b.group_id] = (counts[b.group_id] || 0) + 1;
      }
    }
    return counts;
  }, [bookmarks]);

  return (
    <>
      <div className="relative flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
        <aside className="hidden lg:flex fixed left-6 top-28 z-30 flex-col gap-2 text-sm text-muted-foreground/70">
          <button
            type="button"
            onClick={() => setActiveGroupId("all")}
            className={`group flex items-center gap-3 px-2 py-1.5 transition-colors ${
              activeGroupId === "all"
                ? "text-foreground font-semibold"
                : "hover:text-foreground/80"
            }`}
          >
            <span className={`h-px transition-all duration-300 ease-out ${
              activeGroupId === "all" ? "w-12 opacity-80" : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
            } bg-current`} />
            <span>All Bookmarks</span>
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupId(group.id)}
              className={`group flex items-center gap-3 px-2 py-1.5 transition-colors ${
                activeGroupId === group.id
                  ? "text-foreground font-semibold"
                  : "hover:text-foreground/80"
              }`}
            >
              <span className={`h-px transition-all duration-300 ease-out ${
                activeGroupId === group.id ? "w-12 opacity-80" : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
              } bg-current`} />
              <span className="truncate max-w-40">{group.name}</span>
            </button>
          ))}
        </aside>
        {/* Fixed Header Section */}
        <div className="flex-none z-40 bg-background/80 backdrop-blur-xl px-1">
          <DashboardNav
            user={user}
            groups={groups}
            activeGroupId={activeGroupId}
            groupCounts={groupCounts}
            onGroupSelect={setActiveGroupId}
            onGroupCreated={handleGroupCreated}
            onGroupUpdate={handleUpdateGroup}
            onGroupDelete={handleDeleteGroup}
            rowContent={rowContent}
            setRowContent={setRowContent}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
          <div className="pt-4 md:pt-6">
            <CommandBar onAddBookmark={addOptimisticBookmark} />
          </div>

          {/* Table Header - Fixed (List view only) */}
          <div className="hidden md:flex items-center gap-6 px-5 pt-6 pb-3 text-[11px] font-medium text-muted-foreground/50">
            <div className="flex items-center gap-1.5">
              <KbdGroup className="gap-0.5">
                {viewMode !== "list" ? (
                  <>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ←
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↑
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↓
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      →
                    </Kbd>
                  </>
                ) : (
                  <>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↑
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↓
                    </Kbd>
                  </>
                )}
              </KbdGroup>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1.5">
                Space
              </Kbd>
              <span>preview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KbdGroup className="gap-0.5">
                <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1.5">
                  {isMac ? "⌘" : "Ctrl"}
                </Kbd>
                <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                  ⏎
                </Kbd>
              </KbdGroup>
              <span>open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                ⏎
              </Kbd>
              <span>copy</span>
            </div>
          </div>
        </div>

        {/* Scrollable Bookmarks Section */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto min-h-0 px-1 pt-3 md:pt-2 pb-6 scrollbar-hover-only">
            <div>
              <BookmarkBoard
                bookmarks={filteredBookmarks}
                initialGroups={groups}
                onReorder={handleReorder}
                onDeleteBookmark={handleDeleteBookmark}
                onEditBookmark={handleEditBookmark}
                rowContent={rowContent}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
