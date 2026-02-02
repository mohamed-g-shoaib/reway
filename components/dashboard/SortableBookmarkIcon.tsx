"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUpRight03Icon,
  Copy01Icon,
  Delete02Icon,
  Alert02Icon,
  PencilEdit01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Favicon } from "./Favicon";

interface SortableBookmarkIconProps {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon?: string;
  isSelected?: boolean;
  selectionMode?: boolean;
  isSelectionChecked?: boolean;
  onToggleSelection?: (id: string) => void;
  onEnterSelectionMode?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function SortableBookmarkIcon({
  id,
  title,
  url,
  domain,
  favicon,
  isSelected,
  selectionMode = false,
  isSelectionChecked = false,
  onToggleSelection,
  onEnterSelectionMode,
  onDelete,
  onEdit,
  onPreview,
}: SortableBookmarkIconProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    touchAction: selectionMode ? "auto" : "none",
  };

  const handleOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDeleteConfirm) {
      onDelete?.(id);
      setIsDeleteConfirm(false);
      return;
    }
    setIsDeleteConfirm(true);
    setTimeout(() => setIsDeleteConfirm(false), 3000);
  };

  const handleEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onEdit?.(id);
  };

  const handlePreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onPreview?.(id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...(selectionMode ? {} : listeners)}
          data-slot="bookmark-card"
          className={`group relative flex flex-col items-center gap-3 rounded-2xl bg-muted/20 p-4 text-center ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate transition-[background-color,transform,box-shadow] duration-200 ease-out hover:bg-muted/30 overflow-hidden cursor-grab active:cursor-grabbing ${
            isSelectionChecked || isSelected ? "ring-2 ring-primary/30" : ""
          } ${isDragging ? "opacity-0" : ""}`}
        >
          {selectionMode ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelection?.(id);
              }}
              className="size-12 flex items-center justify-center rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors active:scale-95"
              aria-label={
                isSelectionChecked ? "Deselect bookmark" : "Select bookmark"
              }
            >
              <div
                className={`size-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelectionChecked
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelectionChecked && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-primary-foreground"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          ) : (
            <div
              className="cursor-pointer"
              onClick={(event) => {
                if (event.shiftKey) {
                  event.preventDefault();
                  event.stopPropagation();
                  onEnterSelectionMode?.();
                  onToggleSelection?.(id);
                  return;
                }
                handleOpen(event);
              }}
            >
              <Favicon
                url={favicon || ""}
                domain={domain}
                title={title}
                className="h-12 w-12"
              />
            </div>
          )}
          <span className="text-xs font-semibold text-foreground truncate w-full">
            <span
              className="cursor-pointer transition-colors duration-200 ease-out hover:text-primary"
              onClick={handleOpen}
            >
              {title}
            </span>
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuItem className="gap-2" onClick={handleOpen}>
          <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
          Open
        </ContextMenuItem>
        <ContextMenuItem className="gap-2" onClick={handleCopy}>
          <HugeiconsIcon icon={Copy01Icon} size={14} />
          {isCopied ? "Copied" : "Copy"}
        </ContextMenuItem>
        <ContextMenuItem className="gap-2" onClick={handlePreview}>
          <HugeiconsIcon icon={ViewIcon} size={14} />
          Preview
        </ContextMenuItem>
        <ContextMenuSeparator className="my-1" />
        <ContextMenuItem className="gap-2" onClick={handleEdit}>
          <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          className={`gap-2 ${
            isDeleteConfirm
              ? "text-destructive bg-destructive/10"
              : "text-destructive"
          }`}
          onClick={handleDelete}
        >
          <HugeiconsIcon
            icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
            size={14}
          />
          {isDeleteConfirm ? "Confirm" : "Delete"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
