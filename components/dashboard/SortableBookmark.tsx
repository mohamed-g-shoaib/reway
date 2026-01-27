"use client";

import { useState, memo, useEffect } from "react";
import TextShimmer from "@/components/ui/text-shimmer";
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
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { GroupRow } from "@/lib/supabase/queries";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import { toast } from "sonner";

interface SortableBookmarkProps {
  id: string;
  title: string;
  url: string;
  domain: string;
  status: string;
  favicon?: string;
  description?: string;
  createdAt: string;
  groupId: string;
  onDelete?: (id: string) => void;
  groups?: GroupRow[];
  groupsMap?: Map<string, GroupRow>;
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
  isEditing?: boolean;
  onEditDone?: () => void;
  onPreview?: (id: string) => void;
  rowContent?: "date" | "group";
}

export const SortableBookmark = memo(function SortableBookmark({
  id,
  title,
  url,
  domain,
  status,
  favicon,
  description,
  createdAt,
  groupId,
  onDelete,
  groupsMap,
  isSelected,
  onEdit,
  groups = [],
  isEditing: forceEditing,
  onEditDone,
  onPreview,
  rowContent = "date",
}: SortableBookmarkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title || "");
  const [editUrl, setEditUrl] = useState(url);
  const [editDescription, setEditDescription] = useState("");
  const [editGroupId, setEditGroupId] = useState(groupId || "no-group");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (forceEditing) {
      setIsEditing(true);
      setEditTitle(title || "");
      setEditUrl(url);
      setEditDescription(description || "");
      setEditGroupId(groupId || "no-group");
    }
  }, [forceEditing, title, url, description, groupId]);

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
  };

  const dragStyle = isDragging 
    ? "z-50 bg-background ring-1 ring-primary/20" 
    : isSelected
      ? "bg-foreground/4 ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] isolate shadow-none"
      : "";

  const openInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleteConfirm) {
      // Second click - Actually delete
      onDelete?.(id);
      toast.error("Bookmark deleted");
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
    setEditTitle(title || "");
    setEditUrl(url);
    setEditDescription(description || "");
    setEditGroupId(groupId || "no-group");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(title || "");
    setEditUrl(url);
    setEditDescription("");
    setEditGroupId(groupId || "no-group");
    onEditDone?.();
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editUrl.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onEdit?.(id, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        description: editDescription.trim() || undefined,
        group_id: editGroupId === "no-group" ? undefined : editGroupId,
      });
      setIsEditing(false);
      onEditDone?.();
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
        className={`group relative flex flex-col rounded-2xl p-3 bg-muted/20 ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate space-y-3 ${
          isDragging ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors active:scale-95"
                >
                  {editGroupId === "no-group" ? (
                    <HugeiconsIcon
                      icon={GridIcon}
                      size={16}
                      className="text-muted-foreground/50"
                    />
                  ) : (
                    (() => {
                      const group = groupsMap?.get(editGroupId);
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
                className="w-56 rounded-2xl p-2 ring-1 ring-foreground/5 shadow-none isolate after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-['']"
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEdit();
                }
              }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEdit();
                }
              }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEdit();
                }
              }}
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
            className="h-8 px-4 text-xs font-bold rounded-4xl"
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          className={`group relative flex items-center justify-between rounded-2xl px-4 py-1.5 transition-colors duration-200 ${
            status === "pending"
              ? "pointer-events-none"
              : "hover:bg-muted/50 cursor-grab active:cursor-grabbing"
          } ${dragStyle} ${
            isDragging ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
          }}
          {...attributes}
          {...listeners}
          data-slot="bookmark-card"
          role="button"
          tabIndex={status === "pending" ? -1 : 0}
          aria-roledescription="Draggable bookmark"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Favicon Container */}
            <div onClick={openInNewTab}>
              <Favicon
                url={favicon || ""}
                domain={domain || ""}
                title={title || ""}
                isEnriching={status === "pending"}
              />
            </div>

            {/* Text Content - Multi-stage truncation to avoid actions while remaining generous */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-8 md:pr-36">
              <div className="w-fit max-w-full">
                {status === "pending" ? (
                  <TextShimmer
                    as="span"
                    className="block truncate text-sm font-semibold"
                    duration={2.5}
                  >
                    {title || "Loading..."}
                  </TextShimmer>
                ) : (
                  <span
                    className="block truncate text-sm font-semibold transition-colors cursor-pointer text-foreground group-hover:text-primary"
                    onClick={openInNewTab}
                  >
                    {title}
                  </span>
                )}
              </div>
              <div className="w-fit max-w-full h-4">
                {status === "pending" ? (
                  <TextShimmer
                    as="span"
                    className="block truncate text-xs font-medium"
                    duration={2.5}
                    delay={0.2}
                  >
                    Fetching details...
                  </TextShimmer>
                ) : (
                  <span
                    className="block truncate text-xs font-medium cursor-pointer transition-colors text-muted-foreground/70 group-hover:text-muted-foreground"
                    onClick={openInNewTab}
                  >
                    {domain}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions / Date Container */}
          <div className="relative flex shrink-0 items-center min-w-0 md:min-w-25 justify-end">
            {/* Desktop Date: Fades out on hover if not mobile */}
            {status === "pending" ? (
              <TextShimmer
                as="span"
                className="text-sm font-medium tabular-nums"
                duration={2.5}
                delay={0.4}
              >
                Enriching...
              </TextShimmer>
            ) : (
              <span className="text-xs font-medium text-muted-foreground/60 transition-opacity duration-200 tabular-nums md:block group-hover:opacity-0 max-w-20 truncate text-right">
                {rowContent === "group"
                  ? (() => {
                      if (groupId === "all" || !groupsMap || !groupId)
                        return "No Group";
                      const group = groupsMap.get(groupId);
                      return group?.name || "No Group";
                    })()
                  : createdAt}
              </span>
            )}

            {/* Desktop Action Buttons: Visible only on hover and on desktop */}
            {status !== "pending" ? (
              <div
                className="absolute right-0 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 cursor-default"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary cursor-pointer"
                  onClick={handleEdit}
                  aria-label="Edit bookmark"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary cursor-pointer"
                  onClick={handleCopyLink}
                  aria-label={isCopied ? "URL copied" : "Copy link"}
                >
                  <div
                    className="transition-transform duration-200 ease-in-out"
                    key={isCopied ? "tick" : "copy"}
                  >
                    <HugeiconsIcon
                      icon={isCopied ? Tick01Icon : Copy01Icon}
                      size={16}
                      className={isCopied ? "text-green-500" : ""}
                    />
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary cursor-pointer"
                  onClick={openInNewTab}
                  aria-label="Open link in new tab"
                >
                  <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 rounded-xl transition-colors duration-200 cursor-pointer text-destructive hover:text-destructive ${
                    isDeleteConfirm
                      ? "bg-destructive/10 hover:bg-destructive/20"
                      : "hover:bg-destructive/10"
                  }`}
                  onClick={handleDelete}
                  aria-label={
                    isDeleteConfirm
                      ? "Click again to confirm delete"
                      : "Delete bookmark"
                  }
                >
                  <div
                    className="transition-transform duration-200 ease-in-out"
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
            {status !== "pending" ? (
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 -mr-3 rounded-xl hover:bg-muted/50 cursor-pointer"
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
                    className="w-40 rounded-2xl p-2 ring-1 ring-foreground/5 shadow-none isolate after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-['']"
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
                        className={isCopied ? "text-green-500" : ""}
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
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56 rounded-2xl p-1.5">
        <ContextMenuItem
          className="rounded-xl flex items-center gap-2.5 py-2"
          onClick={openInNewTab}
        >
          <HugeiconsIcon
            icon={ArrowUpRight03Icon}
            size={16}
            className="text-muted-foreground"
          />
          <span>Open in New Tab</span>
          <ContextMenuShortcut>⏎</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          className="rounded-xl flex items-center gap-2.5 py-2"
          onClick={() => onPreview?.(id)}
        >
          <HugeiconsIcon
            icon={ViewIcon}
            size={16}
            className="text-muted-foreground"
          />
          <span>Quick Glance</span>
          <ContextMenuShortcut>Space</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          className="rounded-xl flex items-center gap-2.5 py-2"
          onSelect={(e) => {
            e.preventDefault();
            handleCopyLink(e as unknown as React.MouseEvent);
          }}
        >
          <HugeiconsIcon
            icon={Copy01Icon}
            size={16}
            className="text-muted-foreground"
          />
          <span>Copy Link</span>
          <ContextMenuShortcut>C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          className="rounded-xl flex items-center gap-2.5 py-2"
          onSelect={(e) => {
            e.preventDefault();
            handleEdit(e as unknown as React.MouseEvent);
          }}
        >
          <HugeiconsIcon
            icon={PencilEdit01Icon}
            size={16}
            className="text-muted-foreground"
          />
          <span>Edit Bookmark</span>
          <ContextMenuShortcut>E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          className="rounded-xl flex items-center gap-2.5 py-2"
          onSelect={(e) => {
            e.preventDefault();
            handleDelete(e as unknown as React.MouseEvent);
          }}
        >
          <HugeiconsIcon icon={Delete02Icon} size={16} />
          <span>{isDeleteConfirm ? "Click again to delete" : "Delete"}</span>
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});
