"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bookmark as BookmarkIcon,
  Pencil,
  Copy,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkType } from "@/types/dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const openInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://${bookmark.domain}`, "_blank");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 hover:bg-muted/50 active:scale-[0.99] cursor-grab active:cursor-grabbing ${
        isDragging
          ? "z-50 shadow-2xl bg-background border border-primary/20 scale-[1.02]"
          : ""
      }`}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-3"
        onClick={openInNewTab}
      >
        {/* Favicon Container */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm group-hover:shadow-md transition-shadow">
          {bookmark.favicon ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="h-6 w-6 rounded-sm object-contain"
            />
          ) : (
            <BookmarkIcon className="h-5 w-5 text-muted-foreground/60" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-bold text-foreground md:text-base group-hover:text-primary transition-colors">
            {bookmark.title}
          </span>
          <span className="text-xs font-medium text-muted-foreground/70">
            {bookmark.domain}
          </span>
        </div>
      </div>

      {/* Actions / Date Container */}
      <div className="flex shrink-0 items-center min-w-25 justify-end">
        {/* Date: Visible by default, hidden on hover */}
        <span className="text-sm font-medium text-muted-foreground/50 group-hover:hidden transition-all tabular-nums">
          {bookmark.createdAt}
        </span>

        {/* Action Buttons: Visible only on hover */}
        <div
          className="hidden items-center gap-1 group-hover:flex animate-in fade-in-0 slide-in-from-right-2 duration-200"
          onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking icons
          onPointerDown={(e) => e.stopPropagation()} // Essential for dnd-kit with whole-row drag
        >
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg bg-foreground text-background font-medium">
                Edit
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg bg-foreground text-background font-medium">
                Copy Link
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm"
                  onClick={openInNewTab}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg bg-foreground text-background font-medium">
                Open
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg bg-destructive text-destructive-foreground font-medium">
                Delete
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
