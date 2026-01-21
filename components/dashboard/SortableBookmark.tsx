"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bookmark as BookmarkIcon,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkType } from "@/types/dashboard";

interface SortableBookmarkProps {
  bookmark: BookmarkType;
}

export function SortableBookmark({ bookmark }: SortableBookmarkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between border-b border-border/40 bg-background/50 py-4 transition-colors hover:bg-muted/30 ${
        isDragging ? "z-50 shadow-xl border-primary/20" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-muted-foreground/30 hover:text-muted-foreground group-hover:block hidden"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="h-5 w-5 rounded-sm" />
          ) : (
            <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground md:text-base">
            {bookmark.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {bookmark.domain}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <span className="text-sm text-muted-foreground">
          {bookmark.createdAt}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground md:flex hidden"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
