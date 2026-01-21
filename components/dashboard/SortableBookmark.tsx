"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bookmark as BookmarkIcon,
  Pencil,
  Copy,
  ExternalLink,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkType } from "@/types/dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortableBookmarkProps {
  bookmark: BookmarkType & { is_enriching?: boolean };
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
    window.open(bookmark.url, "_blank");
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
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Favicon Container */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm hover:shadow-md transition-all cursor-pointer ${
            bookmark.is_enriching
              ? "animate-pulse bg-muted/30 border-muted/50"
              : ""
          }`}
          onClick={openInNewTab}
        >
          {bookmark.favicon && !bookmark.is_enriching ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="h-6 w-6 rounded-sm object-contain"
            />
          ) : (
            <BookmarkIcon
              className={`h-5 w-5 ${bookmark.is_enriching ? "text-muted-foreground/20" : "text-muted-foreground/60"}`}
            />
          )}
        </div>

        {/* Text Content */}
        <div className="flex min-w-0 flex-col gap-0.5 w-fit">
          <span
            className={`w-fit max-w-full truncate text-sm font-bold transition-all cursor-pointer md:text-base ${
              bookmark.is_enriching
                ? "text-muted-foreground/30 animate-pulse bg-muted/20 rounded-md px-2 -ml-2"
                : "text-foreground group-hover:text-primary"
            }`}
            onClick={openInNewTab}
          >
            {bookmark.title}
          </span>
          <span
            className={`w-fit text-xs font-medium cursor-pointer transition-all ${
              bookmark.is_enriching
                ? "text-muted-foreground/10 animate-pulse bg-muted/10 rounded-md px-2 -ml-2 h-3"
                : "text-muted-foreground/70"
            }`}
            onClick={openInNewTab}
          >
            {bookmark.is_enriching ? "" : bookmark.domain}
          </span>
        </div>
      </div>

      {/* Actions / Date Container */}
      <div className="relative flex shrink-0 items-center min-w-25 justify-end">
        {/* Desktop Date: Fades out on hover if not mobile */}
        <span
          className={`text-sm font-medium text-muted-foreground/50 transition-all duration-200 tabular-nums md:block group-hover:opacity-0 ${
            bookmark.is_enriching ? "animate-pulse" : ""
          }`}
        >
          {bookmark.is_enriching ? "Enriching..." : bookmark.createdAt}
        </span>

        {/* Desktop Action Buttons: Visible only on hover and on desktop */}
        {!bookmark.is_enriching && (
          <div
            className="absolute right-0 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
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
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
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
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
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
                  className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:shadow-sm cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg bg-destructive text-destructive-foreground font-medium [&_svg]:fill-destructive [&_svg]:bg-destructive">
                Delete
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Mobile Action Menu */}
        {!bookmark.is_enriching && (
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-2xl p-2 shadow-2xl ring-1 ring-black/5"
              >
                <DropdownMenuItem className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5">
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5">
                  <Copy className="h-4 w-4" /> Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5"
                  onClick={openInNewTab}
                >
                  <ExternalLink className="h-4 w-4" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/5 focus:text-destructive font-medium">
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
