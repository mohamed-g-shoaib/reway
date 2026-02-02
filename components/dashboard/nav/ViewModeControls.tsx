"use client";

import {
  CircleIcon,
  Folder01Icon,
  Menu01Icon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ViewModeControlsProps {
  viewMode: "list" | "card" | "icon" | "folders";
  setViewMode: (value: "list" | "card" | "icon" | "folders") => void;
}

export function ViewModeControls({
  viewMode,
  setViewMode,
}: ViewModeControlsProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9 rounded-xl hover:bg-muted/50 transition-colors active:scale-95"
            aria-label="Change view mode"
          >
            <HugeiconsIcon
              icon={
                viewMode === "list"
                  ? Menu01Icon
                  : viewMode === "card"
                    ? SquareIcon
                    : viewMode === "icon"
                      ? CircleIcon
                      : Folder01Icon
              }
              size={18}
              strokeWidth={2}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36 rounded-2xl p-2 ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
        >
          <DropdownMenuItem
            className={`rounded-lg flex items-center gap-2 cursor-pointer ${
              viewMode === "list" ? "bg-primary/5 text-primary font-medium" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            <HugeiconsIcon icon={Menu01Icon} size={16} />
            List
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`rounded-lg flex items-center gap-2 cursor-pointer ${
              viewMode === "card" ? "bg-primary/5 text-primary font-medium" : ""
            }`}
            onClick={() => setViewMode("card")}
          >
            <HugeiconsIcon icon={SquareIcon} size={16} />
            Card
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`rounded-lg flex items-center gap-2 cursor-pointer ${
              viewMode === "icon" ? "bg-primary/5 text-primary font-medium" : ""
            }`}
            onClick={() => setViewMode("icon")}
          >
            <HugeiconsIcon icon={CircleIcon} size={16} />
            Icon
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`rounded-lg flex items-center gap-2 cursor-pointer ${
              viewMode === "folders" ? "bg-primary/5 text-primary font-medium" : ""
            }`}
            onClick={() => setViewMode("folders")}
          >
            <HugeiconsIcon icon={Folder01Icon} size={16} />
            Folders
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden md:flex items-center gap-1 px-1 py-1 rounded-xl bg-muted/30">
        <Button
          size="icon"
          variant={viewMode === "list" ? "default" : "ghost"}
          className="size-8 rounded-lg transition-[color,background-color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none"
          onClick={() => setViewMode("list")}
          aria-label="List view"
        >
          <HugeiconsIcon icon={Menu01Icon} size={16} strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant={viewMode === "card" ? "default" : "ghost"}
          className="size-8 rounded-lg transition-[color,background-color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none"
          onClick={() => setViewMode("card")}
          aria-label="Card view"
        >
          <HugeiconsIcon icon={SquareIcon} size={16} strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant={viewMode === "icon" ? "default" : "ghost"}
          className="size-8 rounded-lg transition-[color,background-color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none"
          onClick={() => setViewMode("icon")}
          aria-label="Icon view"
        >
          <HugeiconsIcon icon={CircleIcon} size={16} strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant={viewMode === "folders" ? "default" : "ghost"}
          className="size-8 rounded-lg transition-[color,background-color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none"
          onClick={() => setViewMode("folders")}
          aria-label="Folder view"
        >
          <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
        </Button>
      </div>
    </>
  );
}
