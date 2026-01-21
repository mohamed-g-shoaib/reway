"use client";

import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { useState, useCallback } from "react";

interface DashboardContentProps {
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
}

import {
  updateBookmarksOrder,
  deleteBookmark as deleteAction,
} from "@/app/dashboard/actions";

export function DashboardContent({
  initialBookmarks,
  initialGroups,
}: DashboardContentProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>(initialBookmarks);

  const addOptimisticBookmark = useCallback((bookmark: BookmarkRow) => {
    setBookmarks((prev) => [bookmark, ...prev]);
  }, []);

  const updateBookmark = useCallback(
    (oldId: string, updates: Partial<BookmarkRow>) => {
      setBookmarks((prev) => {
        if (updates.id && updates.id !== oldId) {
          return prev.map((b) =>
            b.id === oldId ? { ...b, ...updates, id: updates.id } : b,
          );
        }
        return prev.map((b) => (b.id === oldId ? { ...b, ...updates } : b));
      });
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

  const handleReorder = useCallback(async (newOrder: BookmarkRow[]) => {
    setBookmarks(newOrder);

    // Prepare updates for the DB
    const updates = newOrder.map((bookmark, index) => ({
      id: bookmark.id,
      order_index: index,
    }));

    try {
      await updateBookmarksOrder(updates);
    } catch (error) {
      console.error("Reorder failed:", error);
    }
  }, []);

  return (
    <div className="flex flex-col gap-12">
      {/* Search/Command Bar */}
      <CommandBar
        onAddBookmark={addOptimisticBookmark}
        onUpdateBookmark={updateBookmark}
      />

      {/* Bookmark List Section */}
      <BookmarkBoard
        bookmarks={bookmarks}
        initialGroups={initialGroups}
        onReorder={handleReorder}
        onDeleteBookmark={handleDeleteBookmark}
      />
    </div>
  );
}
