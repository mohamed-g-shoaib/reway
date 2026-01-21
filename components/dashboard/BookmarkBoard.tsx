"use client";

import React, { useState, useId } from "react";
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
import { Favicon } from "./Favicon";

interface BookmarkBoardProps {
  bookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
  onReorder: (newOrder: BookmarkRow[]) => void;
  onDeleteBookmark: (id: string) => void;
}

export function BookmarkBoard({
  bookmarks,
  onReorder,
  onDeleteBookmark,
}: BookmarkBoardProps) {
  // ... existing sensors and handlers
  const [activeId, setActiveId] = useState<string | null>(null);
  const dndContextId = useId();

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
      // TODO: Persist order to database
    }

    setActiveId(null);
  }

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
        <p className="text-muted-foreground mt-2 max-w-70">
          Press{" "}
          <kbd className="font-sans text-xs bg-muted px-1.5 py-0.5 rounded border border-border/50 shadow-sm">
            ⌘
          </kbd>{" "}
          +{" "}
          <kbd className="font-sans text-xs bg-muted px-1.5 py-0.5 rounded border border-border/50 shadow-sm">
            K
          </kbd>{" "}
          to add your first link.
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-2xl gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true }),
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
    <div className="mt-4 w-full">
      <div className="flex items-center justify-between pb-4 text-[11px] font-bold tracking-widest text-muted-foreground/40 uppercase">
        <span>Title</span>
        <span>Created At</span>
      </div>

      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={bookmarks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="-mx-4 flex flex-col gap-1">
            {bookmarks.map((bookmark) => {
              let domain = "link";
              try {
                domain = new URL(bookmark.url).hostname.replace("www.", "");
              } catch {
                // Ignore invalid URLs
              }

              return (
                <SortableBookmark
                  key={bookmark.id}
                  onDelete={onDeleteBookmark}
                  bookmark={{
                    id: bookmark.id,
                    title: bookmark.title,
                    url: bookmark.url,
                    domain: domain,
                    favicon: bookmark.favicon_url || undefined,
                    createdAt: new Date(bookmark.created_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    ),
                    groupId: bookmark.group_id || "all",
                    is_enriching: bookmark.is_enriching || false,
                  }}
                />
              );
            })}
          </div>
        </SortableContext>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: "0.4",
                    },
                  },
                }),
              }}
            >
              {activeBookmark
                ? (() => {
                    let domain = "link";
                    try {
                      domain = new URL(activeBookmark.url).hostname.replace(
                        "www.",
                        "",
                      );
                    } catch {
                      // Ignore
                    }

                    return (
                      <div className="flex items-center justify-between rounded-xl bg-background/95 border border-primary/20 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-md scale-[1.02] ring-1 ring-primary/5">
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
    </div>
  );
}
