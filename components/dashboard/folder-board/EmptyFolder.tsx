"use client";

import { GridIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function EmptyFolder() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
      <HugeiconsIcon icon={GridIcon} size={14} />
      <span>No bookmarks yet</span>
    </div>
  );
}
