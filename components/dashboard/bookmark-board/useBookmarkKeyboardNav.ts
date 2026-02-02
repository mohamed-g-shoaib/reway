"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";

interface UseBookmarkKeyboardNavOptions {
  bookmarks: BookmarkRow[];
  isGridView: boolean;
  gridColumns: number;
  onPreview: (bookmark: BookmarkRow) => void;
}

export function useBookmarkKeyboardNav({
  bookmarks,
  isGridView,
  gridColumns,
  onPreview,
}: UseBookmarkKeyboardNavOptions) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev < 0) return 0;
          const nextIndex = prev + (isGridView ? gridColumns : 1);
          return nextIndex < bookmarks.length ? nextIndex : prev;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev <= 0) return 0;
          const nextIndex = prev - (isGridView ? gridColumns : 1);
          return nextIndex >= 0 ? nextIndex : prev;
        });
      } else if (isGridView && e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev < 0) return 0;
          const nextIndex = prev + 1;
          return nextIndex < bookmarks.length ? nextIndex : prev;
        });
      } else if (isGridView && e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev <= 0) return 0;
          const nextIndex = prev - 1;
          return nextIndex >= 0 ? nextIndex : prev;
        });
      } else if (e.key === " ") {
        if (selectedIndex >= 0) {
          e.preventDefault();
          const bookmark = bookmarks[selectedIndex];
          if (bookmark) {
            onPreview(bookmark);
          }
        }
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0) {
          e.preventDefault();
          const bookmark = bookmarks[selectedIndex];
          if (!bookmark) return;
          if (e.metaKey || e.ctrlKey) {
            window.open(bookmark.url, "_blank", "noopener,noreferrer");
          } else {
            navigator.clipboard.writeText(bookmark.url);
            toast.success("URL copied to clipboard");
          }
        }
      } else if (e.key === "Escape") {
        setSelectedIndex(-1);
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-slot="bookmark-card"]')) {
        setSelectedIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleGlobalClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [bookmarks, selectedIndex, isGridView, gridColumns, onPreview]);

  const clampedSelectedIndex =
    selectedIndex >= bookmarks.length ? -1 : selectedIndex;

  return { selectedIndex, setSelectedIndex, clampedSelectedIndex };
}
