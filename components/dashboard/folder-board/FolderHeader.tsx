"use client";

import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AccordionTrigger } from "@/components/ui/accordion";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import type { GroupRow } from "@/lib/supabase/queries";

interface FolderHeaderProps {
  group: GroupRow;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function FolderHeader({
  group,
  count,
  isSelected,
  onSelect,
}: FolderHeaderProps) {
  const Icon = group.icon ? ALL_ICONS_MAP[group.icon] : Folder01Icon;

  return (
    <AccordionTrigger
      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left border-b border-border/30 bg-muted/15 hover:bg-muted/20 hover:no-underline ${
        isSelected ? "ring-1 ring-primary/20 bg-muted/20" : ""
      }`}
      onClick={onSelect}
      aria-label={`Toggle ${group.name}`}
      data-slot="folder-header"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <HugeiconsIcon
            icon={Icon}
            size={18}
            strokeWidth={1.8}
            style={{ color: group.color || undefined }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {group.name}
              </span>
              <span className="text-xs text-muted-foreground/70 tabular-nums">
                {count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AccordionTrigger>
  );
}
