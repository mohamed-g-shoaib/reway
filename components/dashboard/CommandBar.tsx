"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export function CommandBar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative mx-auto w-full max-w-4xl transition-all duration-200 ${
        isFocused ? "scale-[1.01]" : "scale-100"
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition-all duration-200 ${
          isFocused
            ? "border-primary/50 ring-4 ring-primary/5 shadow-lg"
            : "border-border shadow-sm"
        }`}
      >
        <div className="flex items-center justify-center p-1 text-muted-foreground/60">
          <Plus className="h-5 w-5" />
        </div>

        <input
          type="text"
          placeholder="Insert a link, image, or just plain text..."
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="flex items-center gap-1.5 px-1">
          <kbd className="inline-flex h-6 select-none items-center gap-1 rounded border border-muted-foreground/20 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span> K
          </kbd>
          <kbd className="inline-flex h-6 select-none items-center gap-1 rounded border border-muted-foreground/20 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span> F
          </kbd>
        </div>
      </div>
    </div>
  );
}
