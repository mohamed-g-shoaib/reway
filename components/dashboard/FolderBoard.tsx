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
import { Folder01Icon, GridIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { SortableBookmarkIcon } from "./SortableBookmarkIcon";
import { getDomain } from "@/lib/utils";
import { QuickGlanceDialog } from "./QuickGlanceDialog";
import { BookmarkEditSheet } from "./BookmarkEditSheet";
import { Favicon } from "./Favicon";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
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
  selectedIds = new Set(),
  onToggleSelection,
  onEnterSelectionMode,
  onKeyboardContextChange,
}: FolderBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedBookmarkIndex, setSelectedBookmarkIndex] = useState<number>(-1);
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
  const [editSheetBookmark, setEditSheetBookmark] = useState<BookmarkRow | null>(
    null,
  );

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
    ? bookmarks.find((bookmark) => bookmark.id === activeId)
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

  const bookmarkBuckets = useMemo(() => {
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
      buckets[groupId] = [...buckets[groupId]].sort((a, b) => {
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
    window.addEventListener("resize", updateColumns);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateColumns);
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

    if (selectedFolderId && visibleGroups.some((g) => g.id === selectedFolderId)) {
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
        if (!hasKeyboardFocus) {
          setHasKeyboardFocus(true);
        }
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
          setPreviewBookmark(bookmark);
          setIsPreviewOpen(true);
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

        if (e.metaKey || e.ctrlKey) {
          toggleCollapse(activeGroup.id);
        } else {
          toggleCollapse(activeGroup.id);
        }
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
    hasKeyboardFocus,
    selectedBookmarkIndex,
    selectedFolderId,
    visibleGroups,
  ]);

  const renderFolderHeader = (group: GroupRow, count: number) => {
    const Icon = group.icon ? ALL_ICONS_MAP[group.icon] : Folder01Icon;
    const isSelected =
      hasKeyboardFocus &&
      group.id === selectedFolderId &&
      selectedBookmarkIndex < 0;
    return (
      <AccordionTrigger
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left border-b border-border/30 bg-muted/15 transition-colors hover:bg-muted/20 hover:no-underline ${
          isSelected ? "ring-1 ring-primary/20 bg-muted/20" : ""
        }`}
        onClick={() => setSelectedFolderId(group.id)}
        aria-label={`Toggle ${group.name}`}
        data-slot="folder-header"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <HugeiconsIcon
              icon={Icon}
              size={18}
              strokeWidth={1.8}
              style={{ color: group.color || undefined }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {group.name}
                </span>
                <span className="text-xs text-muted-foreground/70 tabular-nums">
                  {count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
    );
  };

  const renderEmptyFolder = () => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground/70 py-3">
      <HugeiconsIcon icon={GridIcon} size={14} />
      <span>No bookmarks yet</span>
    </div>
  );

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
                className={`rounded-3xl border border-border/40 bg-background/30 [content-visibility:auto] ${
                  hasKeyboardFocus &&
                  isSelectedFolder &&
                  selectedBookmarkIndex < 0
                    ? "ring-2 ring-primary/20"
                    : ""
                }`}
                data-slot="folder-section"
              >
                {renderFolderHeader(group, groupBookmarks.length)}

                <AccordionContent className="px-0">
                  <div className="px-4 pb-4 pt-4 md:px-5 bg-background/60">
                    {groupBookmarks.length === 0 ? (
                      renderEmptyFolder()
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
                                isSelectedFolder && selectedBookmarkIndex === index
                              }
                              selectionMode={selectionMode}
                              isSelectionChecked={selectedIds.has(bookmark.id)}
                              onToggleSelection={onToggleSelection}
                              onEnterSelectionMode={onEnterSelectionMode}
                              onDelete={onDeleteBookmark}
                              onEdit={(id) => {
                                const target = bookmarks.find((b) => b.id === id);
                                if (target) {
                                  setEditSheetBookmark(target);
                                  setIsEditSheetOpen(true);
                                }
                              }}
                              onPreview={(id) => {
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
              {activeBookmark ? (
                <div className="relative flex flex-col items-center gap-3 rounded-2xl bg-background/80 ring-1 ring-foreground/5 p-4 text-center backdrop-blur-xl after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate overflow-hidden">
                  <Favicon
                    url={activeBookmark.favicon_url || ""}
                    domain={getDomain(activeBookmark.url)}
                    title={activeBookmark.title || ""}
                    className="size-12"
                  />
                  <p className="truncate text-xs font-semibold text-foreground w-full">
                    {activeBookmark.title}
                  </p>
                </div>
              ) : null}
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
