"use client";

import type { MouseEventHandler } from "react";
import {
  ArrowUpRight03Icon,
  Copy01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

interface BookmarkContextMenuProps {
  isDeleteConfirm: boolean;
  onOpen: MouseEventHandler<HTMLDivElement>;
  onPreview: () => void;
  onCopyLink: MouseEventHandler<HTMLDivElement>;
  onEdit: MouseEventHandler<HTMLDivElement>;
  onDelete: MouseEventHandler<HTMLDivElement>;
}

export function BookmarkContextMenu({
  isDeleteConfirm,
  onOpen,
  onPreview,
  onCopyLink,
  onEdit,
  onDelete,
}: BookmarkContextMenuProps) {
  return (
    <ContextMenuContent className="w-56 rounded-2xl p-1.5">
      <ContextMenuItem
        className="rounded-xl flex items-center gap-2.5 py-2"
        onClick={onOpen}
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
        onClick={onPreview}
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
          onCopyLink(e as unknown as React.MouseEvent<HTMLDivElement>);
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
          onEdit(e as unknown as React.MouseEvent<HTMLDivElement>);
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
          onDelete(e as unknown as React.MouseEvent<HTMLDivElement>);
        }}
      >
        <HugeiconsIcon icon={Delete02Icon} size={16} />
        <span>{isDeleteConfirm ? "Click again to delete" : "Delete"}</span>
        <ContextMenuShortcut>⌫</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
