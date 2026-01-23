"use client";

import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons";
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

interface CommandBarProps {
  onAddBookmark: (bookmark: BookmarkRow) => void;
}

export function CommandBar({ onAddBookmark }: CommandBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect OS for keyboard shortcuts
  const isMac = useMemo(
    () =>
      typeof window !== "undefined" &&
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
    [],
  );

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
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
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
    if (!inputValue.trim()) return;

    const value = inputValue.trim();
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
    <div
      className={`relative w-full transition-all duration-300 ease-out ${
        isFocused ? "scale-[1.01]" : "scale-100"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`group relative flex items-center gap-3 rounded-2xl bg-background px-4 py-2 transition-all duration-200 ${
          isFocused
            ? "ring-1 ring-primary/30 after:ring-white/10"
            : "ring-1 ring-foreground/5 animate-in fade-in duration-500 after:ring-white/3 dark:after:ring-white/5"
        } after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:pointer-events-none after:content-[''] shadow-none isolate`}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
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
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground/70 transition-all hover:bg-muted hover:text-primary active:scale-90"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg font-medium">
              Add image or file
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className={`shrink-0 transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground/50"}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Insert a link, image, or just search..."
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60 selection:bg-primary/20 disabled:opacity-50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="flex items-center gap-2 px-1">
          <KbdGroup>
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
        </div>
      </form>

      {/* Visual Indicator for shortcuts when not focused */}
      {!isFocused && !inputValue ? (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
            Press{" "}
            <span className="text-muted-foreground/50">
              {isMac ? "⌘ F" : "Ctrl F"}
            </span>{" "}
            to start typing
          </p>
        </div>
      ) : null}
    </div>
  );
}
