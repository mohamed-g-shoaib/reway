"use client";

import { useState } from "react";

import { AttachmentIcon } from "@hugeicons/core-free-icons";
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
  addStatus?: string | null;
  isAddBusy?: boolean;
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
  addStatus,
  isAddBusy = false,
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
  const StatusSpinner = () => (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
      aria-hidden="true"
    />
  );

  return (
    <div className="relative w-full" data-onboarding="command-bar">
      <form
        onSubmit={onSubmit}
        className={`group relative flex items-center justify-between gap-2 rounded-2xl px-1.5 py-1.5 ${
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
          title="Upload image file"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onPlusClick}
                disabled={mode === "search"}
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground transition-transform duration-150 ease-out hover:bg-muted hover:text-primary active:scale-[0.97] motion-reduce:transition-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
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

        <div className="relative flex-1 min-w-0">
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
                : mode === "add" && isAddBusy && addStatus
                  ? ""
                  : "Add a link or search..."
            }
            className="w-full bg-transparent p-0 text-sm font-medium outline-none placeholder:text-muted-foreground selection:bg-primary/20 disabled:opacity-50"
            disabled={mode === "add" && isAddBusy}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            aria-label="Search or add bookmarks"
          />
          {mode === "add" && isAddBusy && addStatus ? (
            <div className="pointer-events-none absolute inset-0 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <StatusSpinner />
              <span className="truncate">{addStatus}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-muted/20 p-1 ring-1 ring-inset ring-foreground/5">
          <button
            type="button"
            onClick={() => onModeChange?.("add")}
            data-onboarding="add-bookmarks"
            className={`flex items-center gap-1 px-1.5 py-1 text-[11px] rounded-lg cursor-pointer ${
              mode === "add"
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40"
            }`}
            aria-pressed={mode === "add"}
            aria-label="Add bookmarks"
          >
            <span>Add</span>
            <KbdGroup className="hidden md:inline-flex">
              <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">
                {isMac ? "⌘K" : "CtrlK"}
              </Kbd>
            </KbdGroup>
          </button>
          <button
            type="button"
            onClick={() => onModeChange?.("search")}
            data-onboarding="search-bookmarks"
            className={`flex items-center gap-1 px-1.5 py-1 text-[11px] rounded-lg cursor-pointer ${
              mode === "search"
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40"
            }`}
            aria-pressed={mode === "search"}
            aria-label="Search bookmarks"
          >
            <span>Search</span>
            <KbdGroup className="hidden md:inline-flex">
              <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">
                {isMac ? "⌘F" : "CtrlF"}
              </Kbd>
            </KbdGroup>
          </button>
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
