"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";

interface UseSelectionActionsOptions {
  bookmarks: BookmarkRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectionMode: (value: boolean) => void;
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  initialBookmarks: BookmarkRow[];
  deleteBookmark: (id: string) => Promise<void>;
  restoreBookmark: (bookmark: BookmarkRow) => Promise<void>;
  extensionStoreUrl?: string;
  lastBulkDeletedRef: React.MutableRefObject<
    { bookmark: BookmarkRow; index: number }[]
  >;
}

export function useSelectionActions({
  bookmarks,
  selectedIds,
  setSelectedIds,
  setSelectionMode,
  setBookmarks,
  initialBookmarks,
  deleteBookmark,
  restoreBookmark,
  extensionStoreUrl,
  lastBulkDeletedRef,
}: UseSelectionActionsOptions) {
  const pendingRequestsRef = useRef(
    new Map<
      string,
      (response: { ok: boolean; count?: number; error?: string } | null) => void
    >(),
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if ((event as any)?.data?.type !== "reway_open_group_response") return;
      const requestId = (event as any).data.requestId as string | undefined;
      if (!requestId) return;
      const resolver = pendingRequestsRef.current.get(requestId);
      if (!resolver) return;
      pendingRequestsRef.current.delete(requestId);
      resolver((event as any).data.response ?? null);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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

  const handleOpenSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selectedBookmarks = bookmarks.filter((b) => selectedIds.has(b.id));

    if (
      selectedBookmarks.length > 5 &&
      !window.confirm(
        `Open ${selectedBookmarks.length} tabs? Your browser may block popups.`,
      )
    ) {
      return;
    }

    const urls = selectedBookmarks.map((bookmark) => bookmark.url).filter(Boolean);
    if (urls.length === 0) return;

    const requestId = crypto.randomUUID();
    const responsePromise = new Promise<{
      ok: boolean;
      count?: number;
      error?: string;
    } | null>((resolve) => {
      const timer = window.setTimeout(() => {
        pendingRequestsRef.current.delete(requestId);
        resolve(null);
      }, 250);

      pendingRequestsRef.current.set(requestId, (payload) => {
        window.clearTimeout(timer);
        resolve(payload ?? null);
      });

      window.postMessage(
        { type: "reway_open_group", requestId, groupId: "selected", urls },
        "*",
      );
    });

    (async () => {
      const response = await responsePromise;
      if (response?.ok) {
        toast.success(`Opened ${response.count ?? urls.length} tabs via extension`);
      } else {
        // Popup fallback: stagger opens to improve success rate across browsers.
        urls.forEach((url, index) => {
          window.setTimeout(() => {
            window.open(url, "_blank", "noopener,noreferrer");
          }, index * 100);
        });

        if (extensionStoreUrl) {
          toast.error("Install the Reway extension for instant open-all", {
            action: {
              label: "Get extension",
              onClick: () => window.open(extensionStoreUrl, "_blank"),
            },
          });
        }
      }

      setSelectionMode(false);
      setSelectedIds(new Set());
    })();
  }, [bookmarks, extensionStoreUrl, selectedIds, setSelectedIds, setSelectionMode]);

  const handleBulkDelete = useCallback(async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    const deletedBookmarks = bookmarks
      .map((bookmark, index) => ({ bookmark, index }))
      .filter(({ bookmark }) => selectedIds.has(bookmark.id));

    lastBulkDeletedRef.current = deletedBookmarks;

    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setSelectionMode(false);
    setSelectedIds(new Set());

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
    deleteBookmark,
    initialBookmarks,
    lastBulkDeletedRef,
    restoreBookmark,
    selectedIds,
    setBookmarks,
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
