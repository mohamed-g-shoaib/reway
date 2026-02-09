"use client";

import {
  Delete02Icon,
  PencilEdit01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { GroupRow } from "@/lib/supabase/queries";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import { IconPickerPopover } from "./IconPickerPopover";
import { Input } from "@/components/ui/input";

interface GroupListItemProps {
  group: GroupRow;
  isActive: boolean;
  isEditing: boolean;
  isDeleteConfirm: boolean;
  editGroupName: string;
  editGroupIcon: string;
  groupCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onEditChange: (name: string, icon: string) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
}

export function GroupListItem({
  group,
  isActive,
  isEditing,
  isDeleteConfirm,
  editGroupName,
  editGroupIcon,
  groupCount,
  onEdit,
  onDelete,
  onSelect,
  onEditChange,
  onEditSave,
  onEditCancel,
}: GroupListItemProps) {
  const GroupIcon = group.icon ? ALL_ICONS_MAP[group.icon] : null;

  if (isEditing) {
    return (
      <div
        className="relative mx-1 my-1.5 px-3 py-3 space-y-3 bg-muted/20 rounded-xl ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <IconPickerPopover
            selectedIcon={editGroupIcon}
            onIconSelect={(icon) => onEditChange(editGroupName, icon)}
          >
            <button
              type="button"
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20"
              aria-label="Select group icon"
            >
              <HugeiconsIcon
                icon={ALL_ICONS_MAP[editGroupIcon] || ALL_ICONS_MAP["folder"]}
                size={16}
                strokeWidth={2}
                className="text-primary"
              />
            </button>
          </IconPickerPopover>
          <Input
            value={editGroupName}
            onChange={(e) => onEditChange(e.target.value, editGroupIcon)}
            placeholder="Group name"
            className="h-8 flex-1 text-sm rounded-lg"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEditSave(group.id);
              } else if (e.key === "Escape") {
                onEditCancel();
              }
            }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 px-3 text-xs rounded-4xl font-bold"
            onClick={onEditCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 px-3 text-xs rounded-4xl"
            onClick={() => onEditSave(group.id)}
            disabled={!editGroupName.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenuItem
      className={`rounded-xl cursor-pointer flex items-center justify-between gap-3 py-2 group/menu-item ${
        isActive
          ? "bg-primary/5 text-primary font-bold"
          : "text-muted-foreground"
      } ${isDeleteConfirm ? "bg-muted/50" : ""}`}
      onSelect={(e) => {
        const isButton = (e.target as HTMLElement).closest("button");
        if (isButton) {
          e.preventDefault();
        } else {
          onSelect(group.id);
        }
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {GroupIcon ? (
          <HugeiconsIcon icon={GroupIcon} size={16} strokeWidth={2} />
        ) : null}
        <span className="truncate">{group.name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 min-w-17.5 justify-end relative">
        <div className="flex items-center gap-1 opacity-0 group-hover/menu-item:opacity-100 transition-opacity absolute right-0 bg-inherit pl-2">
          <button
            type="button"
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted/50 cursor-pointer text-muted-foreground/70 hover:text-primary transition-transform active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(group.id);
            }}
            aria-label={`Edit ${group.name}`}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
          </button>
          <button
            type="button"
            className={`h-7 w-7 flex items-center justify-center rounded-lg cursor-pointer transition-transform active:scale-95 ${
              isDeleteConfirm
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(group.id);
            }}
            aria-label={
              isDeleteConfirm
                ? `Confirm delete ${group.name}`
                : `Delete ${group.name}`
            }
          >
            <HugeiconsIcon
              icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
              size={14}
            />
          </button>
          <span className="text-xs text-muted-foreground/50 ml-1">
            {groupCount}
          </span>
        </div>
        <span className="text-xs text-muted-foreground/50 group-hover/menu-item:opacity-0 transition-opacity">
          {groupCount}
        </span>
      </div>
    </DropdownMenuItem>
  );
}
