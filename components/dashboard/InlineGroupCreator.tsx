"use client";

import { Add01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IconPickerPopover } from "./IconPickerPopover";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface InlineGroupCreatorProps {
  newGroupName: string;
  newGroupIcon: string;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InlineGroupCreator({
  newGroupName,
  newGroupIcon,
  isCreating,
  onNameChange,
  onIconChange,
  onSave,
  onCancel,
}: InlineGroupCreatorProps) {
  const [iconsMap, setIconsMap] = useState<Record<
    string,
    IconSvgElement
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/hugeicons-list")
      .then((mod) => {
        if (cancelled) return;
        setIconsMap(mod.ALL_ICONS_MAP as Record<string, IconSvgElement>);
      })
      .catch(() => {
        if (cancelled) return;
        setIconsMap(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="relative mx-1 my-1.5 px-3 py-3 space-y-3 bg-muted/20 rounded-xl ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <IconPickerPopover
          selectedIcon={newGroupIcon}
          onIconSelect={onIconChange}
        >
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20"
            aria-label="Select group icon"
          >
            <HugeiconsIcon
              icon={
                iconsMap?.[newGroupIcon] ?? iconsMap?.["folder"] ?? Folder01Icon
              }
              size={16}
              strokeWidth={2}
              className="text-primary"
            />
          </button>
        </IconPickerPopover>
        <Input
          value={newGroupName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Group name"
          className="h-8 flex-1 text-sm rounded-lg"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave();
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 px-3 text-xs rounded-4xl font-bold"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-7 px-3 text-xs rounded-4xl"
          onClick={onSave}
          disabled={!newGroupName.trim() || isCreating}
        >
          {isCreating ? "Creating..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

interface NewGroupTriggerProps {
  onSelect: () => void;
}

export function NewGroupTrigger({ onSelect }: NewGroupTriggerProps) {
  return (
    <DropdownMenuItem
      className="rounded-xl text-primary font-medium cursor-pointer flex items-center justify-between gap-3 py-2"
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <HugeiconsIcon
          icon={Add01Icon}
          size={16}
          strokeWidth={2}
          className="shrink-0"
        />
        <span>New Group</span>
      </div>
    </DropdownMenuItem>
  );
}
