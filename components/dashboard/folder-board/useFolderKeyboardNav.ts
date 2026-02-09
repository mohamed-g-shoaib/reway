"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { useGlobalKeydown } from "@/hooks/useGlobalKeydown";
import { useGlobalEvent } from "@/hooks/useGlobalEvent";

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
  const bookmarkBucketsRef = useRef(bookmarkBuckets);
  const collapsedGroupsRef = useRef(collapsedGroups);
  const gridColumnsRef = useRef(gridColumns);
  const visibleGroupsRef = useRef(visibleGroups);
  const selectedFolderIdRef = useRef(selectedFolderId);
  const selectedBookmarkIndexRef = useRef(selectedBookmarkIndex);
  const onPreviewRef = useRef(onPreview);
  const onToggleCollapseRef = useRef(onToggleCollapse);

  useEffect(() => {
    bookmarkBucketsRef.current = bookmarkBuckets;
  }, [bookmarkBuckets]);

  useEffect(() => {
    collapsedGroupsRef.current = collapsedGroups;
  }, [collapsedGroups]);

  useEffect(() => {
    gridColumnsRef.current = gridColumns;
  }, [gridColumns]);

  useEffect(() => {
    visibleGroupsRef.current = visibleGroups;
  }, [visibleGroups]);

  useEffect(() => {
    selectedFolderIdRef.current = selectedFolderId;
  }, [selectedFolderId]);

  useEffect(() => {
    selectedBookmarkIndexRef.current = selectedBookmarkIndex;
  }, [selectedBookmarkIndex]);

  useEffect(() => {
    onPreviewRef.current = onPreview;
  }, [onPreview]);

  useEffect(() => {
    onToggleCollapseRef.current = onToggleCollapse;
  }, [onToggleCollapse]);

  useEffect(() => {
    onKeyboardContextChange?.(
      selectedBookmarkIndex >= 0 ? "bookmark" : "folder",
    );
  }, [onKeyboardContextChange, selectedBookmarkIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.closest('[data-slot="dialog-content"]') ||
          target.closest('[data-slot="dropdown-menu-content"]') ||
          target.closest('[data-slot="context-menu-content"]') ||
          target.closest('[data-slot="popover-content"]'))
      ) {
        return;
      }

      if (
        target instanceof HTMLElement &&
        (target.closest("button") ||
          target.closest('a[href]') ||
          target.closest('[role="button"]') ||
          target.closest('[role="link"]'))
      ) {
        return;
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const visibleGroupsValue = visibleGroupsRef.current;
      const selectedFolderValue = selectedFolderIdRef.current;
      const selectedBookmarkValue = selectedBookmarkIndexRef.current;
      const bucketsValue = bookmarkBucketsRef.current;
      const collapsedValue = collapsedGroupsRef.current;
      const columns = gridColumnsRef.current;

      const folderIndex = selectedFolderValue
        ? visibleGroupsValue.findIndex(
            (group) => group.id === selectedFolderValue,
          )
        : -1;
      const activeGroup =
        folderIndex >= 0 ? visibleGroupsValue[folderIndex] : undefined;
      const activeBookmarks = activeGroup
        ? (bucketsValue[activeGroup.id] ?? [])
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
        if (selectedBookmarkValue >= 0) {
          setSelectedBookmarkIndex((prev) => {
            const nextIndex = prev + columns;
            if (nextIndex < activeBookmarks.length) {
              return nextIndex;
            }
            if (
              folderIndex >= 0 &&
              folderIndex < visibleGroupsValue.length - 1
            ) {
              setSelectedFolderId(visibleGroupsValue[folderIndex + 1].id);
              return -1;
            }
            return prev;
          });
          return;
        }

        if (folderIndex < 0) {
          setSelectedFolderId(visibleGroupsValue[0]?.id ?? null);
          return;
        }

        if (
          !collapsedValue[activeGroup?.id ?? ""] &&
          activeBookmarks.length > 0
        ) {
          setSelectedBookmarkIndex(0);
          return;
        }

        const next = Math.min(visibleGroupsValue.length - 1, folderIndex + 1);
        setSelectedFolderId(visibleGroupsValue[next].id);
        setSelectedBookmarkIndex(-1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedBookmarkValue >= 0) {
          setSelectedBookmarkIndex((prev) => {
            const nextIndex = prev - columns;
            if (nextIndex >= 0) {
              return nextIndex;
            }
            return -1;
          });
          return;
        }

        if (folderIndex < 0) {
          setSelectedFolderId(visibleGroupsValue[0]?.id ?? null);
          return;
        }

        const next = Math.max(0, folderIndex - 1);
        setSelectedFolderId(visibleGroupsValue[next].id);
        setSelectedBookmarkIndex(-1);
        return;
      }

      if (selectedBookmarkValue >= 0 && e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedBookmarkIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex < activeBookmarks.length ? nextIndex : prev;
        });
        return;
      }

      if (selectedBookmarkValue >= 0 && e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedBookmarkIndex((prev) => {
          const nextIndex = prev - 1;
          return nextIndex >= 0 ? nextIndex : prev;
        });
        return;
      }

      if (e.key === " ") {
        if (selectedBookmarkValue >= 0) {
          const bookmark = activeBookmarks[selectedBookmarkValue];
          if (!bookmark) return;
          e.preventDefault();
          onPreviewRef.current(bookmark);
        }
        return;
      }

      if (e.key === "Enter") {
        if (!activeGroup) return;
        e.preventDefault();

        if (selectedBookmarkValue >= 0) {
          const bookmark = activeBookmarks[selectedBookmarkValue];
          if (!bookmark) return;
          if (e.metaKey || e.ctrlKey) {
            window.open(bookmark.url, "_blank", "noopener,noreferrer");
          } else {
            navigator.clipboard.writeText(bookmark.url);
            toast.success("URL copied to clipboard");
          }
          return;
        }

        onToggleCollapseRef.current(activeGroup.id);
        return;
      }

      if (e.key === "Escape") {
        setSelectedBookmarkIndex(-1);
        setSelectedFolderId(null);
        setHasKeyboardFocus(false);
      }
    },
    [setHasKeyboardFocus, setSelectedBookmarkIndex, setSelectedFolderId],
  );

  useGlobalKeydown(handleKeyDown, { capture: true });

  useGlobalEvent("mousedown", (event) => {
    setHasKeyboardFocus(false);
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-slot="folder-board"]')) {
      setSelectedBookmarkIndex(-1);
      setSelectedFolderId(null);
    }
  });
}
