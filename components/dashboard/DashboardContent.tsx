"use client";

import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { useState, useCallback } from "react";

interface DashboardContentProps {
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
}

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
        // If the update includes an ID change (temp -> real), handle specially
        if (updates.id && updates.id !== oldId) {
          return prev.map((b) =>
            b.id === oldId ? { ...b, ...updates, id: updates.id } : b,
          );
        }
        // Normal update
        return prev.map((b) => (b.id === oldId ? { ...b, ...updates } : b));
      });
    },
    [],
  );

  const handleReorder = useCallback((newOrder: BookmarkRow[]) => {
    setBookmarks(newOrder);
    // TODO: Trigger server saving
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
      />
    </div>
  );
}
