"use client";

import React, { useState } from "react";
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
import { Bookmark } from "@/types/dashboard";
import { SortableBookmark } from "./SortableBookmark";
import { createPortal } from "react-dom";
import { Bookmark as BookmarkIcon } from "lucide-react";

const MOCK_BOOKMARKS: Record<string, Bookmark[]> = {
  all: [
    {
      id: "1",
      title:
        "GitHub - zaidmukaddam/scira: Scira (Formerly MiniPerplx) is a minimalistic AI-p...",
      domain: "github.com",
      favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
      createdAt: "Jan 6",
      groupId: "all",
    },
    {
      id: "2",
      title: "AI SDK",
      domain: "ai-sdk.dev",
      favicon: "https://www.google.com/s2/favicons?domain=ai-sdk.dev&sz=64",
      createdAt: "Jan 6",
      groupId: "all",
    },
    {
      id: "3",
      title: "Anannas - Single API to access any model",
      domain: "anannas.ai",
      favicon: "https://www.google.com/s2/favicons?domain=anannas.ai&sz=64",
      createdAt: "Jan 6",
      groupId: "all",
    },
    {
      id: "4",
      title: "Zaid (@zaidmukaddam) on X",
      domain: "x.com",
      favicon: "https://www.google.com/s2/favicons?domain=x.com&sz=64",
      createdAt: "Jan 6",
      groupId: "all",
    },
  ],
};

export function BookmarkBoard() {
  const [data, setData] = useState(MOCK_BOOKMARKS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased distance to distinguish between click and drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const currentBookmarks = data["all"];
  const activeBookmark = activeId
    ? currentBookmarks.find((b) => b.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev["all"].findIndex((b) => b.id === active.id);
        const newIndex = prev["all"].findIndex((b) => b.id === over.id);

        return {
          ...prev,
          all: arrayMove(prev["all"], oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl px-4 md:px-0">
      <div className="flex items-center justify-between px-4 pb-4 text-[11px] font-bold tracking-widest text-muted-foreground/40 uppercase">
        <span>Title</span>
        <span>Created At</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={currentBookmarks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {currentBookmarks.map((bookmark) => (
              <SortableBookmark key={bookmark.id} bookmark={bookmark} />
            ))}
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
              {activeBookmark ? (
                <div className="flex items-center justify-between rounded-xl bg-background/95 border border-primary/20 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-md scale-[1.02] ring-1 ring-primary/5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm">
                      {activeBookmark.favicon ? (
                        <img
                          src={activeBookmark.favicon}
                          alt=""
                          className="h-6 w-6 rounded-sm object-contain"
                        />
                      ) : (
                        <BookmarkIcon className="h-5 w-5 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-bold text-foreground">
                        {activeBookmark.title}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {activeBookmark.domain}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center pl-6">
                    <span className="text-sm font-medium text-muted-foreground/50">
                      {activeBookmark.createdAt}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
  );
}
