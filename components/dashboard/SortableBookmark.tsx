"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PencilEdit01Icon,
  Copy01Icon,
  Tick01Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
  Alert02Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkType } from "@/types/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Favicon } from "./Favicon";

interface SortableBookmarkProps {
  bookmark: BookmarkType & { is_enriching?: boolean };
  onDelete?: (id: string) => void;
}

export function SortableBookmark({
  bookmark,
  onDelete,
}: SortableBookmarkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

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

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleteConfirm) {
      // Second click - Actually delete
      onDelete?.(bookmark.id);
    } else {
      // First click - Show warning
      setIsDeleteConfirm(true);
      // Reset after 3 seconds if not clicked again
      setTimeout(() => setIsDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center justify-between rounded-2xl px-4 py-1.5 transition-all duration-200 hover:bg-muted/50 active:scale-[0.99] cursor-grab active:cursor-grabbing ${
        isDragging
          ? "z-50 shadow-2xl bg-background border border-primary/20 scale-[1.02]"
          : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Favicon Container */}
        <div onClick={openInNewTab}>
          <Favicon
            url={bookmark.favicon || ""}
            domain={bookmark.domain || ""}
            title={bookmark.title || ""}
            isEnriching={bookmark.is_enriching}
          />
        </div>

        {/* Text Content - Limited width to prevent overflow */}
        <div className="flex min-w-0 flex-col gap-0.5 max-w-[calc(100%-200px)] md:max-w-[calc(100%-300px)]">
          <span
            className={`truncate text-sm font-bold transition-all cursor-pointer ${
              bookmark.is_enriching
                ? "text-muted-foreground/30 animate-shimmer bg-linear-to-r from-transparent via-muted/40 to-transparent bg-size-[200%_100%] rounded-md px-2 -ml-2"
                : "text-foreground group-hover:text-primary"
            }`}
            onClick={openInNewTab}
          >
            {bookmark.title}
          </span>
          <span
            className={`text-xs font-medium cursor-pointer transition-all truncate ${
              bookmark.is_enriching
                ? "text-muted-foreground/10 animate-shimmer bg-linear-to-r from-transparent via-muted/20 to-transparent bg-size-[200%_100%] rounded-md px-2 -ml-2 h-3"
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
            bookmark.is_enriching
              ? "animate-shimmer bg-linear-to-r from-transparent via-muted/30 to-transparent bg-size-[200%_100%] px-2 rounded-md"
              : ""
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
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
              aria-label="Edit bookmark"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
              onClick={handleCopyLink}
              aria-label="Copy link"
            >
              <HugeiconsIcon
                icon={isCopied ? Tick01Icon : Copy01Icon}
                size={16}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
              onClick={openInNewTab}
              aria-label="Open link"
            >
              <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-xl hover:shadow-sm cursor-pointer transition-colors ${
                isDeleteConfirm
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  : "hover:bg-destructive/10 hover:text-destructive"
              }`}
              onClick={handleDelete}
              aria-label={
                isDeleteConfirm
                  ? "Click again to confirm delete"
                  : "Delete bookmark"
              }
            >
              <HugeiconsIcon
                icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                size={16}
              />
            </Button>
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
                  <HugeiconsIcon
                    icon={MoreVerticalIcon}
                    size={16}
                    className="text-muted-foreground/60"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-2xl p-2 shadow-2xl ring-1 ring-black/5"
              >
                <DropdownMenuItem className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5">
                  <HugeiconsIcon icon={PencilEdit01Icon} size={16} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5"
                  onClick={handleCopyLink}
                >
                  <HugeiconsIcon
                    icon={isCopied ? Tick01Icon : Copy01Icon}
                    size={16}
                  />
                  {isCopied ? "Copied!" : "Copy Link"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5"
                  onClick={openInNewTab}
                >
                  <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} /> Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-xl flex items-center gap-2 cursor-pointer font-medium ${
                    isDeleteConfirm
                      ? "text-destructive bg-destructive/5 focus:bg-destructive/10 focus:text-destructive"
                      : "text-destructive focus:bg-destructive/5 focus:text-destructive"
                  }`}
                  onClick={handleDelete}
                >
                  <HugeiconsIcon
                    icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                    size={16}
                  />
                  {isDeleteConfirm ? "Click to Confirm" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
