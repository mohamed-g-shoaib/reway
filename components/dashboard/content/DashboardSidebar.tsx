"use client";

import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Alert02Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
  PencilEdit01Icon,
  GridIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import type { GroupRow } from "@/lib/supabase/queries";
import type { IconPickerPopoverProps } from "../IconPickerPopover";

const IconPickerPopover = dynamic<IconPickerPopoverProps>(
  () => import("../IconPickerPopover").then((mod) => mod.IconPickerPopover),
  {
    loading: () => (
      <div className="h-8 w-8 animate-pulse rounded-lg bg-primary/10" />
    ),
    ssr: false,
  },
);

const MAX_GROUP_NAME_LENGTH = 18;

function CharacterCount({ current, max }: { current: number; max: number }) {
  const isNearLimit = current > max - 5;
  const isAtLimit = current >= max;

  return (
    <span
      className={`text-[9px] font-medium tabular-nums transition-colors duration-200 ${
        isAtLimit
          ? "text-red-500"
          : isNearLimit
            ? "text-amber-500"
            : "text-muted-foreground/40"
      }`}
    >
      {current}/{max}
    </span>
  );
}

interface DashboardSidebarProps {
  groups: GroupRow[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  handleOpenGroup: (groupId: string) => void;
  editingGroupId: string | null;
  setEditingGroupId: (value: string | null) => void;
  editGroupName: string;
  setEditGroupName: (value: string) => void;
  editGroupIcon: string;
  setEditGroupIcon: (value: string) => void;
  editGroupColor: string | null;
  setEditGroupColor: (value: string | null) => void;
  isUpdatingGroup: boolean;
  handleSidebarGroupUpdate: (groupId: string) => void;
  deleteConfirmGroupId: string | null;
  handleDeleteGroupClick: (groupId: string) => void;
  isInlineCreating: boolean;
  setIsInlineCreating: (value: boolean) => void;
  newGroupName: string;
  setNewGroupName: (value: string) => void;
  newGroupIcon: string;
  setNewGroupIcon: (value: string) => void;
  newGroupColor: string | null;
  setNewGroupColor: (value: string | null) => void;
  isCreatingGroup: boolean;
  handleInlineCreateGroup: () => void;
}

export function DashboardSidebar({
  groups,
  activeGroupId,
  setActiveGroupId,
  handleOpenGroup,
  editingGroupId,
  setEditingGroupId,
  editGroupName,
  setEditGroupName,
  editGroupIcon,
  setEditGroupIcon,
  editGroupColor,
  setEditGroupColor,
  isUpdatingGroup,
  handleSidebarGroupUpdate,
  deleteConfirmGroupId,
  handleDeleteGroupClick,
  isInlineCreating,
  setIsInlineCreating,
  newGroupName,
  setNewGroupName,
  newGroupIcon,
  setNewGroupIcon,
  newGroupColor,
  setNewGroupColor,
  isCreatingGroup,
  handleInlineCreateGroup,
}: DashboardSidebarProps) {
  return (
    <aside className="hidden min-[1200px]:flex fixed left-6 top-[10.75rem] bottom-6 z-30 w-60 flex-col gap-2 text-sm text-muted-foreground/70">
      <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground/60">
        <KbdGroup className="gap-0.5">
          <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">Shift</Kbd>
          <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">A–Z</Kbd>
        </KbdGroup>
        <span>Switch Group</span>
      </div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`group flex items-center gap-3 px-2 py-1.5 transition-colors duration-200 ${
              activeGroupId === "all"
                ? "text-foreground font-semibold"
                : "hover:text-foreground/80"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveGroupId("all")}
              className="flex items-center gap-3 min-w-0 flex-1 text-left"
            >
              <span
                className={`h-px transition-[width,opacity] duration-200 ease-out ${
                  activeGroupId === "all"
                    ? "w-12 opacity-80"
                    : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                } bg-current`}
              />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <HugeiconsIcon
                  icon={GridIcon}
                  size={16}
                  strokeWidth={2}
                  className="text-muted-foreground/70"
                />
                <span className="truncate">All Bookmarks</span>
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-foreground transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted/50"
                  aria-label="Group options"
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuItem
                  onClick={() => handleOpenGroup("all")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                  Open bookmarks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44">
          <ContextMenuItem
            onClick={() => handleOpenGroup("all")}
            className="gap-2 text-xs cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
            Open bookmarks
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="flex-1 min-h-0 overflow-y-auto scroll-fade-effect-y overscroll-contain scrollbar-hover-only">
        {groups.map((group) => {
          const GroupIcon = group.icon ? ALL_ICONS_MAP[group.icon] : GridIcon;
          const isEditing = editingGroupId === group.id;
          const isDeleteConfirm = deleteConfirmGroupId === group.id;

          if (isEditing) {
            return (
              <div
                key={group.id}
                className="relative my-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-foreground/5"
              >
                <div className="flex items-center gap-2">
                  <IconPickerPopover
                    selectedIcon={editGroupIcon}
                    onIconSelect={setEditGroupIcon}
                    color={editGroupColor}
                    onColorChange={setEditGroupColor}
                  >
                    <button
                      type="button"
                      className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20"
                      aria-label="Select group icon"
                    >
                      <HugeiconsIcon
                        icon={
                          ALL_ICONS_MAP[editGroupIcon] ||
                          ALL_ICONS_MAP["folder"]
                        }
                        size={16}
                        strokeWidth={2}
                        style={{ color: editGroupColor || "#6366f1" }}
                      />
                    </button>
                  </IconPickerPopover>
                  <Input
                    value={editGroupName}
                    onChange={(e) =>
                      setEditGroupName(
                        e.target.value.slice(0, MAX_GROUP_NAME_LENGTH),
                      )
                    }
                    placeholder="Group name"
                    className="h-8 flex-1 text-sm rounded-xl"
                    autoFocus
                    maxLength={MAX_GROUP_NAME_LENGTH}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSidebarGroupUpdate(group.id);
                      } else if (e.key === "Escape") {
                        setEditingGroupId(null);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-3 text-xs rounded-4xl font-bold"
                    onClick={() => setEditingGroupId(null)}
                  >
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    <CharacterCount
                      current={editGroupName.length}
                      max={MAX_GROUP_NAME_LENGTH}
                    />
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs rounded-4xl"
                      onClick={() => handleSidebarGroupUpdate(group.id)}
                      disabled={!editGroupName.trim() || isUpdatingGroup}
                    >
                      {isUpdatingGroup ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <ContextMenu key={group.id}>
              <ContextMenuTrigger asChild>
                <div
                  className={`group flex items-center gap-3 px-2 py-1.5 transition-colors duration-200 ${
                    activeGroupId === group.id
                      ? "text-foreground font-semibold"
                      : "hover:text-foreground/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveGroupId(group.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  >
                    <span
                      className={`h-px transition-[width,opacity] duration-200 ease-out ${
                        activeGroupId === group.id
                          ? "w-12 opacity-80"
                          : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                      } bg-current`}
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <HugeiconsIcon
                        icon={GroupIcon || GridIcon}
                        size={16}
                        strokeWidth={2}
                        style={{ color: group.color || undefined }}
                        className={group.color ? "" : "text-foreground/80"}
                      />
                      <span className="truncate max-w-32">{group.name}</span>
                    </div>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-foreground transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted/50"
                        aria-label={`${group.name} options`}
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleOpenGroup(group.id)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                        Open group
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingGroupId(group.id);
                          setEditGroupName(group.name);
                          setEditGroupIcon(group.icon || "folder");
                          setEditGroupColor(group.color || "#6366f1");
                        }}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                        Edit group
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          handleDeleteGroupClick(group.id);
                        }}
                        className={`gap-2 text-xs cursor-pointer ${
                          isDeleteConfirm
                            ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                            : "text-destructive/80 focus:text-destructive"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                          size={14}
                        />
                        {isDeleteConfirm ? "Click to confirm" : "Delete group"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-44">
                <ContextMenuItem
                  onClick={() => handleOpenGroup(group.id)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                  Open group
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setEditingGroupId(group.id);
                    setEditGroupName(group.name);
                    setEditGroupIcon(group.icon || "folder");
                    setEditGroupColor(group.color || "#6366f1");
                  }}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                  Edit group
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleDeleteGroupClick(group.id);
                  }}
                  className={`gap-2 text-xs cursor-pointer ${
                    isDeleteConfirm
                      ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                      : "text-destructive/80 focus:text-destructive"
                  }`}
                >
                  <HugeiconsIcon
                    icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                    size={14}
                  />
                  {isDeleteConfirm ? "Click to confirm" : "Delete group"}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      <div className="pt-3 mt-2 border-t border-border/40">
        {isInlineCreating ? (
          <div className="relative mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-foreground/5">
            <div className="flex items-center gap-2">
              <IconPickerPopover
                selectedIcon={newGroupIcon}
                onIconSelect={setNewGroupIcon}
                color={newGroupColor}
                onColorChange={setNewGroupColor}
              >
                <button
                  type="button"
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20"
                  aria-label="Select group icon"
                >
                  <HugeiconsIcon
                    icon={
                      ALL_ICONS_MAP[newGroupIcon] || ALL_ICONS_MAP["folder"]
                    }
                    size={16}
                    strokeWidth={2}
                    style={{ color: newGroupColor || "#6366f1" }}
                  />
                </button>
              </IconPickerPopover>
              <Input
                value={newGroupName}
                onChange={(e) =>
                  setNewGroupName(
                    e.target.value.slice(0, MAX_GROUP_NAME_LENGTH),
                  )
                }
                placeholder="New group"
                className="h-8 flex-1 text-sm rounded-xl"
                autoFocus
                maxLength={MAX_GROUP_NAME_LENGTH}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleInlineCreateGroup();
                  } else if (e.key === "Escape") {
                    setIsInlineCreating(false);
                    setNewGroupName("");
                    setNewGroupIcon("folder");
                    setNewGroupColor("#6366f1");
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 px-3 text-xs rounded-4xl font-bold"
                onClick={() => {
                  setIsInlineCreating(false);
                  setNewGroupName("");
                  setNewGroupIcon("folder");
                  setNewGroupColor("#6366f1");
                }}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <CharacterCount
                  current={newGroupName.length}
                  max={MAX_GROUP_NAME_LENGTH}
                />
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs rounded-4xl"
                  onClick={handleInlineCreateGroup}
                  disabled={!newGroupName.trim() || isCreatingGroup}
                >
                  {isCreatingGroup ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsInlineCreating(true)}
            className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-foreground"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} />
            Create group
          </button>
        )}
      </div>
    </aside>
  );
}
