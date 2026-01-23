"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PencilEdit01Icon,
  Copy01Icon,
  Tick01Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
  Alert02Icon,
  GridIcon,
  Link01Icon,
  File02Icon,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Favicon } from "./Favicon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GroupRow } from "@/lib/supabase/queries";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";

interface SortableBookmarkProps {
  bookmark: BookmarkType & { status?: string | null };
  onDelete?: (id: string) => void;
  groups?: GroupRow[];
  isSelected?: boolean;
  onEdit?: (
    id: string,
    data: {
      title: string;
      url: string;
      description?: string;
      group_id?: string;
    },
  ) => Promise<void>;
}

export const SortableBookmark = memo(function SortableBookmark({
  bookmark,
  onDelete,
  isSelected,
  groups = [],
  onEdit,
}: SortableBookmarkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(bookmark.title || "");
  const [editUrl, setEditUrl] = useState(bookmark.url);
  const [editDescription, setEditDescription] = useState("");
  const [editGroupId, setEditGroupId] = useState(
    bookmark.groupId || "no-group",
  );
  const [isSaving, setIsSaving] = useState(false);

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(bookmark.title || "");
    setEditUrl(bookmark.url);
    setEditDescription(bookmark.description || "");
    setEditGroupId(bookmark.groupId || "no-group");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(bookmark.title || "");
    setEditUrl(bookmark.url);
    setEditDescription("");
    setEditGroupId(bookmark.groupId || "no-group");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editUrl.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onEdit?.(bookmark.id, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        description: editDescription.trim() || undefined,
        group_id: editGroupId === "no-group" ? undefined : editGroupId,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save bookmark:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline Edit Mode
  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group relative flex flex-col rounded-2xl p-3 bg-muted/20 border border-border/30 space-y-3 shadow-sm"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2.5">
          {/* Main Info Row: Icon/Group & Title */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95"
                >
                  {editGroupId === "no-group" ? (
                    <HugeiconsIcon
                      icon={GridIcon}
                      size={16}
                      className="text-muted-foreground/50"
                    />
                  ) : (
                    (() => {
                      const group = groups.find((g) => g.id === editGroupId);
                      const Icon =
                        group?.icon && ALL_ICONS_MAP[group.icon]
                          ? ALL_ICONS_MAP[group.icon]
                          : GridIcon;
                      return (
                        <HugeiconsIcon
                          icon={Icon}
                          size={16}
                          className="text-primary"
                        />
                      );
                    })()
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 rounded-xl p-1 shadow-2xl"
              >
                <DropdownMenuItem
                  className={`rounded-lg flex items-center gap-2 cursor-pointer ${editGroupId === "no-group" ? "bg-primary/5 text-primary font-bold" : ""}`}
                  onClick={() => setEditGroupId("no-group")}
                >
                  <HugeiconsIcon icon={GridIcon} size={14} />
                  No Group
                </DropdownMenuItem>
                {groups.length > 0 ? (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <div className="max-h-60 overflow-y-auto">
                      {groups.map((group) => {
                        const Icon =
                          group.icon && ALL_ICONS_MAP[group.icon]
                            ? ALL_ICONS_MAP[group.icon]
                            : GridIcon;
                        return (
                          <DropdownMenuItem
                            key={group.id}
                            className={`rounded-lg flex items-center gap-2 cursor-pointer ${editGroupId === group.id ? "bg-primary/5 text-primary font-bold" : ""}`}
                            onClick={() => setEditGroupId(group.id)}
                          >
                            <HugeiconsIcon icon={Icon} size={14} />
                            <span className="truncate">{group.name}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="h-9 flex-1 bg-background/50 border-border/50 rounded-xl text-sm font-bold focus-visible:ring-primary/20"
              autoFocus
            />
          </div>

          {/* URL Row */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/30 border border-dashed border-border/50">
              <HugeiconsIcon
                icon={Link01Icon}
                size={14}
                className="text-muted-foreground/30"
              />
            </div>
            <Input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="URL"
              className="h-9 flex-1 bg-background/50 border-border/50 rounded-xl text-xs font-medium text-muted-foreground focus-visible:ring-primary/20"
            />
          </div>

          {/* Description Row */}
          <div className="flex gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/30 border border-dashed border-border/50">
              <HugeiconsIcon
                icon={File02Icon}
                size={14}
                className="text-muted-foreground/30"
              />
            </div>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (Optional)"
              className="flex-1 bg-background/50 border-border/50 rounded-xl text-xs py-2 min-h-15 resize-none focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs rounded-4xl font-bold"
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 text-xs font-bold rounded-4xl shadow-sm"
            onClick={handleSaveEdit}
            disabled={!editTitle.trim() || !editUrl.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    );
  }

  // Normal Bookmark View
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center justify-between rounded-2xl px-4 py-1.5 transition-all duration-200 hover:bg-muted/50 active:scale-[0.99] cursor-grab active:cursor-grabbing ${
        isDragging
          ? "z-50 shadow-2xl bg-background border border-primary/20 scale-[1.02]"
          : isSelected
            ? "bg-primary/5 border border-primary/20 shadow-sm"
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
            isEnriching={bookmark.status === "pending"}
          />
        </div>

        {/* Text Content - Limited width to prevent overflow */}
        <div className="flex min-w-0 flex-col gap-0.5 max-w-[calc(100%-150px)] md:max-w-[calc(100%-450px)]">
          <span
            className={`truncate text-sm font-bold transition-all cursor-pointer ${
              bookmark.status === "pending"
                ? "text-muted-foreground/30 animate-shimmer bg-linear-to-r from-transparent via-muted/40 to-transparent bg-size-[200%_100%] rounded-lg px-2 -ml-2"
                : "text-foreground group-hover:text-primary"
            }`}
            onClick={openInNewTab}
          >
            {bookmark.title}
          </span>
          <span
            className={`text-xs font-medium cursor-pointer transition-all truncate ${
              bookmark.status === "pending"
                ? "text-muted-foreground/10 animate-shimmer bg-linear-to-r from-transparent via-muted/20 to-transparent bg-size-[200%_100%] rounded-lg px-2 -ml-2 h-3"
                : "text-muted-foreground/70"
            }`}
            onClick={openInNewTab}
          >
            {bookmark.status === "pending" ? "" : bookmark.domain}
          </span>
        </div>
      </div>

      {/* Actions / Date Container */}
      <div className="relative flex shrink-0 items-center min-w-25 justify-end">
        {/* Desktop Date: Fades out on hover if not mobile */}
        <span
          className={`text-sm font-medium text-muted-foreground/50 transition-all duration-200 tabular-nums md:block group-hover:opacity-0 ${
            bookmark.status === "pending"
              ? "animate-shimmer bg-linear-to-r from-transparent via-muted/30 to-transparent bg-size-[200%_100%] px-2 rounded-lg"
              : ""
          }`}
        >
          {bookmark.status === "pending" ? "Enriching..." : bookmark.createdAt}
        </span>

        {/* Desktop Action Buttons: Visible only on hover and on desktop */}
        {bookmark.status !== "pending" ? (
          <div
            className="absolute right-0 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary hover:shadow-sm cursor-pointer"
              onClick={handleEdit}
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
              <div
                className="transition-all duration-200 ease-in-out"
                key={isCopied ? "tick" : "copy"}
              >
                <HugeiconsIcon
                  icon={isCopied ? Tick01Icon : Copy01Icon}
                  size={16}
                />
              </div>
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
              <div
                className="transition-all duration-200 ease-in-out"
                key={isDeleteConfirm ? "alert" : "delete"}
              >
                <HugeiconsIcon
                  icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                  size={16}
                />
              </div>
            </Button>
          </div>
        ) : null}

        {/* Mobile Action Menu */}
        {bookmark.status !== "pending" ? (
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
                <DropdownMenuItem
                  className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5"
                  onClick={handleEdit}
                >
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
        ) : null}
      </div>
    </div>
  );
});
