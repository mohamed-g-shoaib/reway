"use client";

import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addBookmark,
  enrichBookmark,
  extractLinks,
} from "@/app/dashboard/actions";
import { BookmarkRow } from "@/lib/supabase/queries";

interface CommandBarProps {
  onAddBookmark: (bookmark: BookmarkRow) => void;
  onUpdateBookmark: (id: string, updates: Partial<BookmarkRow>) => void;
}

export function CommandBar({
  onAddBookmark,
  onUpdateBookmark,
}: CommandBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  // Removed: const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Process each URL
      for (const rawUrl of urls) {
        const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Optimistic UI
        const optimisticBookmark: BookmarkRow = {
          id: tempId,
          url: url,
          title: url,
          favicon_url: null,
          description: null,
          group_id: null,
          user_id: "",
          created_at: new Date().toISOString(),
          order_index: null,
          is_enriching: true,
        };

        onAddBookmark(optimisticBookmark);

        try {
          const bookmarkId = await addBookmark({ url, is_enriching: true });
          onUpdateBookmark(tempId, { id: bookmarkId });

          fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
            .then((res) => res.json())
            .then((metadata) => {
              if (metadata && !metadata.error) {
                enrichBookmark(bookmarkId, {
                  title: metadata.title,
                  favicon_url: metadata.favicon,
                  description: metadata.description,
                });
                onUpdateBookmark(bookmarkId, {
                  title: metadata.title,
                  favicon_url: metadata.favicon,
                  description: metadata.description,
                  is_enriching: false,
                });
              }
            });
        } catch (error) {
          console.error("Failed to add extracted bookmark:", error);
        }
      }
    },
    [onAddBookmark, onUpdateBookmark],
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
        className={`group flex items-center gap-3 rounded-2xl border bg-background px-4 py-2 transition-all duration-300 ${
          isFocused
            ? "border-primary/50 ring-8 ring-primary/5 shadow-2xl"
            : "border-border shadow-sm hover:border-border/80"
        }`}
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
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground/40 transition-all hover:bg-muted hover:text-primary active:scale-90"
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
          className={`shrink-0 transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground/20"}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Insert a link, image, or just search..."
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/30 selection:bg-primary/20 disabled:opacity-50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="flex items-center gap-2 px-1">
          <kbd className="inline-flex h-7 select-none items-center gap-1 rounded-lg border border-muted-foreground/10 bg-muted/50 px-2 font-mono text-[10px] font-bold text-muted-foreground/40 shadow-inner">
            <span className="text-xs">⌘</span> F
          </kbd>
        </div>
      </form>

      {/* Visual Indicator for shortcuts when not focused */}
      {!isFocused && !inputValue && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
            Press <span className="text-muted-foreground/50">⌘ F</span> to start
            typing
          </p>
        </div>
      )}
    </div>
  );
}
