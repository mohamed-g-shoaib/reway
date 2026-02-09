"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";

export function GroupsDemo() {
  const groups = [
    { label: "Product Research", count: "12" },
    { label: "UI References", count: "8" },
    { label: "Build Queue", count: "5" },
    { label: "Reading List", count: "6" },
  ];

  return (
    <div className="w-full grid gap-1.5">
      {groups.map((group) => (
        <div
          key={group.label}
          className="flex items-center justify-between rounded-2xl ring-1 ring-foreground/8 bg-background px-3 py-1.5 text-[11px]"
        >
          <span className="font-medium text-foreground">{group.label}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-lg bg-background/60 transition-[background-color,transform] duration-200 ease-out hover:bg-background active:scale-[0.97]"
                aria-label="Edit group"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={12} />
              </button>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-lg bg-background/60 text-destructive transition-[color,background-color,transform] duration-200 ease-out hover:bg-destructive/10 active:scale-[0.97]"
                aria-label="Delete group"
              >
                <HugeiconsIcon icon={Delete02Icon} size={12} />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {group.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
