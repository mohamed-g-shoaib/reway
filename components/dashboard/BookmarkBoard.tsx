"use client";

import React, { useState, useId, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
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
import { Bookmark01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Favicon } from "./Favicon";
import { getDomain } from "@/lib/utils";
import { QuickGlanceDialog } from "./QuickGlanceDialog";
import { BookmarkEditSheet } from "./BookmarkEditSheet";
import { toast } from "sonner";
import { useIsMac } from "@/hooks/useIsMac";

interface BookmarkBoardProps {
  bookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
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
  onReorder,
  onDeleteBookmark,
  onEditBookmark,
  rowContent,
  viewMode,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  onEnterSelectionMode,
}: BookmarkBoardProps) {
  // ... existing sensors and handlers
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBookmark, setPreviewBookmark] = useState<BookmarkRow | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editSheetBookmark, setEditSheetBookmark] =
    useState<BookmarkRow | null>(null);
  const dndContextId = useId();
  const boardRef = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = useState(1);
  const isGridView = viewMode !== "list";

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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeBookmark = activeId
    ? bookmarks.find((b) => b.id === activeId)
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

  useEffect(() => {
    if (!boardRef.current || !isGridView) return;

    const updateColumns = () => {
      if (viewMode === "card") {
        const isLg = window.matchMedia("(min-width: 1024px)").matches;
        const isSm = window.matchMedia("(min-width: 640px)").matches;
        setGridColumns(isLg ? 3 : isSm ? 2 : 1);
        return;
      }

      const width = boardRef.current?.clientWidth || 0;
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
    observer.observe(boardRef.current);
    window.addEventListener("resize", updateColumns);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateColumns);
    };
  }, [viewMode, isGridView]);

  useEffect(() => {
    if (viewMode !== "list") {
      setEditingId(null);
    }
  }, [viewMode]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
          setPreviewBookmark(bookmarks[selectedIndex]);
          setIsPreviewOpen(true);
        }
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0) {
          e.preventDefault();
          const bookmark = bookmarks[selectedIndex];
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
      // Clear selection if clicking outside of any bookmark card
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
  }, [bookmarks, selectedIndex, isGridView, gridColumns]);

  // Ensure selected index stays within bounds when bookmarks change
  const clampedSelectedIndex =
    selectedIndex >= bookmarks.length ? -1 : selectedIndex;

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/30 mb-6">
          <HugeiconsIcon
            icon={Bookmark01Icon}
            size={40}
            className="text-muted-foreground/40"
          />
        </div>
        <h3 className="text-xl font-bold text-foreground text-balance">
          No bookmarks yet
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-muted-foreground mt-2 max-w-70 text-pretty">
          <span className="hidden md:inline">Press</span>
          <KbdGroup className="hidden md:inline-flex">
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>F</Kbd>
          </KbdGroup>
          <span className="hidden md:inline">to add your first link.</span>
          <span className="md:hidden">
            Add your first links to get started.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bookmark-board-empty-space"
      data-slot="bookmark-board"
    >
      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={isGridView ? closestCenter : closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
                    isSelectionChecked={selectedIds.has(bookmark.id)}
                    onToggleSelection={onToggleSelection}
                    onEnterSelectionMode={onEnterSelectionMode}
                    groupsMap={groupsMap}
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
                    isSelectionChecked={selectedIds.has(bookmark.id)}
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
                  isEditing={editingId === bookmark.id}
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
                  isSelectionChecked={selectedIds.has(bookmark.id)}
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
            <DragOverlay
              dropAnimation={{
                duration: 350,
                easing: "cubic-bezier(0.18, 1, 0.32, 1)",
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: "0",
                    },
                  },
                }),
              }}
            >
              {activeBookmark
                ? (() => {
                    const domain = getDomain(activeBookmark.url);

                    if (viewMode === "card") {
                      return (
                        <div className="relative flex flex-col gap-3 rounded-2xl bg-background/80 ring-1 ring-foreground/5 p-4 backdrop-blur-xl after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate overflow-hidden">
                          <div className="flex items-center gap-3 min-w-0">
                            <Favicon
                              url={activeBookmark.favicon_url || ""}
                              domain={domain}
                              title={activeBookmark.title || ""}
                              className="size-9"
                            />
                            <div className="min-w-0 flex flex-col">
                              <p className="truncate text-sm font-bold text-foreground">
                                {activeBookmark.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground/70">
                                {domain}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground/70">
                            {new Date(
                              activeBookmark.created_at,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      );
                    }

                    if (viewMode === "icon") {
                      return (
                        <div className="relative flex flex-col items-center gap-3 rounded-2xl bg-background/80 ring-1 ring-foreground/5 p-4 text-center backdrop-blur-xl after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate overflow-hidden">
                          <Favicon
                            url={activeBookmark.favicon_url || ""}
                            domain={domain}
                            title={activeBookmark.title || ""}
                            className="size-12"
                          />
                          <p className="truncate text-xs font-semibold text-foreground w-full">
                            {activeBookmark.title}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="relative flex items-center justify-between rounded-2xl bg-background/80 ring-1 ring-foreground/5 px-4 py-1.5 backdrop-blur-xl after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Favicon
                            url={activeBookmark.favicon_url || ""}
                            domain={domain}
                            title={activeBookmark.title || ""}
                          />
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-bold text-foreground">
                              {activeBookmark.title}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {domain}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center pl-6">
                          <span className="text-sm font-medium text-muted-foreground/50">
                            {new Date(
                              activeBookmark.created_at,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                : null}
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
