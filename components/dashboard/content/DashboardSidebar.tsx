"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowUpRight03Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Folder01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  handleSidebarGroupUpdate: (groupId: string, onError?: () => void) => void;
  onDeleteGroup: (groupId: string) => void;
  isInlineCreating: boolean;
  setIsInlineCreating: (value: boolean) => void;
  newGroupName: string;
  setNewGroupName: (value: string) => void;
  newGroupIcon: string;
  setNewGroupIcon: (value: string) => void;
  newGroupColor: string | null;
  setNewGroupColor: (value: string | null) => void;
  isCreatingGroup: boolean;
  handleInlineCreateGroup: (onError?: () => void) => void;
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
  onDeleteGroup,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupRow | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const selectedCount = selectedGroupIds.size;
  const selectedGroups = useMemo(
    () => groups.filter((g) => selectedGroupIds.has(g.id)),
    [groups, selectedGroupIds],
  );

  const openDeleteDialog = (group: GroupRow) => {
    setDeleteTarget(group);
    setDeleteDialogOpen(true);
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedGroupIds(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedGroupIds(new Set());
  };

  const toggleSelected = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDeleteGroup(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleBulkDelete = () => {
    if (selectedGroups.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedGroups.length === 0) return;
    selectedGroups.forEach((g) => onDeleteGroup(g.id));
    setBulkDeleteDialogOpen(false);
    exitSelectionMode();
  };

  return (
    <aside
      className="hidden min-[1200px]:flex fixed left-6 top-43 bottom-6 z-30 w-60 flex-col gap-2 text-sm text-muted-foreground"
      data-onboarding="groups-desktop"
    >
      <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
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
                : selectionMode
                  ? ""
                  : "hover:text-foreground/80"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveGroupId("all")}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <span
                className={`h-px ${
                  selectionMode
                    ? "w-8 opacity-60"
                    : `transition-[width,opacity] duration-200 ease-out ${
                        activeGroupId === "all"
                          ? "w-12 opacity-80"
                          : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                      }`
                } bg-current`}
              />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <HugeiconsIcon
                  icon={Folder01Icon}
                  size={16}
                  strokeWidth={2}
                  className="text-muted-foreground"
                />
                <span className="truncate">All Bookmarks</span>
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer ${
                    selectionMode
                      ? "opacity-0 pointer-events-none"
                      : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-label="Group options"
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
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
          <ContextMenuItem
            onSelect={(event) => {
              if (selectionMode) exitSelectionMode();
              else enterSelectionMode();
            }}
            className="gap-2 text-xs cursor-pointer"
          >
            <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
            {selectionMode ? "Exit selection" : "Select groups"}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {selectionMode ? (
        <div className="mb-2 rounded-2xl border border-border/60 bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                onClick={exitSelectionMode}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                onClick={handleBulkDelete}
                disabled={selectedCount === 0}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hover-only">
        {groups.map((group) => {
          const GroupIcon = group.icon
            ? ALL_ICONS_MAP[group.icon]
            : Folder01Icon;
          const isEditing = editingGroupId === group.id;

          if (isEditing) {
            return (
              <div
                key={group.id}
                className="relative my-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5"
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
                      className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20 cursor-pointer"
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
                    onChange={(e) => {
                      setEditGroupName(
                        e.target.value.slice(0, MAX_GROUP_NAME_LENGTH),
                      );
                    }}
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
                    className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                    onClick={() => {
                      setEditingGroupId(null);
                    }}
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
                      className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
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
                      : selectionMode
                        ? ""
                        : "hover:text-foreground/80"
                  }`}
                >
                  {selectionMode ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        toggleSelected(group.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleSelected(group.id);
                        }
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <span className="h-px w-8 opacity-60 bg-current" />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Checkbox
                          checked={selectedGroupIds.has(group.id)}
                          onClick={(event) => event.stopPropagation()}
                          onCheckedChange={() => {
                            toggleSelected(group.id);
                          }}
                        />
                        <span className="truncate max-w-32">{group.name}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGroupId(group.id);
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <span
                        className={`h-px ${
                          `transition-[width,opacity] duration-200 ease-out ${
                            activeGroupId === group.id
                              ? "w-12 opacity-80"
                              : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                          }`
                        } bg-current`}
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <HugeiconsIcon
                          icon={GroupIcon || Folder01Icon}
                          size={16}
                          strokeWidth={2}
                          style={{ color: group.color || undefined }}
                          className={group.color ? "" : "text-foreground/80"}
                        />
                        <span className="truncate max-w-32">{group.name}</span>
                      </div>
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer ${
                          selectionMode
                            ? "opacity-0 pointer-events-none"
                            : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted/50"
                        }`}
                        aria-label={`${group.name} options`}
                      >
                        <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-40">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          if (selectionMode) {
                            toggleSelected(group.id);
                          } else {
                            enterSelectionMode();
                            toggleSelected(group.id);
                          }
                        }}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                        {selectionMode ? "Toggle selection" : "Select groups"}
                      </DropdownMenuItem>
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
                        onSelect={() => {
                          openDeleteDialog(group);
                        }}
                        className="gap-2 text-xs cursor-pointer text-destructive/80 focus:text-destructive"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                        Delete group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-44">
                <ContextMenuItem
                  onSelect={(event) => {
                    if (selectionMode) {
                      toggleSelected(group.id);
                    } else {
                      enterSelectionMode();
                      toggleSelected(group.id);
                    }
                  }}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                  {selectionMode ? "Toggle selection" : "Select groups"}
                </ContextMenuItem>
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
                  onSelect={() => {
                    openDeleteDialog(group);
                  }}
                  className="gap-2 text-xs cursor-pointer text-destructive/80 focus:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                  Delete group
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      <div className="pt-3 mt-2 border-t border-border/40">
        {isInlineCreating ? (
          <div className="relative mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5">
            <div className="flex items-center gap-2">
              <IconPickerPopover
                selectedIcon={newGroupIcon}
                onIconSelect={setNewGroupIcon}
                color={newGroupColor}
                onColorChange={setNewGroupColor}
              >
                <button
                  type="button"
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20 cursor-pointer"
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
                onChange={(e) => {
                  setNewGroupName(
                    e.target.value.slice(0, MAX_GROUP_NAME_LENGTH),
                  );
                }}
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
                className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
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
                  className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                  onClick={() => handleInlineCreateGroup()}
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
            onClick={() => {
              setIsInlineCreating(true);
            }}
            data-onboarding="create-group-desktop"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} />
            Create group
          </button>
        )}
      </div>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will remove the group "${deleteTarget.name}" and its bookmarks.`
                : "This will remove the group and its bookmarks."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-4xl cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-4xl cursor-pointer"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => setBulkDeleteDialogOpen(open)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected groups?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {selectedCount} group{selectedCount === 1 ? "" : "s"} and their bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-4xl cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-4xl cursor-pointer"
              onClick={handleConfirmBulkDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
