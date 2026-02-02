"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";

interface UseSelectionActionsOptions {
  bookmarks: BookmarkRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectionMode: (value: boolean) => void;
  bulkDeleteConfirm: boolean;
  setBulkDeleteConfirm: (value: boolean) => void;
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  initialBookmarks: BookmarkRow[];
  deleteBookmark: (id: string) => Promise<void>;
  restoreBookmark: (bookmark: BookmarkRow) => Promise<void>;
  lastBulkDeletedRef: React.MutableRefObject<
    { bookmark: BookmarkRow; index: number }[]
  >;
}

export function useSelectionActions({
  bookmarks,
  selectedIds,
  setSelectedIds,
  setSelectionMode,
  bulkDeleteConfirm,
  setBulkDeleteConfirm,
  setBookmarks,
  initialBookmarks,
  deleteBookmark,
  restoreBookmark,
  lastBulkDeletedRef,
}: UseSelectionActionsOptions) {
  const handleToggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        if (next.size === 0) {
          setSelectionMode(false);
        }
        return next;
      });
    },
    [setSelectedIds, setSelectionMode],
  );

  useEffect(() => {
    if (!bulkDeleteConfirm) return;
    const timeout = window.setTimeout(() => {
      setBulkDeleteConfirm(false);
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [bulkDeleteConfirm, setBulkDeleteConfirm]);

  const handleOpenSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selectedBookmarks = bookmarks.filter((b) => selectedIds.has(b.id));
    selectedBookmarks.forEach((bookmark) => {
      window.open(bookmark.url, "_blank", "noopener,noreferrer");
    });
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [bookmarks, selectedIds, setSelectedIds, setSelectionMode]);

  const handleBulkDelete = useCallback(async () => {
    if (!bulkDeleteConfirm) {
      setBulkDeleteConfirm(true);
      return;
    }

    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    const deletedBookmarks = bookmarks
      .map((bookmark, index) => ({ bookmark, index }))
      .filter(({ bookmark }) => selectedIds.has(bookmark.id));

    lastBulkDeletedRef.current = deletedBookmarks;

    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setSelectionMode(false);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);

    try {
      await Promise.all(idsToDelete.map((id) => deleteBookmark(id)));
      toast.error(`Bookmark${idsToDelete.length > 1 ? "s" : ""} deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const toRestore = lastBulkDeletedRef.current;
            if (toRestore.length === 0) return;
            setBookmarks((prev) => {
              const next = [...prev];
              const sorted = toRestore.toSorted((a, b) => a.index - b.index);
              sorted.forEach(({ bookmark, index }) => {
                if (next.some((b) => b.id === bookmark.id)) return;
                next.splice(Math.min(index, next.length), 0, bookmark);
              });
              return next;
            });
            try {
              await Promise.all(
                toRestore.map(({ bookmark }) => restoreBookmark(bookmark)),
              );
            } catch (error) {
              console.error("Restore failed:", error);
              toast.error("Failed to restore bookmarks");
            }
          },
        },
      });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete some bookmarks");
      setBookmarks(initialBookmarks);
    }
  }, [
    bookmarks,
    bulkDeleteConfirm,
    deleteBookmark,
    initialBookmarks,
    lastBulkDeletedRef,
    restoreBookmark,
    selectedIds,
    setBookmarks,
    setBulkDeleteConfirm,
    setSelectedIds,
    setSelectionMode,
  ]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [setSelectedIds, setSelectionMode]);

  return {
    handleToggleSelection,
    handleOpenSelected,
    handleBulkDelete,
    handleCancelSelection,
  };
}
