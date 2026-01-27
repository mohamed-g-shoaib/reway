"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav, type User } from "@/components/dashboard/DashboardNav";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

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
  const isMac = useMemo(
    () =>
      typeof window !== "undefined" &&
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
    [],
  );

  // Sync state with server props when they change (e.g. after revalidatePath)
  React.useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  React.useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

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
      // Optional: restore bookmarks if delete fails
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
      }
    },
    [activeGroupId],
  );

  // Filter bookmarks based on active group
  const filteredBookmarks = bookmarks.filter((b) =>
    activeGroupId === "all" ? true : b.group_id === activeGroupId,
  );

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
      <div className="flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
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
          />
          <div className="pt-4 md:pt-6">
            <CommandBar onAddBookmark={addOptimisticBookmark} />
          </div>

          {/* Table Header - Fixed */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-8 pb-5 text-[11px] font-bold tracking-widest text-muted-foreground/70 uppercase">
            <span>Title</span>

            {/* Keyboard Shortcut Guide - Centered */}
            <div className="flex items-center gap-6 text-[11px] normal-case font-medium text-muted-foreground/50">
              <div className="flex items-center gap-1.5">
                <KbdGroup className="gap-0.5">
                  <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                    ↑
                  </Kbd>
                  <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                    ↓
                  </Kbd>
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

            <span className="text-right uppercase">
              {rowContent === "group" ? "Group" : "Created At"}
            </span>
          </div>
        </div>

        {/* Scrollable Bookmarks Section */}
        <div className="flex-1 overflow-y-auto min-h-0 px-1 pt-3 md:pt-2 pb-6 scrollbar-hover-only">
          <div>
            <BookmarkBoard
              bookmarks={filteredBookmarks}
              initialGroups={groups}
              onReorder={handleReorder}
              onDeleteBookmark={handleDeleteBookmark}
              onEditBookmark={handleEditBookmark}
              rowContent={rowContent}
            />
          </div>
        </div>
      </div>
    </>
  );
}
