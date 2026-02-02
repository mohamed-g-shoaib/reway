"use client";

import { useMemo } from "react";
import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";

interface UseBookmarkBucketsOptions {
  bookmarks: BookmarkRow[];
  visibleGroups: GroupRow[];
}

export function useBookmarkBuckets({
  bookmarks,
  visibleGroups,
}: UseBookmarkBucketsOptions) {
  return useMemo(() => {
    const buckets: Record<string, BookmarkRow[]> = {};
    for (const group of visibleGroups) {
      buckets[group.id] = [];
    }

    for (const bookmark of bookmarks) {
      const groupId = bookmark.group_id ?? "no-group";
      if (!buckets[groupId]) {
        buckets[groupId] = [];
      }
      buckets[groupId].push(bookmark);
    }

    Object.keys(buckets).forEach((groupId) => {
      buckets[groupId] = buckets[groupId].toSorted((a, b) => {
        const aOrder =
          a.folder_order_index ?? a.order_index ?? Number.POSITIVE_INFINITY;
        const bOrder =
          b.folder_order_index ?? b.order_index ?? Number.POSITIVE_INFINITY;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    });

    return buckets;
  }, [bookmarks, visibleGroups]);
}
