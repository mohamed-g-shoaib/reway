"use client";

import React, { useState, useId, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableBookmark } from "./SortableBookmark";
import { SortableBookmarkCard } from "./SortableBookmarkCard";
import { SortableBookmarkIcon } from "./SortableBookmarkIcon";
import { createPortal } from "react-dom";
import { BookmarkDragOverlay } from "./bookmark-board/BookmarkDragOverlay";
import { EmptyState } from "./bookmark-board/EmptyState";
import { useBookmarkGrid } from "./bookmark-board/useBookmarkGrid";
import { useBookmarkKeyboardNav } from "./bookmark-board/useBookmarkKeyboardNav";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { getDomain } from "@/lib/utils";
import { QuickGlanceDialog } from "./QuickGlanceDialog";
import { BookmarkEditSheet } from "./BookmarkEditSheet";
import { useIsMac } from "@/hooks/useIsMac";

interface BookmarkBoardProps {
  bookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
  activeGroupId: string;
  onReorder: (newOrder: BookmarkRow[]) => void;
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
  rowContent: "date" | "group";
  viewMode: "list" | "card" | "icon";
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onEnterSelectionMode?: () => void;
}

export function BookmarkBoard({
  bookmarks,
  initialGroups,
  activeGroupId,
  onReorder,
  onDeleteBookmark,
  onEditBookmark,
  rowContent,
  viewMode,
  selectionMode = false,
  selectedIds,
  onToggleSelection,
  onEnterSelectionMode,
}: BookmarkBoardProps) {
  const stableSelectedIds = useMemo(
    () => selectedIds ?? new Set<string>(),
    [selectedIds],
  );

  // ... existing sensors and handlers
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBookmark, setPreviewBookmark] = useState<BookmarkRow | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editSheetBookmark, setEditSheetBookmark] =
    useState<BookmarkRow | null>(null);
  const dndContextId = useId();
  const isGridView = viewMode !== "list";
  const boardRef = useRef<HTMLDivElement>(null);
  const gridColumns = useBookmarkGrid({
    viewMode,
    isGridView,
    boardRef,
  });

  // Pre-calculate and memoize transformed bookmarks to prevent unnecessary re-renders
  const displayBookmarks = useMemo(() => {
    return bookmarks.map((b) => ({
      id: b.id,
      title: b.title,
      url: b.url,
      image_url: b.image_url || undefined,
      og_image_url: b.og_image_url || undefined,
      domain: getDomain(b.url),
      description: b.description || undefined,
      favicon: b.favicon_url || undefined,
      createdAt: new Date(b.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      groupId: b.group_id || "all",
      status: b.status || "ready",
    }));
  }, [bookmarks]);

  // Pre-calculate groups map for O(1) lookups in children
  const groupsMap = useMemo(() => {
    return new Map(initialGroups.map((g) => [g.id, g]));
  }, [initialGroups]);

  // Detect OS for keyboard shortcuts
  const isMac = useIsMac();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeBookmark = activeId
    ? (bookmarks.find((b) => b.id === activeId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = bookmarks.findIndex((b) => b.id === active.id);
      const newIndex = bookmarks.findIndex((b) => b.id === over.id);
      const newOrder = arrayMove(bookmarks, oldIndex, newIndex);
      onReorder(newOrder);
    }

    setActiveId(null);
  }

  const { clampedSelectedIndex } = useBookmarkKeyboardNav({
    bookmarks,
    isGridView,
    gridColumns,
    onPreview: (bookmark) => {
      setPreviewBookmark(bookmark);
      setIsPreviewOpen(true);
    },
  });
  const activeEditingId = viewMode === "list" ? editingId : null;

  if (bookmarks.length === 0) {
    return <EmptyState isMac={isMac} />;
  }

  return (
    <div
      className="w-full bookmark-board-empty-space"
      data-slot="bookmark-board"
    >
      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
        modifiers={isGridView ? [] : [restrictToVerticalAxis]}
      >
        <SortableContext
          items={displayBookmarks.map((b) => b.id)}
          strategy={
            isGridView ? rectSortingStrategy : verticalListSortingStrategy
          }
        >
          <div
            ref={boardRef}
            className={
              viewMode === "list"
                ? "flex flex-col gap-1 bookmark-board-empty-space"
                : viewMode === "card"
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 bookmark-board-empty-space"
                  : "grid gap-3 grid-cols-[repeat(auto-fit,minmax(120px,1fr))] bookmark-board-empty-space"
            }
            data-slot="bookmark-board"
          >
            {displayBookmarks.map((bookmark, index) => {
              if (viewMode === "card") {
                return (
                  <SortableBookmarkCard
                    key={bookmark.id}
                    isSelected={clampedSelectedIndex === index}
                    selectionMode={selectionMode}
                    isSelectionChecked={stableSelectedIds.has(bookmark.id)}
                    onToggleSelection={onToggleSelection}
                    onEnterSelectionMode={onEnterSelectionMode}
                    groupsMap={groupsMap}
                    activeGroupId={activeGroupId}
                    onDelete={onDeleteBookmark}
                    onEdit={(id: string) => {
                      const target = bookmarks.find((bm) => bm.id === id);
                      if (target) {
                        setEditSheetBookmark(target);
                        setIsEditSheetOpen(true);
                      }
                    }}
                    onPreview={(id: string) => {
                      const b = bookmarks.find((bm) => bm.id === id);
                      if (b) {
                        setPreviewBookmark(b);
                        setIsPreviewOpen(true);
                      }
                    }}
                    rowContent={rowContent}
                    {...bookmark}
                  />
                );
              }

              if (viewMode === "icon") {
                return (
                  <SortableBookmarkIcon
                    key={bookmark.id}
                    isSelected={clampedSelectedIndex === index}
                    selectionMode={selectionMode}
                    isSelectionChecked={stableSelectedIds.has(bookmark.id)}
                    onToggleSelection={onToggleSelection}
                    onEnterSelectionMode={onEnterSelectionMode}
                    onDelete={onDeleteBookmark}
                    onEdit={(id: string) => {
                      const target = bookmarks.find((bm) => bm.id === id);
                      if (target) {
                        setEditSheetBookmark(target);
                        setIsEditSheetOpen(true);
                      }
                    }}
                    onPreview={(id: string) => {
                      const b = bookmarks.find((bm) => bm.id === id);
                      if (b) {
                        setPreviewBookmark(b);
                        setIsPreviewOpen(true);
                      }
                    }}
                    {...bookmark}
                  />
                );
              }

              return (
                <SortableBookmark
                  key={bookmark.id}
                  onDelete={onDeleteBookmark}
                  onEdit={onEditBookmark}
                  isSelected={clampedSelectedIndex === index}
                  groups={initialGroups}
                  groupsMap={groupsMap}
                  activeGroupId={activeGroupId}
                  isEditing={activeEditingId === bookmark.id}
                  onEditDone={() => setEditingId(null)}
                  onPreview={(id) => {
                    const b = bookmarks.find((bm) => bm.id === id);
                    if (b) {
                      setPreviewBookmark(b);
                      setIsPreviewOpen(true);
                    }
                  }}
                  rowContent={rowContent}
                  selectionMode={selectionMode}
                  isSelectionChecked={stableSelectedIds.has(bookmark.id)}
                  onToggleSelection={onToggleSelection}
                  onEnterSelectionMode={onEnterSelectionMode}
                  {...bookmark}
                />
              );
            })}
          </div>
        </SortableContext>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={null} adjustScale={false}>
              <BookmarkDragOverlay
                activeBookmark={activeBookmark}
                viewMode={viewMode}
              />
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
          setEditingId(bookmark.id);
        }}
        onDelete={(id) => {
          setIsPreviewOpen(false);
          onDeleteBookmark(id);
        }}
        groups={initialGroups}
      />

      <BookmarkEditSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        bookmark={editSheetBookmark}
        groups={initialGroups}
        onSave={onEditBookmark}
      />
    </div>
  );
}
