"use client";

import { Plus, Search, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addBookmark } from "@/app/dashboard/actions";

export function CommandBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    if (!inputValue.trim() || isLoading) return;

    const value = inputValue.trim();
    setIsLoading(true);

    try {
      if (isUrl(value)) {
        // 1. Fetch metadata
        const response = await fetch(
          `/api/metadata?url=${encodeURIComponent(value)}`,
        );
        const metadata = await response.json();

        if (response.ok) {
          // 2. Add bookmark via server action
          await addBookmark({
            url: metadata.url,
            title: metadata.title || metadata.domain || value,
            favicon_url: metadata.favicon,
            description: metadata.description,
          });
          setInputValue("");
        } else {
          console.error("Metadata fetch failed", metadata.error);
          // Fallback if metadata fails
          await addBookmark({
            url: value.startsWith("http") ? value : `https://${value}`,
            title: value,
          });
          setInputValue("");
        }
      } else {
        // TODO: Handle plain text or other types
        console.log("Searching or adding text:", value);
      }
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
                className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground/40 transition-all hover:bg-muted hover:text-primary active:scale-90"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
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
          disabled={isLoading}
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
