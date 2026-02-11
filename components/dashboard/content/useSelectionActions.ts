"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";
import { EXTENSION_DOWNLOAD_URL } from "@/lib/extension";

type ExtensionResponsePayload = {
  ok: boolean;
  count?: number;
  error?: string;
};

type ExtensionResponse = {
  type: "reway_open_group_response";
  requestId: string;
  response?: ExtensionResponsePayload | null;
};

function isExtensionResponse(data: unknown): data is ExtensionResponse {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === "reway_open_group_response" && typeof d.requestId === "string"
  );
}

interface UseSelectionActionsOptions {
  bookmarks: BookmarkRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectionMode: (value: boolean) => void;
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
  setBookmarks,
  initialBookmarks,
  deleteBookmark,
  restoreBookmark,
  lastBulkDeletedRef,
}: UseSelectionActionsOptions) {
  const pendingRequestsRef = useRef(
    new Map<string, (response: ExtensionResponsePayload | null) => void>(),
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!isExtensionResponse(data)) return;

      const resolver = pendingRequestsRef.current.get(data.requestId);
      if (!resolver) return;

      pendingRequestsRef.current.delete(data.requestId);
      resolver(data.response ?? null);
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

    const urls = selectedBookmarks
      .map((bookmark) => bookmark.url)
      .filter(Boolean);
    if (urls.length === 0) return;

    const requestId = crypto.randomUUID();
    const responsePromise = new Promise<ExtensionResponsePayload | null>(
      (resolve) => {
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
      },
    );

    (async () => {
      const response = await responsePromise;
      if (response?.ok) {
        toast.success(
          `Opened ${response.count ?? urls.length} tabs via extension`,
        );
      } else {
        // If extension responded but with error, log it
        if (response && !response.ok) {
          console.warn("Extension error:", response.error);
        }

        // Popup fallback: open all tabs immediately to avoid popup blocker
        urls.forEach((url) => {
          window.open(url, "_blank", "noopener,noreferrer");
        });

        // Only show extension prompt if extension didn't respond at all
        if (response === null) {
          toast.error(
            "Popups blocked. Allow popups or install the Reway extension to open all tabs.",
            {
              action: {
                label: "Download extension",
                onClick: () => {
                  window.open(
                    EXTENSION_DOWNLOAD_URL,
                    "_blank",
                    "noopener,noreferrer",
                  );
                },
              },
            },
          );
        }
      }

      setSelectionMode(false);
      setSelectedIds(new Set());
    })();
  }, [bookmarks, selectedIds, setSelectedIds, setSelectionMode]);

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
