"use client";

import {
  AttachmentIcon,
  BookmarkAdd02Icon,
  Search02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addBookmark,
  enrichCreatedBookmark,
  extractLinks,
} from "@/app/dashboard/actions";
import { BookmarkRow } from "@/lib/supabase/queries";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useIsMac } from "@/hooks/useIsMac";

interface CommandBarProps {
  onAddBookmark: (bookmark: BookmarkRow) => void;
  mode?: "add" | "search";
  searchQuery?: string;
  onModeChange?: (mode: "add" | "search") => void;
  onSearchChange?: (query: string) => void;
}

export function CommandBar({
  onAddBookmark,
  mode = "add",
  searchQuery = "",
  onModeChange,
  onSearchChange,
}: CommandBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect OS for keyboard shortcuts
  const isMac = useIsMac();

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const isUrl = (string: string) => {
    try {
      new URL(string.startsWith("http") ? string : `https://${string}`);
      return string.includes(".");
    } catch {
      return false;
    }
  };

  const processUrls = useCallback(
    async (urls: string[]) => {
      // 1. Create all optimistic bookmarks at once
      const optimisticMap = urls.map((rawUrl) => {
        const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
        const stableId = crypto.randomUUID();
        return {
          url,
          stableId,
          optimistic: {
            id: stableId,
            url: url,
            title: url,
            favicon_url: null,
            description: null,
            group_id: null,
            user_id: "",
            created_at: new Date().toISOString(),
            order_index: null,
            status: "pending",
          } as BookmarkRow,
        };
      });

      // Add all to UI immediately
      optimisticMap.forEach((item) => onAddBookmark(item.optimistic));

      // 2. Process all server actions in parallel
      await Promise.all(
        optimisticMap.map(async ({ url, stableId }) => {
          try {
            const bookmarkId = await addBookmark({ url, id: stableId });
            // Chain enrichment immediately
            await enrichCreatedBookmark(bookmarkId, url);
          } catch (error) {
            console.error("Failed to add extracted bookmark:", error);
          }
        }),
      );
    },
    [onAddBookmark],
  );

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Prioritize image paste
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = async () => {
                const base64 = reader.result as string;
                const base64Data = base64.split(",")[1];
                const urls = await extractLinks(base64Data, true);
                if (urls.length > 0) {
                  await processUrls(urls);
                }
              };
              return;
            }
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onModeChange?.("search");
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onModeChange?.("add");
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [processUrls]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = reader.result as string;
          // Extract base64 without prefix
          const base64Data = base64.split(",")[1];
          const urls = await extractLinks(base64Data, true);
          if (urls.length > 0) {
            await processUrls(urls);
          }
        };
      } catch (error) {
        console.error("Image processing failed:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = mode === "search" ? searchQuery.trim() : inputValue.trim();
    if (!value) return;

    if (mode === "search") {
      onSearchChange?.(value);
      inputRef.current?.blur();
      return;
    }

    setInputValue("");
    inputRef.current?.blur();

    if (isUrl(value) && !value.includes(" ")) {
      // Single URL flow (existing)
      await processUrls([value]);
    } else {
      // AI Extraction flow for text
      try {
        const urls = await extractLinks(value);
        if (urls.length > 0) {
          await processUrls(urls);
        } else {
          console.log("No links found by AI or just searching.");
        }
      } catch (error) {
        console.error("AI extraction failed:", error);
      }
    }
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`group relative flex items-center justify-between rounded-2xl px-4 py-1.5 transition-all duration-200 ease-out ${
          isFocused
            ? "ring-1 ring-primary/30 after:ring-white/10"
            : "ring-1 ring-foreground/5 after:ring-white/5"
        } after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:pointer-events-none after:content-[''] after:transition-all after:duration-200 motion-reduce:transition-none shadow-none isolate`}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload image file"
          title="Upload image file to extract bookmarks"
        />

        {/* Action Icon (Plus or Loading) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePlusClick}
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground/70 transition-all duration-200 ease-out hover:bg-muted hover:text-primary active:scale-[0.97] motion-reduce:transition-none"
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
              setInputValue(e.target.value);
            }
          }}
          placeholder={
            mode === "search"
              ? "Search bookmarks..."
              : "Insert a link, image, or just search..."
          }
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60 selection:bg-primary/20 disabled:opacity-50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Search or add bookmarks"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onModeChange?.("add")}
            className={`h-7 w-7 md:w-auto md:px-2 flex items-center justify-center md:gap-1.5 rounded-lg transition-colors ${
              mode === "add"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
            }`}
            aria-pressed={mode === "add" ? "true" : "false"}
            aria-label="Add bookmarks"
          >
            <HugeiconsIcon icon={BookmarkAdd02Icon} size={14} />
            <KbdGroup className="hidden md:inline-flex">
              {isMac ? (
                <>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </>
              ) : (
                <>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </>
              )}
            </KbdGroup>
          </button>
          <button
            type="button"
            onClick={() => onModeChange?.("search")}
            className={`h-7 w-7 md:w-auto md:px-2 flex items-center justify-center md:gap-1.5 rounded-lg transition-colors ${
              mode === "search"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
            }`}
            aria-pressed={mode === "search" ? "true" : "false"}
            aria-label="Search bookmarks"
          >
            <HugeiconsIcon icon={Search02Icon} size={14} />
            <KbdGroup className="hidden md:inline-flex">
              {isMac ? (
                <>
                  <Kbd>⌘</Kbd>
                  <Kbd>F</Kbd>
                </>
              ) : (
                <>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>F</Kbd>
                </>
              )}
            </KbdGroup>
          </button>
        </div>
      </form>

      {/* Visual Indicator for shortcuts when not focused */}
      {!isFocused && !inputValue ? (
        <div className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
            Press{" "}
            <span className="text-muted-foreground/50">
              {isMac ? "⌘ F" : "Ctrl F"}
            </span>{" "}
            to search ·{" "}
            <span className="text-muted-foreground/50">
              {isMac ? "⌘ K" : "Ctrl K"}
            </span>{" "}
            to add
          </p>
        </div>
      ) : null}
    </div>
  );
}
