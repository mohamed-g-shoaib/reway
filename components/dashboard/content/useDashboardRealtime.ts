"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";

interface UseDashboardRealtimeOptions {
  userId: string;
  sortBookmarks: (items: BookmarkRow[]) => BookmarkRow[];
  sortGroups: (items: GroupRow[]) => GroupRow[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  setGroups: React.Dispatch<React.SetStateAction<GroupRow[]>>;
}

export function useDashboardRealtime({
  userId,
  sortBookmarks,
  sortGroups,
  setBookmarks,
  setGroups,
}: UseDashboardRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient();
    supabase.realtime.setAuth();

    const bookmarksChannel = supabase
      .channel(`user:${userId}:bookmarks`, { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, (payload) => {
        const nextRow = payload.payload as BookmarkRow | undefined;
        if (!nextRow) return;
        setBookmarks((prev) => {
          if (prev.some((b) => b.id === nextRow.id)) return prev;
          return sortBookmarks([nextRow, ...prev]);
        });
      })
      .on("broadcast", { event: "UPDATE" }, (payload) => {
        const nextRow = payload.payload as BookmarkRow | undefined;
        if (!nextRow) return;
        setBookmarks((prev) =>
          sortBookmarks(
            prev.map((item) => (item.id === nextRow.id ? nextRow : item)),
          ),
        );
      })
      .on("broadcast", { event: "DELETE" }, (payload) => {
        const oldRow = payload.payload as BookmarkRow | undefined;
        if (!oldRow) return;
        setBookmarks((prev) => prev.filter((item) => item.id !== oldRow.id));
      })
      .subscribe();

    const groupsChannel = supabase
      .channel(`user:${userId}:groups`, { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, (payload) => {
        const nextRow = payload.payload as GroupRow | undefined;
        if (!nextRow?.name?.trim()) return;
        setGroups((prev) => {
          if (prev.some((g) => g.id === nextRow.id)) return prev;
          return sortGroups([nextRow, ...prev]);
        });
      })
      .on("broadcast", { event: "UPDATE" }, (payload) => {
        const nextRow = payload.payload as GroupRow | undefined;
        if (!nextRow) return;
        setGroups((prev) =>
          sortGroups(prev.map((item) => (item.id === nextRow.id ? nextRow : item))),
        );
      })
      .on("broadcast", { event: "DELETE" }, (payload) => {
        const oldRow = payload.payload as GroupRow | undefined;
        if (!oldRow) return;
        setGroups((prev) => prev.filter((item) => item.id !== oldRow.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookmarksChannel);
      supabase.removeChannel(groupsChannel);
    };
  }, [setBookmarks, setGroups, sortBookmarks, sortGroups, userId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type !== "reway_broadcast_bookmark") return;
      const bookmark = event.data.bookmark as BookmarkRow | undefined;
      if (!bookmark?.id) return;
      setBookmarks((prev) => {
        if (prev.some((item) => item.id === bookmark.id)) {
          return prev.map((item) =>
            item.id === bookmark.id ? bookmark : item,
          );
        }
        return sortBookmarks([bookmark, ...prev]);
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setBookmarks, sortBookmarks]);
}
