"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CommandBar() {
  const [isFocused, setIsFocused] = useState(false);
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

  return (
    <div
      className={`relative w-full transition-all duration-300 ease-out ${
        isFocused ? "scale-[1.01]" : "scale-100"
      }`}
    >
      <div
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

        {/* Plus Button with Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
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

        <input
          ref={inputRef}
          type="text"
          placeholder="Insert a link, image, or just plain text..."
          className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground/30 selection:bg-primary/20"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="flex items-center gap-2 px-1">
          <kbd className="inline-flex h-7 select-none items-center gap-1 rounded-lg border border-muted-foreground/10 bg-muted/50 px-2 font-mono text-[10px] font-bold text-muted-foreground/40 shadow-inner">
            <span className="text-xs">⌘</span> F
          </kbd>
        </div>
      </div>

      {/* Visual Indicator for shortcuts when not focused */}
      {!isFocused && (
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
