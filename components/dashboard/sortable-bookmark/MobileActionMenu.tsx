"use client";

import type { MouseEventHandler } from "react";
import {
  Alert02Icon,
  ArrowUpRight03Icon,
  Copy01Icon,
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileActionMenuProps {
  isCopied: boolean;
  isDeleteConfirm: boolean;
  onEdit: MouseEventHandler<HTMLDivElement>;
  onCopyLink: MouseEventHandler<HTMLDivElement>;
  onOpen: MouseEventHandler<HTMLDivElement>;
  onDelete: MouseEventHandler<HTMLDivElement>;
}

export function MobileActionMenu({
  isCopied,
  isDeleteConfirm,
  onEdit,
  onCopyLink,
  onOpen,
  onDelete,
}: MobileActionMenuProps) {
  return (
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
          className="w-40 rounded-2xl p-2 ring-1 ring-foreground/8 shadow-none isolate after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-['']"
        >
          <DropdownMenuItem
            className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5"
            onClick={onEdit}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5"
            onClick={onCopyLink}
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
            onClick={onOpen}
          >
            <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} /> Open
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`rounded-xl flex items-center gap-2 cursor-pointer font-medium ${
              isDeleteConfirm
                ? "text-destructive bg-destructive/5 focus:bg-destructive/10 focus:text-destructive"
                : "text-destructive focus:bg-destructive/5 focus:text-destructive"
            }`}
            onClick={onDelete}
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
  );
}
