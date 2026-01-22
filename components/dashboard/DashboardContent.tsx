"use client";

import React, { useState, useCallback } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav, type User } from "@/components/dashboard/DashboardNav";

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

  const updateBookmark = useCallback(
    (oldId: string, updates: Partial<BookmarkRow>) => {
      setBookmarks((prev) =>
        prev.map((b) => {
          if (b.id !== oldId) return b;
          const newId = updates.id ?? b.id;
          return { ...b, ...updates, id: newId };
        }),
      );
    },
    [],
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

  // Calculate bookmark counts per group
  const groupCounts = groups.reduce(
    (acc, group) => {
      acc[group.id] = bookmarks.filter((b) => b.group_id === group.id).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <DashboardNav
        user={user}
        groups={groups}
        activeGroupId={activeGroupId}
        groupCounts={groupCounts}
        onGroupSelect={setActiveGroupId}
        onGroupCreated={handleGroupCreated}
        onGroupUpdate={handleUpdateGroup}
        onGroupDelete={handleDeleteGroup}
      />
      <div className="flex flex-col gap-6 px-4 pt-4 md:pt-6">
        {/* Search/Command Bar */}
        <CommandBar
          onAddBookmark={addOptimisticBookmark}
          onUpdateBookmark={updateBookmark}
        />

        {/* Bookmark List Section */}
        <BookmarkBoard
          bookmarks={filteredBookmarks}
          initialGroups={groups}
          onReorder={handleReorder}
          onDeleteBookmark={handleDeleteBookmark}
          onEditBookmark={handleEditBookmark}
        />
      </div>
    </>
  );
}
