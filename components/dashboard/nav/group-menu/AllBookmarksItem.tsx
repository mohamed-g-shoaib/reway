import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";

export function AllBookmarksItem({
  active,
  selectionMode,
  onSelectAll,
}: {
  active: boolean;
  selectionMode: boolean;
  onSelectAll: () => void;
}) {
  return (
    <DropdownMenuItem
      className={`group rounded-xl font-medium cursor-pointer flex items-center justify-between gap-3 py-2 ${
        active ? "bg-muted text-foreground font-bold" : "text-muted-foreground"
      }`}
      onSelect={(event) => {
        if (!selectionMode) return;
        event.preventDefault();
      }}
      onClick={() => {
        if (selectionMode) return;
        onSelectAll();
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 mt-0.5">
        <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
        <span>All Bookmarks</span>
      </div>
    </DropdownMenuItem>
  );
}
