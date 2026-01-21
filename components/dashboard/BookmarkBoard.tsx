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
  ],
};

export function BookmarkBoard() {
  const [data, setData] = useState(MOCK_BOOKMARKS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const currentBookmarks = data["all"];

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
      <div className="flex items-center justify-between border-b pb-4 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
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
          <div className="flex flex-col">
            {currentBookmarks.map((bookmark) => (
              <SortableBookmark key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay for that premium snappy look */}
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
              {activeId ? (
                <div className="flex items-center justify-between border-b border-border/40 bg-background px-4 py-4 shadow-2xl rounded-xl ring-2 ring-primary/20 scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg border bg-background shadow-sm" />
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold">
                        {currentBookmarks.find((b) => b.id === activeId)?.title}
                      </span>
                    </div>
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
