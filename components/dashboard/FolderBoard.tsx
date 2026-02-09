"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { SortableBookmarkIcon } from "./SortableBookmarkIcon";
import { getDomain } from "@/lib/utils";
import { QuickGlanceDialog } from "./QuickGlanceDialog";
import { BookmarkEditSheet } from "./BookmarkEditSheet";
import { Favicon } from "./Favicon";
import { FolderHeader } from "./folder-board/FolderHeader";
import { EmptyFolder } from "./folder-board/EmptyFolder";
import { FolderDragOverlay } from "./folder-board/FolderDragOverlay";
import { useBookmarkBuckets } from "./folder-board/useBookmarkBuckets";
import { useFolderKeyboardNav } from "./folder-board/useFolderKeyboardNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface FolderBoardProps {
  bookmarks: BookmarkRow[];
  groups: GroupRow[];
  activeGroupId: string;
  onReorder: (groupId: string, newOrder: BookmarkRow[]) => void;
  onDeleteBookmark: (id: string) => void;
  onEditBookmark: (
    id: string,
    data: {
      title: string;
      url: string;
      description?: string;
      group_id?: string;
    },
  ) => Promise<void>;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onEnterSelectionMode?: () => void;
  onKeyboardContextChange?: (context: "folder" | "bookmark") => void;
}

const COLLAPSE_STORAGE_KEY = "reway.folder.collapsed";

