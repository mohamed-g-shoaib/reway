"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addBookmark, enrichBookmark } from "@/app/dashboard/actions"; // Added enrichBookmark
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus on Cmd+F or Ctrl+F
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Blur on Escape
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      // Implementation for image upload would go here
    }
  };

  const isUrl = (string: string) => {
    try {
      new URL(string.startsWith("http") ? string : `https://${string}`);
      return string.includes(".");
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return; // Removed || isLoading

    const value = inputValue.trim();
    // No need for global loading state blocking the whole bar,
    // we'll handle it per-submission if we had a list of submissions,
    // but for now let's just clear the input immediately.

    if (isUrl(value)) {
      setInputValue("");
      inputRef.current?.blur();

      const url = value.startsWith("http") ? value : `https://${value}`;

      // Generate a temporary ID for optimistic UI
      const tempId = `temp-${Date.now()}`;

      // Add optimistic bookmark immediately
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
        // 1. Server Insert (get real ID)
        const bookmarkId = await addBookmark({
          url: url,
          is_enriching: true,
        });

        // Update the temp ID with the real ID
        onUpdateBookmark(tempId, { id: bookmarkId });

        // 2. Background Scrape (non-blocking)
        fetch(`/api/metadata?url=${encodeURIComponent(value)}`)
          .then((res) => res.json())
          .then((metadata) => {
            if (metadata && !metadata.error) {
              // Update server
              enrichBookmark(bookmarkId, {
                title: metadata.title,
                favicon_url: metadata.favicon,
                description: metadata.description,
              });

              // Update local state immediately
              onUpdateBookmark(bookmarkId, {
                title: metadata.title,
                favicon_url: metadata.favicon,
                description: metadata.description,
                is_enriching: false,
              });
            }
          })
          .catch((err) => console.error("Background scrape failed:", err));
      } catch (error) {
        console.error("Instant insert failed:", error);
        // Remove the optimistic bookmark on error
        // TODO: Implement removeBookmark callback
      }
    } else {
      console.log("Searching or adding text:", value);
      setInputValue("");
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
        className={`group flex items-center gap-3 rounded-2xl border bg-background px-4 py-3.5 transition-all duration-300 ${
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
                className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground/40 transition-all hover:bg-muted hover:text-primary active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg font-medium">
              Add image or file
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Search
          className={`h-5 w-5 shrink-0 transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground/20"}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Insert a link, image, or just search..."
          className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground/30 selection:bg-primary/20 disabled:opacity-50"
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
