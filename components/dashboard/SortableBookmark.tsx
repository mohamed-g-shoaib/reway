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
  MoreVerticalIcon,
  ArrowDown01Icon,
  GridIcon,
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
import { Label } from "@/components/ui/label";
import { GroupRow } from "@/lib/supabase/queries";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";

interface SortableBookmarkProps {
  bookmark: BookmarkType & { is_enriching?: boolean };
  onDelete?: (id: string) => void;
  groups?: GroupRow[];
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
        className="group relative flex flex-col rounded-2xl px-4 py-4 bg-muted/20 border border-border/30 space-y-3"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor={`title-${bookmark.id}`}
              className="text-xs font-semibold text-muted-foreground"
            >
              Title
            </Label>
            <Input
              id={`title-${bookmark.id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Bookmark title"
              className="h-9 text-sm rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`url-${bookmark.id}`}
              className="text-xs font-semibold text-muted-foreground"
            >
              URL
            </Label>
            <Input
              id={`url-${bookmark.id}`}
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://..."
              className="h-9 text-sm rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`description-${bookmark.id}`}
              className="text-xs font-semibold text-muted-foreground"
            >
              Description (Optional)
            </Label>
            <Textarea
              id={`description-${bookmark.id}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
              className="text-sm rounded-xl resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`group-${bookmark.id}`}
              className="text-xs font-semibold text-muted-foreground"
            >
              Group
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 rounded-xl justify-between px-3 font-normal"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {editGroupId === "no-group" ? (
                      <>
                        <HugeiconsIcon
                          icon={GridIcon}
                          size={14}
                          className="text-muted-foreground/50"
                        />
                        <span className="truncate">No group</span>
                      </>
                    ) : (
                      (() => {
                        const group = groups.find((g) => g.id === editGroupId);
                        const Icon =
                          group?.icon && ALL_ICONS_MAP[group.icon]
                            ? ALL_ICONS_MAP[group.icon]
                            : GridIcon;
                        return (
                          <>
                            <HugeiconsIcon
                              icon={Icon}
                              size={14}
                              className="text-primary"
                            />
                            <span className="truncate font-medium">
                              {group?.name || "Select group"}
                            </span>
                          </>
                        );
                      })()
                    )}
                  </div>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={14}
                    className="text-muted-foreground/30 shrink-0"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-4rem)] md:w-64 rounded-xl p-1 animate-in slide-in-from-top-1 duration-200">
                <DropdownMenuItem
                  className={`rounded-lg flex items-center gap-2 cursor-pointer ${editGroupId === "no-group" ? "bg-primary/5 text-primary font-bold" : ""}`}
                  onClick={() => setEditGroupId("no-group")}
                >
                  <HugeiconsIcon icon={GridIcon} size={14} />
                  No group
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
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/10">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-4 rounded-xl"
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 rounded-xl"
            onClick={handleSaveEdit}
            disabled={!editTitle.trim() || !editUrl.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
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
        <div className="flex min-w-0 flex-col gap-0.5 max-w-[calc(100%-150px)] md:max-w-[calc(100%-450px)]">
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
        {!bookmark.is_enriching ? (
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
        {!bookmark.is_enriching ? (
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
