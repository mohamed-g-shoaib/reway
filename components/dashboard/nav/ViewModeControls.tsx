"use client";

import {
  CircleIcon,
  Folder01Icon,
  Menu01Icon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const activeIcon =
    viewMode === "list"
      ? Menu01Icon
      : viewMode === "card"
        ? SquareIcon
        : viewMode === "icon"
          ? CircleIcon
          : Folder01Icon;

  const viewOptions = [
    { value: "list", label: "List", icon: Menu01Icon },
    { value: "card", label: "Card", icon: SquareIcon },
    { value: "icon", label: "Icon", icon: CircleIcon },
    { value: "folders", label: "Folders", icon: Folder01Icon },
  ] as const;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-8 rounded-lg hover:bg-muted/50 transition-transform duration-150 active:scale-95"
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
              viewMode === "folders"
                ? "bg-primary/5 text-primary font-medium"
                : ""
            }`}
            onClick={() => setViewMode("folders")}
          >
            <HugeiconsIcon icon={Folder01Icon} size={16} />
            Folders
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden md:flex items-center">
        <div className="relative flex items-center">
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-full transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle view modes"
            aria-expanded={isOpen}
          >
            <HugeiconsIcon icon={activeIcon} size={16} strokeWidth={2} />
          </Button>
          {isOpen ? (
            <div className="absolute right-full mr-2 flex items-center gap-1 rounded-xl bg-muted/30 p-1">
              {viewOptions.map((option) => (
                <Button
                  key={option.value}
                  size="icon"
                  variant={viewMode === option.value ? "default" : "ghost"}
                  className="size-7 rounded-lg hover:bg-muted/50"
                  onClick={() => {
                    setViewMode(option.value);
                    setIsOpen(false);
                  }}
                  aria-label={`${option.label} view`}
                >
                  <HugeiconsIcon icon={option.icon} size={14} strokeWidth={2} />
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
