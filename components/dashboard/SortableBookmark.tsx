"use client";

import { useState, memo, useEffect } from "react";
import TextShimmer from "@/components/ui/text-shimmer";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Favicon } from "./Favicon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { GroupRow } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { InlineEditForm } from "./sortable-bookmark/InlineEditForm";
import { BookmarkActions } from "./sortable-bookmark/BookmarkActions";
import { MobileActionMenu } from "./sortable-bookmark/MobileActionMenu";
import { BookmarkContextMenu } from "./sortable-bookmark/BookmarkContextMenu";

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
  activeGroupId?: string;
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
  selectionMode?: boolean;
  isSelectionChecked?: boolean;
  onToggleSelection?: (id: string) => void;
  onEnterSelectionMode?: () => void;
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
  activeGroupId,
  isSelected,
  onEdit,
  groups = [],
  isEditing: forceEditing,
  onEditDone,
  onPreview,
  rowContent = "date",
  selectionMode = false,
  isSelectionChecked = false,
  onToggleSelection,
  onEnterSelectionMode,
}: SortableBookmarkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    touchAction: selectionMode ? "auto" : "none",
  };

  const dragStyle = isDragging
    ? "z-50 bg-background ring-1 ring-primary/20"
    : isSelected
      ? "bg-foreground/4 ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] isolate shadow-none"
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

  const handleDeleteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(id);
    setDeleteDialogOpen(false);
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

  if (isEditing) {
    return (
      <InlineEditForm
        setNodeRef={setNodeRef}
        transform={transform}
        transition={transition}
        isDragging={isDragging}
        editGroupId={editGroupId}
        setEditGroupId={setEditGroupId}
        groups={groups}
        groupsMap={groupsMap}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editUrl={editUrl}
        setEditUrl={setEditUrl}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        isSaving={isSaving}
      />
    );
  }

  // Normal Bookmark View
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            className={`group relative flex items-center justify-between rounded-2xl px-4 py-1.5 ${
              status === "pending"
                ? "opacity-60"
                : selectionMode
                  ? "hover:bg-muted/50 cursor-pointer"
                  : "hover:bg-muted/50 cursor-grab active:cursor-grabbing"
            } ${dragStyle} ${isDragging ? "opacity-0" : "opacity-100"}`}
            style={{ ...style, contentVisibility: "auto" }}
            {...attributes}
            {...(selectionMode ? {} : listeners)}
            data-slot="bookmark-card"
            role="button"
            tabIndex={status === "pending" ? -1 : 0}
            aria-roledescription="Draggable bookmark"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* Favicon/Checkbox Container */}
              {selectionMode ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection?.(id);
                  }}
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-transform duration-150 active:scale-95"
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
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={(event) => {
                    if (event.shiftKey) {
                      event.preventDefault();
                      event.stopPropagation();
                      onEnterSelectionMode?.();
                      onToggleSelection?.(id);
                      return;
                    }
                    openInNewTab(event);
                  }}
                  aria-label="Open bookmark"
                >
                  <Favicon
                    url={favicon || ""}
                    domain={domain}
                    title={title}
                    className="h-10 w-10"
                  />
                </button>
              )}

              <div className="min-w-0 flex-1">
                <div className="w-fit max-w-full h-5">
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
                      className="block truncate text-sm font-semibold cursor-pointer text-foreground group-hover:text-primary"
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
                      className="block truncate text-xs font-medium cursor-pointer text-muted-foreground/70 group-hover:text-muted-foreground"
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
                      // If viewing a specific group and bookmark belongs to that group, show date instead
                      if (
                        activeGroupId &&
                        activeGroupId !== "all" &&
                        groupId === activeGroupId
                      ) {
                        return createdAt;
                      }
                      // Otherwise show group name
                      if (groupId === "all" || !groupsMap || !groupId)
                        return "No Group";
                      const group = groupsMap.get(groupId);
                      return group?.name || "No Group";
                    })()
                  : createdAt}
              </span>
            )}

            {/* Desktop Action Buttons: Visible only on hover and on desktop */}
            {status !== "pending" && !selectionMode ? (
              <BookmarkActions
                isCopied={isCopied}
                onEdit={handleEdit}
                onCopyLink={handleCopyLink}
                onOpen={openInNewTab}
                onDelete={handleDeleteRequest}
              />
            ) : null}

            {/* Mobile Action Menu */}
            {status !== "pending" ? (
              <MobileActionMenu
                isCopied={isCopied}
                onEdit={handleEdit}
                onCopyLink={handleCopyLink}
                onOpen={openInNewTab}
                onDelete={handleDeleteRequest}
              />
            ) : null}
          </div>
        </div>
        </ContextMenuTrigger>

        <BookmarkContextMenu
          onOpen={openInNewTab}
          onPreview={() => onPreview?.(id)}
          onCopyLink={handleCopyLink}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      </ContextMenu>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete bookmark?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the bookmark from your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-4xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="rounded-4xl"
            onClick={handleDeleteConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
