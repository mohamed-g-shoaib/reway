"use client";

import {
  ArrowDown01Icon,
  Settings01Icon,
  Logout01Icon,
  AiMagicIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/dashboard/actions";
import { SettingsDialog } from "./SettingsDialog";
import { useState } from "react";
import { GroupRow } from "@/lib/supabase/queries";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GridIcon,
  Delete02Icon,
  PencilEdit01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { IconPickerPopover } from "./IconPickerPopover";
import { Button as UIButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup } from "@/app/dashboard/actions";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface DashboardNavProps {
  user: User;
  groups: GroupRow[];
  activeGroupId: string;
  groupCounts?: Record<string, number>;
  onGroupSelect: (id: string) => void;
  onGroupCreated?: (id: string, name: string, icon: string) => void;
  onGroupUpdate?: (id: string, name: string, icon: string) => void;
  onGroupDelete?: (id: string) => void;
}

export function DashboardNav({
  user,
  groups,
  activeGroupId,
  groupCounts = {},
  onGroupSelect,
  onGroupCreated,
  onGroupUpdate,
  onGroupDelete,
}: DashboardNavProps) {
  const [isInlineCreating, setIsInlineCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("folder");
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupIcon, setEditGroupIcon] = useState("folder");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<
    string | null
  >(null);

  // Get current active group
  const activeGroup =
    activeGroupId === "all"
      ? { name: "All Bookmarks", icon: "all" }
      : groups.find((g) => g.id === activeGroupId) || {
          name: "Unknown",
          icon: "folder",
        };

  const ActiveIcon =
    activeGroup.icon === "all"
      ? GridIcon
      : activeGroup.icon
        ? ALL_ICONS_MAP[activeGroup.icon]
        : GridIcon;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Get bookmark count for each group
  const getBookmarkCount = (groupId: string) => {
    return groupCounts[groupId] || 0;
  };

  const handleUpdateGroup = async (id: string) => {
    if (!editGroupName.trim() || isUpdating) return;
    setIsUpdating(true);
    try {
      await onGroupUpdate?.(id, editGroupName.trim(), editGroupIcon);
      setEditingGroupId(null);
    } catch (error) {
      console.error("Failed to update group:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGroupClick = (id: string) => {
    if (deleteConfirmGroupId === id) {
      onGroupDelete?.(id);
      setDeleteConfirmGroupId(null);
    } else {
      setDeleteConfirmGroupId(id);
      setTimeout(() => setDeleteConfirmGroupId(null), 3000);
    }
  };

  const handleInlineCreate = async () => {
    if (!newGroupName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const groupId = await createGroup({
        name: newGroupName.trim(),
        icon: newGroupIcon,
      });
      onGroupCreated?.(groupId, newGroupName.trim(), newGroupIcon);
      setIsInlineCreating(false);
      setNewGroupName("");
      setNewGroupIcon("folder");
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInlineCreateCancel = () => {
    setIsInlineCreating(false);
    setNewGroupName("");
    setNewGroupIcon("folder");
  };

  return (
    <>
      <nav className="bg-background/50 backdrop-blur-md sticky top-6 z-40">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center">
            {/* Unified Group Switcher (Icon + Name) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 px-2 rounded-2xl text-sm font-bold hover:bg-muted/50 transition-all active:scale-[0.98] -ml-2"
                >
                  <div className="flex items-center justify-center h-8 w-8">
                    {ActiveIcon && (
                      <HugeiconsIcon
                        icon={ActiveIcon}
                        size={18}
                        strokeWidth={2}
                        className="text-foreground/80"
                      />
                    )}
                  </div>
                  <span className="truncate max-w-30 md:max-w-50">
                    {activeGroup.name}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={14}
                    className="text-muted-foreground/30"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 rounded-2xl p-2 shadow-xl animate-in slide-in-from-top-2 duration-200"
              >
                <DropdownMenuItem
                  className={`rounded-xl font-medium cursor-pointer flex items-center gap-3 py-2 ${activeGroupId === "all" ? "bg-primary/5 text-primary" : ""}`}
                  onClick={() => onGroupSelect("all")}
                >
                  <HugeiconsIcon icon={GridIcon} size={16} strokeWidth={2} />
                  All Bookmarks
                </DropdownMenuItem>

                {groups.length > 0 && (
                  <div
                    className={`max-h-75 overflow-y-auto ${groups.length > 1 ? "border-t border-border/50 my-1 pt-1" : "mt-1"}`}
                  >
                    {groups.map((group) => {
                      const GroupIcon = group.icon
                        ? ALL_ICONS_MAP[group.icon]
                        : null;
                      const isEditing = editingGroupId === group.id;

                      if (isEditing) {
                        // Inline edit mode
                        return (
                          <div
                            key={group.id}
                            className="px-2 py-3 space-y-2 bg-muted/20 rounded-xl border border-border/30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              <IconPickerPopover
                                selectedIcon={editGroupIcon}
                                onIconSelect={setEditGroupIcon}
                              >
                                <button
                                  type="button"
                                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                  <HugeiconsIcon
                                    icon={
                                      ALL_ICONS_MAP[editGroupIcon] ||
                                      ALL_ICONS_MAP["folder"]
                                    }
                                    size={16}
                                    strokeWidth={2}
                                    className="text-primary"
                                  />
                                </button>
                              </IconPickerPopover>
                              <Input
                                value={editGroupName}
                                onChange={(e) =>
                                  setEditGroupName(e.target.value)
                                }
                                placeholder="Group name"
                                className="h-8 flex-1 text-sm rounded-lg"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateGroup(group.id);
                                  } else if (e.key === "Escape") {
                                    setEditingGroupId(null);
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <UIButton
                                size="sm"
                                variant="ghost"
                                className="h-7 px-3 text-xs"
                                onClick={() => setEditingGroupId(null)}
                              >
                                Cancel
                              </UIButton>
                              <UIButton
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => handleUpdateGroup(group.id)}
                                disabled={!editGroupName.trim() || isUpdating}
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </UIButton>
                            </div>
                          </div>
                        );
                      }

                      const isDeleteConfirm = deleteConfirmGroupId === group.id;

                      return (
                        <DropdownMenuItem
                          key={group.id}
                          className={`rounded-xl cursor-pointer flex items-center justify-between gap-2 py-2 ${activeGroupId === group.id ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground"}`}
                          onSelect={(e) => {
                            // If we click a button (edit/delete), don't close the menu
                            const isButton = (e.target as HTMLElement).closest(
                              "button",
                            );
                            if (isButton) {
                              e.preventDefault();
                            } else {
                              onGroupSelect(group.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {GroupIcon && (
                              <HugeiconsIcon
                                icon={GroupIcon}
                                size={16}
                                strokeWidth={2}
                              />
                            )}
                            <span className="truncate">{group.name}</span>
                          </div>
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs text-muted-foreground/50 mr-1">
                              {getBookmarkCount(group.id)}
                            </span>
                            <button
                              type="button"
                              className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGroupId(group.id);
                                setEditGroupName(group.name);
                                setEditGroupIcon(group.icon || "folder");
                              }}
                            >
                              <HugeiconsIcon
                                icon={PencilEdit01Icon}
                                size={14}
                                className="text-muted-foreground/70"
                              />
                            </button>
                            <button
                              type="button"
                              className={`p-1 rounded-md transition-all duration-200 ${
                                isDeleteConfirm
                                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  : "hover:bg-destructive/10 hover:text-destructive"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroupClick(group.id);
                              }}
                              title={
                                isDeleteConfirm
                                  ? "Click again to confirm"
                                  : "Delete group"
                              }
                            >
                              <div
                                className="transition-all duration-200 ease-in-out"
                                key={isDeleteConfirm ? "alert" : "delete"}
                              >
                                <HugeiconsIcon
                                  icon={
                                    isDeleteConfirm ? Alert02Icon : Delete02Icon
                                  }
                                  size={14}
                                  className={
                                    isDeleteConfirm
                                      ? "text-destructive"
                                      : "text-destructive/70"
                                  }
                                />
                              </div>
                            </button>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}

                <DropdownMenuSeparator className="my-2" />

                {/* Inline Create Mode */}
                {isInlineCreating ? (
                  <div
                    className="px-2 py-3 space-y-2 bg-primary/5 rounded-xl border border-primary/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <IconPickerPopover
                        selectedIcon={newGroupIcon}
                        onIconSelect={setNewGroupIcon}
                      >
                        <button
                          type="button"
                          className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <HugeiconsIcon
                            icon={ALL_ICONS_MAP[newGroupIcon]}
                            size={16}
                            strokeWidth={2}
                            className="text-primary"
                          />
                        </button>
                      </IconPickerPopover>
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Group name"
                        className="h-8 flex-1 text-sm rounded-lg"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleInlineCreate();
                          } else if (e.key === "Escape") {
                            handleInlineCreateCancel();
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <UIButton
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs"
                        onClick={handleInlineCreateCancel}
                      >
                        Cancel
                      </UIButton>
                      <UIButton
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={handleInlineCreate}
                        disabled={!newGroupName.trim() || isCreating}
                      >
                        {isCreating ? "Creating..." : "Save"}
                      </UIButton>
                    </div>
                  </div>
                ) : (
                  <DropdownMenuItem
                    className="rounded-xl text-primary font-medium focus:bg-primary/5 cursor-pointer flex items-center gap-3 py-2"
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsInlineCreating(true);
                    }}
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      size={16}
                      className="shrink-0"
                    />
                    New Group
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0 flex shrink-0 hover:bg-muted/50 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Avatar className="h-8 w-8 transition-transform active:scale-95">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-linear-to-br from-pink-500 to-rose-500 text-white font-semibold text-xs transition-transform active:scale-95">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
              >
                <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <SettingsDialog>
                  <DropdownMenuItem
                    className="rounded-xl flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/5"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                    Settings
                  </DropdownMenuItem>
                </SettingsDialog>
                <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-primary cursor-pointer transition-colors focus:bg-primary/5 font-medium">
                  <HugeiconsIcon icon={AiMagicIcon} size={16} />
                  Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOut}>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl flex items-center gap-2 text-destructive cursor-pointer transition-colors focus:bg-destructive/5 focus:text-destructive w-full"
                  >
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2"
                    >
                      <HugeiconsIcon icon={Logout01Icon} size={16} />
                      Log out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
}
