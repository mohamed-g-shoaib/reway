"use client";

import {
  Add01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
  GridIcon,
  PencilEdit01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import type { GroupRow } from "@/lib/supabase/queries";
import type { IconPickerPopoverProps } from "../IconPickerPopover";
import dynamic from "next/dynamic";

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

interface GroupMenuProps {
  groups: GroupRow[];
  activeGroupId: string;
  groupCounts: Record<string, number>;
  onGroupSelect: (id: string) => void;
  onGroupOpen?: (id: string) => void;
  onDeleteGroupClick: (id: string) => void;
  editingGroupId: string | null;
  editGroupName: string;
  setEditGroupName: (value: string) => void;
  editGroupIcon: string;
  setEditGroupIcon: (value: string) => void;
  editGroupColor: string | null;
  setEditGroupColor: (value: string | null) => void;
  isUpdating: boolean;
  onUpdateGroup: (id: string) => void;
  deleteConfirmGroupId: string | null;
  isInlineCreating: boolean;
  setIsInlineCreating: (value: boolean) => void;
  newGroupName: string;
  setNewGroupName: (value: string) => void;
  newGroupIcon: string;
  setNewGroupIcon: (value: string) => void;
  newGroupColor: string | null;
  setNewGroupColor: (value: string | null) => void;
  isCreating: boolean;
  onInlineCreate: () => void;
  onInlineCreateCancel: () => void;
  setEditingGroupId: (value: string | null) => void;
}

export function GroupMenu({
  groups,
  activeGroupId,
  groupCounts,
  onGroupSelect,
  onGroupOpen,
  onDeleteGroupClick,
  editingGroupId,
  editGroupName,
  setEditGroupName,
  editGroupIcon,
  setEditGroupIcon,
  editGroupColor,
  setEditGroupColor,
  isUpdating,
  onUpdateGroup,
  deleteConfirmGroupId,
  isInlineCreating,
  setIsInlineCreating,
  newGroupName,
  setNewGroupName,
  newGroupIcon,
  setNewGroupIcon,
  newGroupColor,
  setNewGroupColor,
  isCreating,
  onInlineCreate,
  onInlineCreateCancel,
  setEditingGroupId,
}: GroupMenuProps) {
  const activeGroup =
    activeGroupId === "all"
      ? { name: "All Bookmarks", icon: "all", color: null }
      : groups.find((g) => g.id === activeGroupId) || {
          name: "Unknown",
          icon: "folder",
          color: null,
        };

  const ActiveIcon =
    activeGroup.icon === "all"
      ? GridIcon
      : activeGroup.icon
        ? ALL_ICONS_MAP[activeGroup.icon]
        : GridIcon;

  const getBookmarkCount = (groupId: string) => groupCounts[groupId] || 0;

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 gap-2 px-2 rounded-xl text-sm font-bold hover:bg-muted/50 transition-transform duration-150 active:scale-[0.98]"
          >
            <div className="flex items-center justify-center h-8 w-8">
              {ActiveIcon ? (
                <HugeiconsIcon
                  icon={ActiveIcon}
                  size={18}
                  strokeWidth={2}
                  style={{ color: activeGroup.color || undefined }}
                  className={activeGroup.color ? "" : "text-foreground/80"}
                />
              ) : null}
            </div>
            <span className="truncate max-w-48">{activeGroup.name}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              className="text-muted-foreground/30"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 p-2 animate-in slide-in-from-top-2 duration-200 shadow-none"
        >
          <DropdownMenuItem
            className={`group rounded-xl font-medium cursor-pointer flex items-center justify-between gap-3 py-2 ${
              activeGroupId === "all"
                ? "bg-primary/5 text-primary font-bold"
                : "text-muted-foreground"
            }`}
            onClick={() => onGroupSelect("all")}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 mt-0.5">
              <HugeiconsIcon icon={GridIcon} size={16} strokeWidth={2} />
              <span>All Bookmarks</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onGroupOpen?.("all");
              }}
              className="opacity-100 text-muted-foreground/90 hover:text-foreground transition-opacity duration-150"
              aria-label="Open all bookmarks"
            >
              <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
            </button>
          </DropdownMenuItem>

          {groups.length > 0 ? (
            <div
              className={`max-h-75 overflow-y-auto ${
                groups.length > 1
                  ? "border-t border-border/50 my-1 pt-1"
                  : "mt-1"
              }`}
            >
              {groups.map((group) => {
                const GroupIcon = group.icon ? ALL_ICONS_MAP[group.icon] : null;
                const isEditing = editingGroupId === group.id;

                if (isEditing) {
                  return (
                    <div
                      key={group.id}
                      className="relative mx-1 my-1.5 px-3 py-3 space-y-3 bg-muted/20 rounded-xl ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate"
                      onClick={(e) => e.stopPropagation()}
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
                              className="text-primary"
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
                          className="h-8 flex-1 text-sm rounded-lg"
                          maxLength={MAX_GROUP_NAME_LENGTH}
                          autoFocus
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              onUpdateGroup(group.id);
                            } else if (e.key === "Escape") {
                              setEditingGroupId(null);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <UIButton
                          size="sm"
                          variant="secondary"
                          className="h-7 px-3 text-xs rounded-4xl font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroupId(null);
                          }}
                        >
                          Cancel
                        </UIButton>
                        <div className="flex items-center justify-between flex-1">
                          <CharacterCount
                            current={editGroupName.length}
                            max={MAX_GROUP_NAME_LENGTH}
                          />
                          <UIButton
                            size="sm"
                            className="h-7 px-3 text-xs rounded-4xl"
                            onClick={() => onUpdateGroup(group.id)}
                            disabled={!editGroupName.trim() || isUpdating}
                          >
                            {isUpdating ? "Saving..." : "Save"}
                          </UIButton>
                        </div>
                      </div>
                    </div>
                  );
                }

                const isDeleteConfirm = deleteConfirmGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    className={`group/menu-row relative flex items-center gap-3 rounded-xl ${
                      isDeleteConfirm ? "bg-muted/50" : ""
                    }`}
                  >
                    <DropdownMenuItem
                      asChild
                      className={`group flex-1 cursor-pointer py-2 pr-20 ${
                        activeGroupId === group.id
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                      onSelect={() => onGroupSelect(group.id)}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 text-left transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                      >
                        {GroupIcon ? (
                          <HugeiconsIcon
                            icon={GroupIcon}
                            size={16}
                            strokeWidth={2}
                            style={{ color: group.color || undefined }}
                            className={group.color ? "" : "text-foreground/80"}
                          />
                        ) : null}
                        <span className="truncate">{group.name}</span>
                      </button>
                    </DropdownMenuItem>

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted/60 cursor-pointer text-muted-foreground/90 hover:text-foreground transition-all duration-200"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`${group.name} options`}
                          >
                            <HugeiconsIcon
                              icon={MoreHorizontalIcon}
                              size={14}
                            />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40">
                          <DropdownMenuItem
                            onClick={() => onGroupOpen?.(group.id)}
                            className="gap-2 text-xs rounded-xl cursor-pointer"
                          >
                            <HugeiconsIcon
                              icon={ArrowUpRight03Icon}
                              size={14}
                            />
                            Open group
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingGroupId(group.id);
                              setEditGroupName(group.name);
                              setEditGroupIcon(group.icon || "folder");
                              setEditGroupColor(group.color || "#6366f1");
                            }}
                            className="gap-2 text-xs rounded-xl cursor-pointer"
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                            Edit group
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              onDeleteGroupClick(group.id);
                            }}
                            className={`gap-2 text-xs rounded-xl cursor-pointer ${
                              isDeleteConfirm
                                ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                                : "text-destructive/80 focus:text-destructive"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={
                                isDeleteConfirm ? Alert02Icon : Delete02Icon
                              }
                              size={14}
                            />
                            {isDeleteConfirm
                              ? "Click to confirm"
                              : "Delete group"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground/90 min-w-4">
                        {getBookmarkCount(group.id)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <DropdownMenuSeparator className="my-2" />

          {isInlineCreating ? (
            <div
              className="relative mx-1 my-1.5 px-3 py-3 space-y-3 bg-muted/20 rounded-xl ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate"
              onClick={(e) => e.stopPropagation()}
            >
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
                      className="text-primary"
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
                  placeholder="Group name"
                  className="h-8 flex-1 text-sm rounded-lg"
                  maxLength={MAX_GROUP_NAME_LENGTH}
                  autoFocus
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      onInlineCreate();
                    } else if (e.key === "Escape") {
                      onInlineCreateCancel();
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <UIButton
                  size="sm"
                  variant="secondary"
                  className="h-7 px-3 text-xs rounded-4xl font-bold"
                  onClick={onInlineCreateCancel}
                >
                  Cancel
                </UIButton>
                <div className="flex items-center justify-between flex-1">
                  <CharacterCount
                    current={newGroupName.length}
                    max={MAX_GROUP_NAME_LENGTH}
                  />
                  <UIButton
                    size="sm"
                    className="h-7 px-3 text-xs rounded-4xl"
                    onClick={onInlineCreate}
                    disabled={!newGroupName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Save"}
                  </UIButton>
                </div>
              </div>
            </div>
          ) : (
            <DropdownMenuItem
              className="rounded-xl text-primary font-medium focus:bg-primary/5 cursor-pointer flex items-center justify-between gap-3 py-2"
              onSelect={(e) => {
                e.preventDefault();
                setIsInlineCreating(true);
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
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
