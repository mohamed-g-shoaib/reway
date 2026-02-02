"use client";

import type { MouseEventHandler } from "react";
import {
  Alert02Icon,
  ArrowUpRight03Icon,
  Copy01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

interface BookmarkActionsProps {
  isCopied: boolean;
  isDeleteConfirm: boolean;
  onEdit: MouseEventHandler<HTMLButtonElement>;
  onCopyLink: MouseEventHandler<HTMLButtonElement>;
  onOpen: MouseEventHandler<HTMLButtonElement>;
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

export function BookmarkActions({
  isCopied,
  isDeleteConfirm,
  onEdit,
  onCopyLink,
  onOpen,
  onDelete,
}: BookmarkActionsProps) {
  return (
    <div
      className="absolute right-0 flex items-center gap-1 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-[opacity,transform] duration-200 ease-out cursor-default"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary cursor-pointer transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
        onClick={onEdit}
        aria-label="Edit bookmark"
      >
        <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary cursor-pointer transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
        onClick={onCopyLink}
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
        className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary cursor-pointer transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
        onClick={onOpen}
        aria-label="Open link in new tab"
      >
        <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-xl transition-transform duration-150 ease-out cursor-pointer text-destructive hover:text-destructive active:scale-[0.97] motion-reduce:transition-none ${
          isDeleteConfirm
            ? "bg-destructive/10 hover:bg-destructive/20"
            : "hover:bg-destructive/10"
        }`}
        onClick={onDelete}
        aria-label={
          isDeleteConfirm ? "Click again to confirm delete" : "Delete bookmark"
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
  );
}
