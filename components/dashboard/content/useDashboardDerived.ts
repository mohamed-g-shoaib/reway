"use client";

import { useMemo } from "react";
import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";

interface UseDashboardDerivedOptions {
  bookmarks: BookmarkRow[];
  groups: GroupRow[];
  activeGroupId: string;
  deferredSearchQuery: string;
}

export function useDashboardDerived({
  bookmarks,
  groups,
  activeGroupId,
  deferredSearchQuery,
}: UseDashboardDerivedOptions) {
  const filteredBookmarks = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    return bookmarks.filter((b) => {
      const matchesGroup =
        activeGroupId === "all" ? true : b.group_id === activeGroupId;
      if (!matchesGroup) return false;
      if (!normalizedQuery) return true;
      const haystack = [b.title, b.url, b.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeGroupId, bookmarks, deferredSearchQuery]);

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookmarks) {
      if (b.group_id) {
        counts[b.group_id] = (counts[b.group_id] || 0) + 1;
      }
    }
    return counts;
  }, [bookmarks]);

  const exportGroupOptions = useMemo(() => {
    const names = new Set<string>();
    names.add("Ungrouped");
    groups.forEach((group) => {
      if (group.name) {
        names.add(group.name);
      }
    });
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [groups]);

  return { filteredBookmarks, groupCounts, exportGroupOptions };
}
