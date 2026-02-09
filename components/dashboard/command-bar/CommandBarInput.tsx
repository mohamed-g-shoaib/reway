"use client";

import {
  AttachmentIcon,
  BookmarkAdd02Icon,
  Search02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommandBarInputProps {
  mode: "add" | "search";
  searchQuery: string;
  inputValue: string;
  isFocused: boolean;
  isMac: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onModeChange?: (mode: "add" | "search") => void;
  onSearchChange?: (query: string) => void;
  onInputValueChange: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlusClick: () => void;
}

export function CommandBarInput({
  mode,
  searchQuery,
  inputValue,
  isFocused,
  isMac,
  inputRef,
  fileInputRef,
  onModeChange,
  onSearchChange,
  onInputValueChange,
  onFocusChange,
  onSubmit,
  onFileChange,
  onPlusClick,
}: CommandBarInputProps) {
  return (
    <div className="relative w-full">
      <form
        onSubmit={onSubmit}
        className={`group relative flex items-center justify-between rounded-2xl px-4 py-1.5 ${
          isFocused
            ? "ring-1 ring-primary/30 after:ring-white/10"
            : "ring-1 ring-foreground/8 after:ring-white/5"
        } after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:pointer-events-none after:content-[''] shadow-none isolate`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload image file"
          title="Upload image file to extract bookmarks"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onPlusClick}
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground/70 transition-transform duration-150 ease-out hover:bg-muted hover:text-primary active:scale-[0.97] motion-reduce:transition-none"
                aria-label="Add image or file"
              >
                <HugeiconsIcon icon={AttachmentIcon} size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg font-medium">
              Add image or file
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          ref={inputRef}
          type="text"
          value={mode === "search" ? searchQuery : inputValue}
          onChange={(e) => {
            if (mode === "search") {
              onSearchChange?.(e.target.value);
            } else {
              onInputValueChange(e.target.value);
            }
          }}
          placeholder={
            mode === "search"
              ? "Search bookmarks..."
              : "Insert a link, image, or just search..."
          }
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60 selection:bg-primary/20 disabled:opacity-50"
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          aria-label="Search or add bookmarks"
        />

        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onModeChange?.("add")}
                className={`h-6 w-6 md:w-auto md:px-1.5 flex items-center justify-center md:gap-1.5 rounded-md transition-colors duration-150 ease-out ${
                  mode === "add"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                }`}
                aria-pressed={mode === "add"}
                aria-label="Add bookmarks"
              >
                <HugeiconsIcon icon={BookmarkAdd02Icon} size={13} />
                <KbdGroup className="hidden md:inline-flex">
                  <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1.5">
                    {isMac ? "⌘K" : "CtrlK"}
                  </Kbd>
                </KbdGroup>
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="rounded-lg font-medium hidden md:flex"
              side="bottom"
            >
              Add bookmarks
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onModeChange?.("search")}
                className={`h-6 w-6 md:w-auto md:px-1.5 flex items-center justify-center md:gap-1.5 rounded-md transition-colors duration-150 ease-out ${
                  mode === "search"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                }`}
                aria-pressed={mode === "search"}
                aria-label="Search bookmarks"
              >
                <HugeiconsIcon icon={Search02Icon} size={13} />
                <KbdGroup className="hidden md:inline-flex">
                  <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1.5">
                    {isMac ? "⌘F" : "CtrlF"}
                  </Kbd>
                </KbdGroup>
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="rounded-lg font-medium hidden md:flex"
              side="bottom"
            >
              Search bookmarks
            </TooltipContent>
          </Tooltip>
        </div>
      </form>

      {!isFocused && !inputValue ? (
        <div className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100 md:block">
          <p className="text-[10px] font-bold uppercase text-muted-foreground/30">
            Press{" "}
            <span className="text-muted-foreground/50">
              {isMac ? "⌘F" : "CtrlF"}
            </span>{" "}
            to search ·{" "}
            <span className="text-muted-foreground/50">
              {isMac ? "⌘K" : "CtrlK"}
            </span>{" "}
            to add
          </p>
        </div>
      ) : null}
    </div>
  );
}
