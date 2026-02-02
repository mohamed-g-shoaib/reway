"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";
import { useGlobalEvent } from "@/hooks/useGlobalEvent";

interface UseOpenGroupOptions {
  bookmarks: BookmarkRow[];
  deferredSearchQuery: string;
  extensionStoreUrl: string;
}

export function useOpenGroup({
  bookmarks,
  deferredSearchQuery,
  extensionStoreUrl,
}: UseOpenGroupOptions) {
  const pendingRequestsRef = useRef(
    new Map<
      string,
      (response: { ok: boolean; count?: number; error?: string } | null) => void
    >(),
  );

  useGlobalEvent("message", (event) => {
    if (event?.data?.type !== "reway_open_group_response") return;
    const requestId = event.data.requestId as string | undefined;
    if (!requestId) return;
    const resolver = pendingRequestsRef.current.get(requestId);
    if (!resolver) return;
    pendingRequestsRef.current.delete(requestId);
    resolver(event.data.response ?? null);
  });

  const handleOpenGroup = useCallback(
    async (groupId: string) => {
      const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
      const targetBookmarks = bookmarks.filter((bookmark) => {
        const matchesGroup =
          groupId === "all" ? true : bookmark.group_id === groupId;
        if (!matchesGroup) return false;
        if (!normalizedQuery) return true;
        const haystack = [bookmark.title, bookmark.url, bookmark.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      if (targetBookmarks.length === 0) return;
      const urls = targetBookmarks
        .map((bookmark) => bookmark.url)
        .filter(Boolean);

      const requestId = crypto.randomUUID();
      const response = await new Promise<{
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
          { type: "reway_open_group", requestId, groupId, urls },
          "*",
        );
      });

      if (response?.ok) {
        toast.success(
          `Opened ${response.count ?? targetBookmarks.length} tabs via extension`,
        );
        return;
      }

      if (targetBookmarks.length > 1) {
        targetBookmarks.forEach((bookmark, index) => {
          if (index === 0) {
            window.open(bookmark.url, "_blank", "noopener,noreferrer");
          } else {
            setTimeout(() => {
              window.open(bookmark.url, "_blank", "noopener,noreferrer");
            }, index * 100);
          }
        });
      } else {
        window.open(targetBookmarks[0].url, "_blank", "noopener,noreferrer");
      }

      toast.error("Install the Reway extension for instant open-all", {
        action: {
          label: "Get extension",
          onClick: () => window.open(extensionStoreUrl, "_blank"),
        },
      });
    },
    [bookmarks, deferredSearchQuery, extensionStoreUrl],
  );

  return { handleOpenGroup };
}
