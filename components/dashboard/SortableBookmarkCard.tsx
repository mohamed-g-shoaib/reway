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
  Tick01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Favicon } from "./Favicon";
import { GroupRow } from "@/lib/supabase/queries";

interface SortableBookmarkCardProps {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon?: string;
  createdAt: string;
  groupId: string;
  rowContent?: "date" | "group";
  groupsMap?: Map<string, GroupRow>;
  activeGroupId?: string;
  isSelected?: boolean;
  selectionMode?: boolean;
  isSelectionChecked?: boolean;
  onToggleSelection?: (id: string) => void;
  onEnterSelectionMode?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function SortableBookmarkCard({
  id,
  title,
  url,
  domain,
  favicon,
  createdAt,
  groupId,
  rowContent = "date",
  groupsMap,
  activeGroupId,
  isSelected,
  selectionMode = false,
  isSelectionChecked = false,
  onToggleSelection,
  onEnterSelectionMode,
  onDelete,
  onEdit,
  onPreview,
}: SortableBookmarkCardProps) {
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

  const metaLabel =
    rowContent === "group" &&
    activeGroupId !== "all" &&
    activeGroupId === groupId
      ? createdAt
      : rowContent === "group"
        ? groupsMap?.get(groupId)?.name || "No Group"
        : createdAt;

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
          style={{ ...style, contentVisibility: "auto" }}
          {...attributes}
          {...(selectionMode ? {} : listeners)}
          data-slot="bookmark-card"
          className={`group relative flex flex-col gap-3 rounded-2xl bg-muted/20 p-4 ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate hover:bg-muted/30 overflow-hidden cursor-grab active:cursor-grabbing ${
            isSelectionChecked || isSelected ? "ring-2 ring-primary/30" : ""
          } ${isDragging ? "opacity-0" : ""}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {selectionMode ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleSelection?.(id);
                }}
                className="size-9 shrink-0 flex items-center justify-center rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-transform duration-150 active:scale-95"
                aria-label={
                  isSelectionChecked ? "Deselect bookmark" : "Select bookmark"
                }
              >
                <div
                  className={`size-4 rounded border-2 flex items-center justify-center ${
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
                  className="h-9 w-9"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                <span className="cursor-pointer" onClick={handleOpen}>
                  {title}
                </span>
              </p>
              <p className="truncate text-xs text-muted-foreground/70">
                <span className="cursor-pointer" onClick={handleOpen}>
                  {domain}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground/70">
            <span className="truncate max-w-[70%]">{metaLabel}</span>
            <div
              className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:transition-[opacity,transform] md:duration-200 md:ease-out"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-background hover:text-primary cursor-pointer transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={handleEdit}
                aria-label="Edit bookmark"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-background hover:text-primary cursor-pointer transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={handleCopy}
                aria-label={isCopied ? "URL copied" : "Copy link"}
              >
                <div
                  className="transition-transform duration-200 ease-in-out"
                  key={isCopied ? "tick" : "copy"}
                >
                  <HugeiconsIcon
                    icon={isCopied ? Tick01Icon : Copy01Icon}
                    size={14}
                    className={isCopied ? "text-green-500" : ""}
                  />
                </div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-background hover:text-primary cursor-pointer transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={handleOpen}
                aria-label="Open link"
              >
                <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-lg transition-transform duration-150 ease-out cursor-pointer text-destructive hover:text-destructive active:scale-[0.97] motion-reduce:transition-none ${
                  isDeleteConfirm
                    ? "bg-destructive/10 hover:bg-destructive/20"
                    : "hover:bg-destructive/10"
                }`}
                onClick={handleDelete}
                aria-label={
                  isDeleteConfirm
                    ? "Confirm delete bookmark"
                    : "Delete bookmark"
                }
              >
                <HugeiconsIcon
                  icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                  size={14}
                />
              </Button>
            </div>
          </div>
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
