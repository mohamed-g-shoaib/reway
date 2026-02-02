"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ConflictBarProps {
  addConflicts: { url: string; title: string }[] | null;
  importPreview: {
    entries: { isDuplicate?: boolean }[];
  } | null;
  onResolve: (action: "skip" | "override") => void;
}

export function ConflictBar({
  addConflicts,
  importPreview,
  onResolve,
}: ConflictBarProps) {
  if (!addConflicts && !importPreview?.entries.some((e) => e.isDuplicate)) {
    return null;
  }

  const importDuplicateCount =
    importPreview?.entries.filter((e) => e.isDuplicate).length ?? 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-background border border-border/50 shadow-lg ring-1 ring-foreground/5">
        <div className="flex items-center gap-2 pr-1 text-foreground">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={20}
            className="text-amber-500"
          />
          <span className="text-sm font-semibold whitespace-nowrap">
            {addConflicts
              ? `${addConflicts.length} duplicate${
                  addConflicts.length > 1 ? "s" : ""
                } found`
              : `${importDuplicateCount} duplicates in import`}
          </span>
        </div>
        <div className="h-4 w-px bg-border/60" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onResolve("override")}
            className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-[11px] uppercase tracking-wider transition-colors active:scale-[0.97]"
          >
            Add anyway
          </button>
          <button
            type="button"
            onClick={() => onResolve("skip")}
            className="px-3.5 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-semibold text-[11px] uppercase tracking-wider transition-colors active:scale-[0.97]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
