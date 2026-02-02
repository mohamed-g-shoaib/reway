"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Alert02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";

export function GroupsDemo() {
  const groups = [
    { label: "Product Research", count: "12" },
    { label: "UI References", count: "8" },
    { label: "Build Queue", count: "5" },
    { label: "Reading List", count: "6" },
  ];
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setTimeout(() => setDeleteIndex(null), 1600);
  };

  return (
    <div className="w-full grid gap-1.5">
      {groups.map((group, index) => (
        <div
          key={group.label}
          className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-1.5 text-[11px]"
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
                onClick={() => handleDelete(index)}
              >
                <HugeiconsIcon
                  icon={deleteIndex === index ? Alert02Icon : Delete02Icon}
                  size={12}
                />
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
