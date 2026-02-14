"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { HeroGroupId, HeroGroup } from "./types";

export function GroupsDropdown({
  activeGroup,
  heroGroups,
  dropdownCreatingGroup,
  dropdownNewGroupName,
  setDropdownNewGroupName,
  setDropdownCreatingGroup,
  onSelectGroup,
  onCreateGroup,
  onCancelCreate,
}: {
  activeGroup: HeroGroupId;
  heroGroups: HeroGroup[];
  dropdownCreatingGroup: boolean;
  dropdownNewGroupName: string;
  setDropdownNewGroupName: (v: string) => void;
  setDropdownCreatingGroup: (v: boolean) => void;
  onSelectGroup: (id: HeroGroupId) => void;
  onCreateGroup: () => void;
  onCancelCreate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="min-[855px]:hidden flex items-center gap-1.5 rounded-xl px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-primary/90 hover:bg-muted/30 transition-colors cursor-pointer"
          aria-label="Switch group"
        >
          <span className="truncate max-w-28">
            {activeGroup === "all" ? "All Bookmarks" : activeGroup}
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        {heroGroups.map((g) => (
          <DropdownMenuItem
            key={g.id}
            onSelect={() => {
              if (
                g.id === "all" ||
                g.id === "Research" ||
                g.id === "Inspiration" ||
                g.id === "Build" ||
                g.id === "Learn"
              ) {
                onSelectGroup(g.id);
              }
            }}
            className="gap-2 text-xs cursor-pointer"
          >
            <HugeiconsIcon
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              icon={g.icon as any}
              size={14}
              strokeWidth={2}
              style={{ color: g.color || undefined }}
              className={g.color ? "" : "text-muted-foreground"}
            />
            <span className="truncate">{g.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {dropdownCreatingGroup ? (
          <div className="p-2" onMouseDown={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Input
                value={dropdownNewGroupName}
                onChange={(e) => setDropdownNewGroupName(e.target.value)}
                placeholder="New group"
                className="h-8 text-sm rounded-xl"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onCreateGroup();
                  } else if (e.key === "Escape") {
                    onCancelCreate();
                  }
                }}
              />

              <div className="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                  onClick={onCancelCreate}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                  onClick={onCreateGroup}
                  disabled={!dropdownNewGroupName.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDropdownCreatingGroup(true);
            }}
            className="gap-2 text-xs cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} />
            Create group
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
