"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUpRight03Icon,
  Cancel01Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  Folder01Icon,
  PencilEdit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { GroupRow } from "@/lib/supabase/queries";
import type { IconPickerPopoverProps } from "../IconPickerPopover";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
  groupCounts?: Record<string, number>;
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
  onUpdateGroup: (id: string, onError?: () => void) => void;
  isInlineCreating: boolean;
  setIsInlineCreating: (value: boolean) => void;
  newGroupName: string;
  setNewGroupName: (value: string) => void;
  newGroupIcon: string;
  setNewGroupIcon: (value: string) => void;
  newGroupColor: string | null;
  setNewGroupColor: (value: string | null) => void;
  isCreating: boolean;
  onInlineCreate: (onError?: () => void) => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [iconsMap, setIconsMap] = useState<Record<
    string,
    IconSvgElement
  > | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupRow | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

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

  useEffect(() => {
    const openHandler = () => setMenuOpen(true);
    const closeHandler = () => setMenuOpen(false);
    window.addEventListener("reway:open-groups-menu", openHandler);
    window.addEventListener("reway:close-groups-menu", closeHandler);
    return () => {
      window.removeEventListener("reway:open-groups-menu", openHandler);
      window.removeEventListener("reway:close-groups-menu", closeHandler);
    };
  }, []);

  const totalCount = Object.values(groupCounts || {}).reduce(
    (acc, count) => acc + count,
    0,
  );

  const activeGroup =
    activeGroupId === "all"
      ? { name: "All Bookmarks", icon: "folder", color: null }
      : groups.find((g) => g.id === activeGroupId) || {
          name: "Unknown",
          icon: "folder",
          color: null,
        };

  const ActiveIcon = activeGroup.icon
    ? (iconsMap?.[activeGroup.icon] ?? Folder01Icon)
    : Folder01Icon;

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

  const selectedCount = selectedGroupIds.size;

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDeleteGroupClick(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedGroupIds.size === 0) return;
    Array.from(selectedGroupIds).forEach((id) => onDeleteGroupClick(id));
    setBulkDeleteDialogOpen(false);
    exitSelectionMode();
    setMenuOpen(false);
  };

  return (
    <div className="md:hidden">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            data-onboarding="groups-mobile"
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
          className="w-56 p-2 animate-in slide-in-from-top-2 duration-200 motion-reduce:animate-none shadow-none"
        >
          {selectionMode ? (
            <div className="px-1 pb-2">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedCount} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <UIButton
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0 rounded-4xl font-bold cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        exitSelectionMode();
                      }}
                      aria-label="Cancel selection"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={14} />
                    </UIButton>
                    <UIButton
                      size="sm"
                      variant="destructive"
                      className="h-7 w-7 p-0 rounded-4xl cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBulkDelete();
                      }}
                      disabled={selectedCount === 0}
                      aria-label="Delete selected groups"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </UIButton>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DropdownMenuItem
            className={`group rounded-xl font-medium cursor-pointer flex items-center justify-between gap-3 py-2 ${
              activeGroupId === "all"
                ? "bg-primary/5 text-primary font-bold"
                : "text-muted-foreground"
            }`}
            onSelect={(event) => {
              if (!selectionMode) return;
              event.preventDefault();
            }}
            onClick={() => {
              if (selectionMode) return;
              onGroupSelect("all");
              setMenuOpen(false);
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 mt-0.5">
              <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
              <span>All Bookmarks</span>
            </div>
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
                const GroupIcon = group.icon
                  ? (iconsMap?.[group.icon] ?? Folder01Icon)
                  : Folder01Icon;
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
                                iconsMap?.[editGroupIcon] ??
                                iconsMap?.["folder"] ??
                                Folder01Icon
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
                          onChange={(e) => {
                            setEditGroupName(
                              e.target.value.slice(0, MAX_GROUP_NAME_LENGTH),
                            );
                          }}
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
                      <div className="flex items-center justify-between gap-2">
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
                        <div className="flex items-center justify-end flex-1 gap-2">
                          <CharacterCount
                            current={editGroupName.length}
                            max={MAX_GROUP_NAME_LENGTH}
                          />
                          <UIButton
                            size="sm"
                            className="h-7 px-3 text-xs rounded-4xl whitespace-nowrap min-w-[72px]"
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

                return (
                  <div
                    key={group.id}
                    className="group/menu-row relative flex items-center gap-3 rounded-xl"
                  >
                    <DropdownMenuItem
                      asChild
                      className={`group flex-1 cursor-pointer py-2 pr-20 ${
                        activeGroupId === group.id
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                      onSelect={(event) => {
                        if (!selectionMode) return;
                        event.preventDefault();
                      }}
                    >
                      {selectionMode ? (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSelected(group.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              toggleSelected(group.id);
                            }
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3 text-left transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Checkbox
                              checked={selectedGroupIds.has(group.id)}
                              onClick={(event) => event.stopPropagation()}
                              onCheckedChange={() => {
                                toggleSelected(group.id);
                              }}
                            />
                            <span className="truncate">{group.name}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onGroupSelect(group.id);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3 text-left transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <HugeiconsIcon
                              icon={GroupIcon}
                              size={16}
                              strokeWidth={2}
                              style={{ color: group.color || undefined }}
                              className={group.color ? "" : "text-foreground/80"}
                            />
                            <span className="truncate">{group.name}</span>
                          </div>
                        </button>
                      )}
                    </DropdownMenuItem>

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-11 w-11 md:h-7 md:w-7 flex items-center justify-center rounded-lg hover:bg-muted/60 cursor-pointer text-muted-foreground/90 hover:text-foreground transition-colors duration-200"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`${group.name} options`}
                            disabled={selectionMode}
                          >
                            <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40">
                          <DropdownMenuItem
                            onSelect={() => {
                              if (!selectionMode) {
                                enterSelectionMode();
                                toggleSelected(group.id);
                              } else {
                                toggleSelected(group.id);
                              }
                            }}
                            className="gap-2 text-xs rounded-xl cursor-pointer"
                          >
                            <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                            {selectionMode ? "Toggle selection" : "Select groups"}
                          </DropdownMenuItem>
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
                            onSelect={() => {
                              openDeleteDialog(group);
                            }}
                            className="gap-2 text-xs rounded-xl cursor-pointer text-destructive/80 focus:text-destructive"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                            Delete group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                        iconsMap?.[newGroupIcon] ??
                        iconsMap?.["folder"] ??
                        Folder01Icon
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
                  onChange={(e) => {
                    setNewGroupName(
                      e.target.value.slice(0, MAX_GROUP_NAME_LENGTH),
                    );
                  }}
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
              <div className="flex items-center justify-between gap-2">
                <UIButton
                  size="sm"
                  variant="secondary"
                  className="h-7 px-3 text-xs rounded-4xl font-bold"
                  onClick={() => {
                    onInlineCreateCancel();
                  }}
                >
                  Cancel
                </UIButton>
                <div className="flex items-center justify-end flex-1 gap-2">
                  <CharacterCount
                    current={newGroupName.length}
                    max={MAX_GROUP_NAME_LENGTH}
                  />
                  <UIButton
                    size="sm"
                    className="h-7 px-3 text-xs rounded-4xl whitespace-nowrap min-w-[72px]"
                    onClick={() => onInlineCreate()}
                    disabled={!newGroupName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Save"}
                  </UIButton>
                </div>
              </div>
            </div>
          ) : (
            <DropdownMenuItem
              data-onboarding="create-group-mobile"
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
    </div>
  );
}
