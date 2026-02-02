"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";

interface UseFolderKeyboardNavOptions {
  bookmarkBuckets: Record<string, BookmarkRow[]>;
  collapsedGroups: Record<string, boolean>;
  gridColumns: number;
  visibleGroups: GroupRow[];
  selectedFolderId: string | null;
  setSelectedFolderId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedBookmarkIndex: number;
  setSelectedBookmarkIndex: React.Dispatch<React.SetStateAction<number>>;
  setHasKeyboardFocus: React.Dispatch<React.SetStateAction<boolean>>;
  onKeyboardContextChange?: (context: "folder" | "bookmark") => void;
  onPreview: (bookmark: BookmarkRow) => void;
  onToggleCollapse: (groupId: string) => void;
}

export function useFolderKeyboardNav({
  bookmarkBuckets,
  collapsedGroups,
  gridColumns,
  visibleGroups,
  selectedFolderId,
  setSelectedFolderId,
  selectedBookmarkIndex,
  setSelectedBookmarkIndex,
  setHasKeyboardFocus,
  onKeyboardContextChange,
  onPreview,
  onToggleCollapse,
}: UseFolderKeyboardNavOptions) {
  useEffect(() => {
    onKeyboardContextChange?.(
      selectedBookmarkIndex >= 0 ? "bookmark" : "folder",
    );
  }, [onKeyboardContextChange, selectedBookmarkIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const folderIndex = selectedFolderId
        ? visibleGroups.findIndex((group) => group.id === selectedFolderId)
        : -1;
      const activeGroup =
        folderIndex >= 0 ? visibleGroups[folderIndex] : undefined;
      const activeBookmarks = activeGroup
        ? bookmarkBuckets[activeGroup.id] ?? []
        : [];

      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === " " ||
        e.key === "Enter"
      ) {
        setHasKeyboardFocus(true);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (selectedBookmarkIndex >= 0) {
          setSelectedBookmarkIndex((prev) => {
            const nextIndex = prev + gridColumns;
            if (nextIndex < activeBookmarks.length) {
              return nextIndex;
            }
            if (folderIndex >= 0 && folderIndex < visibleGroups.length - 1) {
              setSelectedFolderId(visibleGroups[folderIndex + 1].id);
              return -1;
            }
            return prev;
          });
          return;
        }

        if (folderIndex < 0) {
          setSelectedFolderId(visibleGroups[0]?.id ?? null);
          return;
        }

        if (!collapsedGroups[activeGroup?.id ?? ""] && activeBookmarks.length > 0) {
          setSelectedBookmarkIndex(0);
          return;
        }

        const next = Math.min(visibleGroups.length - 1, folderIndex + 1);
        setSelectedFolderId(visibleGroups[next].id);
        setSelectedBookmarkIndex(-1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedBookmarkIndex >= 0) {
          setSelectedBookmarkIndex((prev) => {
            const nextIndex = prev - gridColumns;
            if (nextIndex >= 0) {
              return nextIndex;
            }
            return -1;
          });
          return;
        }

        if (folderIndex < 0) {
          setSelectedFolderId(visibleGroups[0]?.id ?? null);
          return;
        }

        const next = Math.max(0, folderIndex - 1);
        setSelectedFolderId(visibleGroups[next].id);
        setSelectedBookmarkIndex(-1);
        return;
      }

      if (selectedBookmarkIndex >= 0 && e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedBookmarkIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex < activeBookmarks.length ? nextIndex : prev;
        });
        return;
      }

      if (selectedBookmarkIndex >= 0 && e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedBookmarkIndex((prev) => {
          const nextIndex = prev - 1;
          return nextIndex >= 0 ? nextIndex : prev;
        });
        return;
      }

      if (e.key === " ") {
        if (selectedBookmarkIndex >= 0) {
          const bookmark = activeBookmarks[selectedBookmarkIndex];
          if (!bookmark) return;
          e.preventDefault();
          onPreview(bookmark);
        }
        return;
      }

      if (e.key === "Enter") {
        if (!activeGroup) return;
        e.preventDefault();

        if (selectedBookmarkIndex >= 0) {
          const bookmark = activeBookmarks[selectedBookmarkIndex];
          if (!bookmark) return;
          if (e.metaKey || e.ctrlKey) {
            window.open(bookmark.url, "_blank", "noopener,noreferrer");
          } else {
            navigator.clipboard.writeText(bookmark.url);
            toast.success("URL copied to clipboard");
          }
          return;
        }

        onToggleCollapse(activeGroup.id);
        return;
      }

      if (e.key === "Escape") {
        setSelectedBookmarkIndex(-1);
        setSelectedFolderId(null);
        setHasKeyboardFocus(false);
      }
    };

    const handleGlobalClick = (event: MouseEvent) => {
      setHasKeyboardFocus(false);
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-slot="folder-board"]')) {
        setSelectedBookmarkIndex(-1);
        setSelectedFolderId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("mousedown", handleGlobalClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [
    bookmarkBuckets,
    collapsedGroups,
    gridColumns,
    selectedBookmarkIndex,
    selectedFolderId,
    visibleGroups,
    onPreview,
    onToggleCollapse,
    setHasKeyboardFocus,
    setSelectedBookmarkIndex,
    setSelectedFolderId,
  ]);
}
