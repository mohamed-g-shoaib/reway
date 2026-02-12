"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";
import type { EnrichmentResult } from "./dashboard-types";

interface UseBookmarkActionsOptions {
  activeGroupId: string;
  initialBookmarks: BookmarkRow[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  sortBookmarks: (items: BookmarkRow[]) => BookmarkRow[];
  updateBookmarksOrder: (
    updates: { id: string; order_index: number }[],
  ) => Promise<void>;
  updateFolderBookmarksOrder: (
    updates: { id: string; folder_order_index: number }[],
  ) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  restoreBookmark: (bookmark: BookmarkRow) => Promise<void>;
  updateBookmark: (
    id: string,
    formData: {
      title: string;
      url: string;
      description?: string;
      group_id?: string | null;
      favicon_url?: string | null;
    },
  ) => Promise<void>;
  lastDeletedRef: React.MutableRefObject<{
    bookmark: BookmarkRow;
    index: number;
  } | null>;
}

export function useBookmarkActions({
  activeGroupId,
  initialBookmarks,
  setBookmarks,
  sortBookmarks,
  updateBookmarksOrder,
  updateFolderBookmarksOrder,
  deleteBookmark,
  restoreBookmark,
  updateBookmark,
  lastDeletedRef,
}: UseBookmarkActionsOptions) {
  const addOptimisticBookmark = useCallback(
    (bookmark: BookmarkRow) => {
      setBookmarks((prev) => {
        const minOrder = prev.reduce((min, item) => {
          const order = item.order_index ?? Number.POSITIVE_INFINITY;
          return order < min ? order : min;
        }, Number.POSITIVE_INFINITY);
        const nextOrder =
          minOrder === Number.POSITIVE_INFINITY ? 0 : minOrder - 1;
        const newBookmark = {
          ...bookmark,
          created_at: bookmark.created_at ?? new Date().toISOString(),
          order_index: bookmark.order_index ?? nextOrder,
          group_id: activeGroupId !== "all" ? activeGroupId : bookmark.group_id,
        };

        const existingIndex = prev.findIndex((item) => item.id === newBookmark.id);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], ...newBookmark };
          return sortBookmarks(next);
        }

        return sortBookmarks([newBookmark, ...prev]);
      });
    },
    [activeGroupId, setBookmarks, sortBookmarks],
  );

  const applyEnrichment = useCallback(
    (id: string, enrichment?: EnrichmentResult) => {
      if (!enrichment) return;
      setBookmarks((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          if (enrichment.status === "failed") {
            return {
              ...item,
              status: "failed",
              is_enriching: false,
              error_reason: enrichment.error_reason ?? "Enrichment failed",
            };
          }
          return {
            ...item,
            title: enrichment.title ?? item.title,
            description: enrichment.description ?? item.description,
            favicon_url: enrichment.favicon_url ?? item.favicon_url,
            og_image_url: enrichment.og_image_url ?? item.og_image_url,
            image_url: enrichment.image_url ?? item.image_url,
            status: "ready",
            is_enriching: false,
            error_reason: null,
            last_fetched_at: enrichment.last_fetched_at ?? item.last_fetched_at,
          };
        }),
      );
    },
    [setBookmarks],
  );

  const replaceBookmarkId = useCallback(
    (stableId: string, actualId: string) => {
      if (!actualId || stableId === actualId) return;
      setBookmarks((prev) =>
        prev.map((item) =>
          item.id === stableId ? { ...item, id: actualId } : item,
        ),
      );
    },
    [setBookmarks],
  );

  const handleFolderReorder = useCallback(
    async (groupId: string, newOrder: BookmarkRow[]) => {
      const orderMap = new Map<string, number>();
      newOrder.forEach((bookmark, index) => {
        orderMap.set(bookmark.id, index);
      });

      setBookmarks((prev) =>
        prev.map((bookmark) => {
          if (!orderMap.has(bookmark.id)) return bookmark;
          return {
            ...bookmark,
            folder_order_index: orderMap.get(bookmark.id) ?? 0,
          };
        }),
      );

      const updates = newOrder.map((bookmark, index) => ({
        id: bookmark.id,
        folder_order_index: index,
      }));

      try {
        await updateFolderBookmarksOrder(updates);
      } catch (error) {
        console.error("Reorder failed:", error);
        toast.error("Failed to reorder bookmarks");
        setBookmarks(initialBookmarks);
      }
    },
    [initialBookmarks, setBookmarks, updateFolderBookmarksOrder],
  );

  const handleDeleteBookmark = useCallback(
    async (id: string) => {
      let deletedBookmark: BookmarkRow | undefined;
      let deletedIndex = -1;

      setBookmarks((prev) => {
        deletedIndex = prev.findIndex((b) => b.id === id);
        deletedBookmark = prev[deletedIndex];
        if (deletedBookmark) {
          lastDeletedRef.current = {
            bookmark: deletedBookmark,
            index: deletedIndex,
          };
        }
        return prev.filter((b) => b.id !== id);
      });

      if (deletedBookmark) {
        toast.error("Bookmark deleted", {
          action: {
            label: "Undo",
            onClick: async () => {
              const lastDeleted = lastDeletedRef.current;
              if (!lastDeleted) return;
              setBookmarks((prev) => {
                if (prev.some((b) => b.id === lastDeleted.bookmark.id)) {
                  return prev;
                }
                const next = [...prev];
                next.splice(
                  Math.min(lastDeleted.index, next.length),
                  0,
                  lastDeleted.bookmark,
                );
                return next;
              });
              try {
                await restoreBookmark(lastDeleted.bookmark);
              } catch (error) {
                console.error("Restore failed:", error);
                toast.error("Failed to restore bookmark");
              }
            },
          },
        });
      }

      try {
        await deleteBookmark(id);
      } catch (error) {
        console.error("Delete failed:", error);
        setBookmarks((prev) => {
          const deletedFromInitial = initialBookmarks.find((b) => b.id === id);
          return deletedFromInitial ? [...prev, deletedFromInitial] : prev;
        });
        toast.error("Failed to delete bookmark");
      }
    },
    [
      deleteBookmark,
      initialBookmarks,
      lastDeletedRef,
      restoreBookmark,
      setBookmarks,
    ],
  );

  const handleReorder = useCallback(
    async (newOrder: BookmarkRow[]) => {
      setBookmarks((prev) => {
        const updatedOrder = newOrder.map((bookmark, index) => ({
          ...bookmark,
          order_index: index,
        }));
        const otherBookmarks = prev.filter((b) =>
          activeGroupId === "all" ? false : b.group_id !== activeGroupId,
        );
        return [...updatedOrder, ...otherBookmarks];
      });

      const updates = newOrder.map((bookmark, index) => ({
        id: bookmark.id,
        order_index: index,
      }));

      try {
        await updateBookmarksOrder(updates);
      } catch (error) {
        console.error("Reorder failed:", error);
        toast.error("Failed to reorder bookmarks");
        setBookmarks(initialBookmarks);
      }
    },
    [activeGroupId, initialBookmarks, setBookmarks, updateBookmarksOrder],
  );

  const handleEditBookmark = useCallback(
    async (
      id: string,
      data: {
        title: string;
        url: string;
        description?: string;
        favicon_url?: string;
        group_id?: string;
      },
    ) => {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                title: data.title,
                url: data.url,
                description: data.description ?? null,
                favicon_url: data.favicon_url ?? null,
                group_id: data.group_id ?? null,
              }
            : b,
        ),
      );

      try {
        await updateBookmark(id, {
          title: data.title,
          url: data.url,
          description: data.description,
          group_id: data.group_id || null,
          favicon_url: data.favicon_url ?? null,
        });
      } catch (error) {
        console.error("Update bookmark failed:", error);
        toast.error("Failed to update bookmark");
        setBookmarks((prev) =>
          prev.map((b) => {
            if (b.id === id) {
              const originalBookmark = initialBookmarks.find(
                (ob) => ob.id === id,
              );
              return originalBookmark || b;
            }
            return b;
          }),
        );
      }
    },
    [initialBookmarks, setBookmarks, updateBookmark],
  );

  return {
    addOptimisticBookmark,
    applyEnrichment,
    replaceBookmarkId,
    handleFolderReorder,
    handleDeleteBookmark,
    handleReorder,
    handleEditBookmark,
  };
}