export function FolderBoard({
  bookmarks,
  groups,
  activeGroupId,
  onReorder,
  onDeleteBookmark,
  onEditBookmark,
  selectionMode = false,
  selectedIds,
  onToggleSelection,
  onEnterSelectionMode,
  onKeyboardContextChange,
}: FolderBoardProps) {
  const stableSelectedIds = useMemo(() => selectedIds ?? new Set<string>(), [
    selectedIds,
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedBookmarkIndex, setSelectedBookmarkIndex] =
    useState<number>(-1);
  const [gridColumns, setGridColumns] = useState(1);
  const activeGridRef = useRef<HTMLDivElement | null>(null);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const dndContextBaseId = useId();
  const [isCollapseReady, setIsCollapseReady] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBookmark, setPreviewBookmark] = useState<BookmarkRow | null>(
    null,
  );
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editSheetBookmark, setEditSheetBookmark] =
    useState<BookmarkRow | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored) {
        setCollapsedGroups(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load folder collapse state:", error);
    } finally {
      setIsCollapseReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isCollapseReady) return;
    try {
      window.localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        JSON.stringify(collapsedGroups),
      );
    } catch (error) {
      console.warn("Failed to persist folder collapse state:", error);
    }
  }, [collapsedGroups, isCollapseReady]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeBookmark = activeId
    ? (bookmarks.find((bookmark) => bookmark.id === activeId) ?? null)
    : null;

  const visibleGroups = useMemo(() => {
    if (activeGroupId !== "all") {
      return groups.filter((group) => group.id === activeGroupId);
    }

    const hasUngrouped = bookmarks.some((bookmark) => !bookmark.group_id);
    if (!hasUngrouped) return groups;

    return [
      ...groups,
      {
        id: "no-group",
        name: "No Group",
        icon: "folder",
        color: null,
        user_id: "",
        created_at: new Date().toISOString(),
        order_index: null,
      },
    ];
  }, [activeGroupId, bookmarks, groups]);

  const bookmarkBuckets = useBookmarkBuckets({ bookmarks, visibleGroups });

  const openFolders = useMemo(
    () =>
      visibleGroups
        .filter((group) => !collapsedGroups[group.id])
        .map((group) => group.id),
    [collapsedGroups, visibleGroups],
  );

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const updateFolderOpenState = (groupId: string, open: boolean) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !open,
    }));
  };

  const handleAccordionChange = (values: string[]) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev };
      visibleGroups.forEach((group) => {
        next[group.id] = !values.includes(group.id);
      });
      return next;
    });

    if (selectedFolderId && !values.includes(selectedFolderId)) {
      setSelectedBookmarkIndex(-1);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeGroupId = active.data?.current?.sortable?.containerId as
      | string
      | undefined;
    const overGroupId = over?.data?.current?.sortable?.containerId as
      | string
      | undefined;

    if (!activeGroupId || !overGroupId || activeGroupId !== overGroupId) {
      setActiveId(null);
      return;
    }

    if (over && active.id !== over.id) {
      const groupBookmarks = bookmarkBuckets[activeGroupId] ?? [];
      const oldIndex = groupBookmarks.findIndex((b) => b.id === active.id);
      const newIndex = groupBookmarks.findIndex((b) => b.id === over.id);
      const newOrder = arrayMove(groupBookmarks, oldIndex, newIndex);
      onReorder(activeGroupId, newOrder);
    }
    setActiveId(null);
  };

  useEffect(() => {
    if (!selectedFolderId) return;

    const target = activeGridRef.current;
    if (!target) return;

    const updateColumns = () => {
      const width = target.clientWidth || 0;
      const gap = 12;
      const minCardWidth = 120;
      const columns = Math.max(
        1,
        Math.floor((width + gap) / (minCardWidth + gap)),
      );
      setGridColumns(columns);
    };

    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [selectedFolderId]);

  useEffect(() => {
    if (visibleGroups.length === 0) {
      setSelectedFolderId(null);
      setSelectedBookmarkIndex(-1);
      setHasKeyboardFocus(false);
      onKeyboardContextChange?.("folder");
      return;
    }

    if (
      selectedFolderId &&
      visibleGroups.some((g) => g.id === selectedFolderId)
    ) {
      return;
    }

    if (hasKeyboardFocus) {
      setSelectedFolderId(visibleGroups[0]?.id ?? null);
      setSelectedBookmarkIndex(-1);
    } else {
      setSelectedFolderId(null);
      setSelectedBookmarkIndex(-1);
    }
  }, [hasKeyboardFocus, selectedFolderId, visibleGroups]);

  useFolderKeyboardNav({
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
    onPreview: (bookmark) => {
      setPreviewBookmark(bookmark);
      setIsPreviewOpen(true);
    },
    onToggleCollapse: toggleCollapse,
  });

  return (
    <>
      <DndContext
        id={dndContextBaseId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Accordion
          type="multiple"
          value={openFolders}
          onValueChange={handleAccordionChange}
          className="flex flex-col gap-6 border-0 bg-transparent overflow-visible"
          data-slot="folder-board"
        >
          {visibleGroups.map((group) => {
            const groupBookmarks = bookmarkBuckets[group.id] ?? [];
            const isSelectedFolder = group.id === selectedFolderId;

            return (
              <AccordionItem
                key={group.id}
                value={group.id}
                className={`rounded-3xl border-0 ring-1 ring-foreground/8 bg-background/30 [content-visibility:auto] ${
                  hasKeyboardFocus &&
                  isSelectedFolder &&
                  selectedBookmarkIndex < 0
                    ? "ring-2 ring-primary/20"
                    : ""
                }`}
                data-slot="folder-section"
              >
                <FolderHeader
                  group={group}
                  count={groupBookmarks.length}
                  isSelected={
                    hasKeyboardFocus &&
                    group.id === selectedFolderId &&
                    selectedBookmarkIndex < 0
                  }
                  onSelect={() => setSelectedFolderId(group.id)}
                />

                <AccordionContent className="px-0">
                  <div className="px-4 pb-4 pt-4 md:px-5 bg-background/60">
                    {groupBookmarks.length === 0 ? (
                      <EmptyFolder />
                    ) : (
                      <SortableContext
                        id={group.id}
                        items={groupBookmarks.map((bookmark) => bookmark.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div
                          className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(120px,1fr))]"
                          ref={isSelectedFolder ? activeGridRef : undefined}
                        >
                          {groupBookmarks.map((bookmark, index) => (
                            <SortableBookmarkIcon
                              key={bookmark.id}
                              id={bookmark.id}
                              title={bookmark.title}
                              url={bookmark.url}
                              domain={getDomain(bookmark.url)}
                              favicon={bookmark.favicon_url || ""}
                              isSelected={
                                isSelectedFolder &&
                                selectedBookmarkIndex === index
                              }
                              selectionMode={selectionMode}
                              isSelectionChecked={stableSelectedIds.has(
                                bookmark.id,
                              )}
                              onToggleSelection={onToggleSelection}
                              onEnterSelectionMode={onEnterSelectionMode}
                              onDelete={onDeleteBookmark}
                              onEdit={(id: string) => {
                                const target = bookmarks.find((b) => b.id === id);
                                if (target) {
                                  setEditSheetBookmark(target);
                                  setIsEditSheetOpen(true);
                                }
                              }}
                              onPreview={(id: string) => {
                                const target = bookmarks.find((b) => b.id === id);
                                if (target) {
                                  setPreviewBookmark(target);
                                  setIsPreviewOpen(true);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                duration: 350,
                easing: "cubic-bezier(0.18, 1, 0.32, 1)",
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0" } },
                }),
              }}
            >
              <FolderDragOverlay activeBookmark={activeBookmark} />
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
      <QuickGlanceDialog
        bookmark={previewBookmark}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onEdit={(bookmark) => {
          setIsPreviewOpen(false);
          setEditSheetBookmark(bookmark);
          setIsEditSheetOpen(true);
        }}
        onDelete={(id) => {
          setIsPreviewOpen(false);
          onDeleteBookmark(id);
        }}
        groups={groups}
      />

      <BookmarkEditSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        bookmark={editSheetBookmark}
        groups={groups}
        onSave={onEditBookmark}
      />
    </>
  );
}
