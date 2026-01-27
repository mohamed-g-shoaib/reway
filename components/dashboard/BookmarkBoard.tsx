"use client";

import React, { useState, useId, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
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
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableBookmark } from "./SortableBookmark";
import { createPortal } from "react-dom";
import { Bookmark01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Favicon } from "./Favicon";
import { getDomain } from "@/lib/utils";
import { QuickGlanceDialog } from "./QuickGlanceDialog";
import { toast } from "sonner";
import { useEffect } from "react";

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
}

export function BookmarkBoard({
  bookmarks,
  initialGroups,
  onReorder,
  onDeleteBookmark,
  onEditBookmark,
  rowContent,
}: BookmarkBoardProps) {
  // ... existing sensors and handlers
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBookmark, setPreviewBookmark] = useState<BookmarkRow | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const dndContextId = useId();

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
  const isMac = useMemo(
    () =>
      typeof window !== "undefined" &&
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
    [],
  );

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
        setSelectedIndex((prev) =>
          prev < bookmarks.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
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
  }, [bookmarks, selectedIndex]);

  // Ensure selected index stays within bounds when bookmarks change
  const clampedSelectedIndex =
    selectedIndex >= bookmarks.length ? -1 : selectedIndex;

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/30 mb-6">
          <HugeiconsIcon
            icon={Bookmark01Icon}
            size={40}
            className="text-muted-foreground/40"
          />
        </div>
        <h3 className="text-xl font-bold text-foreground">No bookmarks yet</h3>
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-muted-foreground mt-2 max-w-70">
          <span className="hidden md:inline">Press</span>
          <KbdGroup className="hidden md:inline-flex">
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <span className="hidden md:inline">to add your first link.</span>
          <span className="md:hidden">
            Add your first links to get started.
          </span>
        </div>
        <Button
          variant="outline"
          className="mt-8 rounded-4xl gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                metaKey: isMac,
                ctrlKey: !isMac,
              }),
            )
          }
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Add Bookmark
        </Button>
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
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={displayBookmarks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="flex flex-col gap-1 bookmark-board-empty-space"
            data-slot="bookmark-board"
          >
            {displayBookmarks.map((bookmark, index) => (
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
                {...bookmark}
              />
            ))}
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
    </div>
  );
}
