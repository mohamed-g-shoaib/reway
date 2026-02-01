"use client";

import {
  ArrowDown01Icon,
  ArrowUpRight03Icon,
  Settings01Icon,
  Logout01Icon,
  AiMagicIcon,
  Add01Icon,
  Menu01Icon,
  SquareIcon,
  CircleIcon,
  Key02Icon,
  Folder01Icon,
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
import Image from "next/image";
import Link from "next/link";
import {
  GridIcon,
  Delete02Icon,
  PencilEdit01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Button as UIButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup } from "@/app/dashboard/actions";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import type { IconPickerPopoverProps } from "./IconPickerPopover";
import { ApiTokenDialog } from "./ApiTokenDialog";

// Dynamically load the heavy icon picker to optimize initial bundle size
const IconPickerPopover = dynamic<IconPickerPopoverProps>(
  () => import("./IconPickerPopover").then((mod) => mod.IconPickerPopover),
  {
    loading: () => (
      <div className="h-8 w-8 animate-pulse rounded-lg bg-primary/10" />
    ),
    ssr: false,
  },
);

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
  onGroupCreated?: (
    id: string,
    name: string,
    icon: string,
    color?: string | null,
  ) => void;
  onGroupUpdate?: (
    id: string,
    name: string,
    icon: string,
    color?: string | null,
  ) => void;
  onGroupDelete?: (id: string) => void;
  onGroupOpen?: (id: string) => void;
  rowContent: "date" | "group";
  setRowContent: (value: "date" | "group") => void;
  viewMode: "list" | "card" | "icon" | "folders";
  setViewMode: (value: "list" | "card" | "icon" | "folders") => void;
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
  onGroupOpen,
  rowContent,
  setRowContent,
  viewMode,
  setViewMode,
}: DashboardNavProps) {
  const [isInlineCreating, setIsInlineCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("folder");
  const [newGroupColor, setNewGroupColor] = useState<string | null>("#6366f1");
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupIcon, setEditGroupIcon] = useState("folder");
  const [editGroupColor, setEditGroupColor] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<
    string | null
  >(null);

  // Get current active group
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
      await onGroupUpdate?.(
        id,
        editGroupName.trim(),
        editGroupIcon,
        editGroupColor,
      );
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
      toast.error("Group deleted");
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
        color: newGroupColor,
      });
      onGroupCreated?.(
        groupId,
        newGroupName.trim(),
        newGroupIcon,
        newGroupColor,
      );
      setIsInlineCreating(false);
      setNewGroupName("");
      setNewGroupIcon("folder");
      setNewGroupColor("#6366f1");
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
    setNewGroupColor("#6366f1");
  };

  return (
    <>
      <nav className="z-40 mx-auto max-w-3xl transition-transform duration-300 group-data-[scrolled=true]/body:top-2">
        <div className="flex h-14 w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden md:flex shrink-0 items-center transition-opacity hover:opacity-80 active:scale-95"
            >
              <Image
                src="/logo.svg"
                width={28}
                height={28}
                alt="Reway Logo"
                className="select-none dark:invert"
              />
            </Link>

            {/* Unified Group Switcher (Icon + Name) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 px-2 rounded-xl text-sm font-bold hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center h-8 w-8">
                    {ActiveIcon ? (
                      <HugeiconsIcon
                        icon={ActiveIcon}
                        size={18}
                        strokeWidth={2}
                        style={{ color: activeGroup.color || undefined }}
                        className="text-foreground/80"
                      />
                    ) : null}
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
                className="w-56 rounded-2xl p-2 animate-in slide-in-from-top-2 duration-200 ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
              >
                <DropdownMenuItem
                  className={`group rounded-xl font-medium cursor-pointer flex items-center justify-between gap-3 py-2 ${activeGroupId === "all" ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground"}`}
                  onClick={() => onGroupSelect("all")}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                    <HugeiconsIcon icon={GridIcon} size={16} strokeWidth={2} />
                    <span>All Bookmarks</span>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onGroupOpen?.("all");
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-foreground transition-opacity"
                    aria-label="Open all bookmarks"
                  >
                    <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                  </button>
                </DropdownMenuItem>

                {groups.length > 0 ? (
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
                            className="relative mx-1 my-1.5 px-3 py-3 space-y-3 bg-muted/20 rounded-xl ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate"
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
                                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                  aria-label="Select group icon"
                                >
                                  <HugeiconsIcon
                                    icon={
                                      ALL_ICONS_MAP[editGroupIcon] ||
                                      ALL_ICONS_MAP["folder"]
                                    }
                                    size={16}
                                    strokeWidth={2}
                                    style={{
                                      color: editGroupColor || "#6366f1",
                                    }}
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
                                  // Stop all key events from propagating to prevent dropdown typeahead navigation
                                  e.stopPropagation();
                                  if (e.key === "Enter") {
                                    handleUpdateGroup(group.id);
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
                              <UIButton
                                size="sm"
                                className="h-7 px-3 text-xs rounded-4xl"
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
                        <div
                          key={group.id}
                          className={`group/menu-row relative flex items-center gap-3 rounded-xl ${isDeleteConfirm ? "bg-muted/50" : ""}`}
                        >
                          <DropdownMenuItem
                            asChild
                            className={`group flex-1 cursor-pointer py-2 pr-20 transition-colors ${activeGroupId === group.id ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground"}`}
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
                                />
                              ) : null}
                              <span className="truncate">{group.name}</span>
                            </button>
                          </DropdownMenuItem>

                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {/* Mobile: actions always visible */}
                            <div className="flex items-center gap-1 md:hidden">
                              <div className="flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
                                <button
                                  type="button"
                                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/60 cursor-pointer text-muted-foreground/70 hover:text-primary transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onGroupOpen?.(group.id);
                                  }}
                                  aria-label={`Open ${group.name}`}
                                >
                                  <HugeiconsIcon
                                    icon={ArrowUpRight03Icon}
                                    size={13}
                                  />
                                </button>
                                <button
                                  type="button"
                                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/60 cursor-pointer text-muted-foreground/70 hover:text-primary transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingGroupId(group.id);
                                    setEditGroupName(group.name);
                                    setEditGroupIcon(group.icon || "folder");
                                    setEditGroupColor(group.color || "#6366f1");
                                  }}
                                  aria-label={`Edit ${group.name}`}
                                >
                                  <HugeiconsIcon
                                    icon={PencilEdit01Icon}
                                    size={13}
                                  />
                                </button>
                                <button
                                  type="button"
                                  className={`h-6 w-6 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                                    isDeleteConfirm
                                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                      : "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGroupClick(group.id);
                                  }}
                                  aria-label={
                                    isDeleteConfirm
                                      ? `Confirm delete ${group.name}`
                                      : `Delete ${group.name}`
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={
                                      isDeleteConfirm
                                        ? Alert02Icon
                                        : Delete02Icon
                                    }
                                    size={13}
                                  />
                                </button>
                              </div>
                              <span className="text-xs text-muted-foreground/50">
                                {getBookmarkCount(group.id)}
                              </span>
                            </div>

                            {/* Desktop: show count, reveal actions on row hover */}
                            <div className="hidden md:block relative h-7 w-24">
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 opacity-100 group-hover/menu-row:opacity-0 transition-opacity">
                                {getBookmarkCount(group.id)}
                              </span>

                              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover/menu-row:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-none group-hover/menu-row:pointer-events-auto">
                                <div className="flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
                                  <button
                                    type="button"
                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/60 cursor-pointer text-muted-foreground/70 hover:text-primary transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onGroupOpen?.(group.id);
                                    }}
                                    aria-label={`Open ${group.name}`}
                                  >
                                    <HugeiconsIcon
                                      icon={ArrowUpRight03Icon}
                                      size={13}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/60 cursor-pointer text-muted-foreground/70 hover:text-primary transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingGroupId(group.id);
                                      setEditGroupName(group.name);
                                      setEditGroupIcon(group.icon || "folder");
                                      setEditGroupColor(
                                        group.color || "#6366f1",
                                      );
                                    }}
                                    aria-label={`Edit ${group.name}`}
                                  >
                                    <HugeiconsIcon
                                      icon={PencilEdit01Icon}
                                      size={13}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    className={`h-6 w-6 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                                      isDeleteConfirm
                                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                        : "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteGroupClick(group.id);
                                    }}
                                    aria-label={
                                      isDeleteConfirm
                                        ? `Confirm delete ${group.name}`
                                        : `Delete ${group.name}`
                                    }
                                  >
                                    <HugeiconsIcon
                                      icon={
                                        isDeleteConfirm
                                          ? Alert02Icon
                                          : Delete02Icon
                                      }
                                      size={13}
                                    />
                                  </button>
                                </div>
                                <span className="text-xs text-muted-foreground/50">
                                  {getBookmarkCount(group.id)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <DropdownMenuSeparator className="my-2" />

                {/* Inline Create Mode */}
                {isInlineCreating ? (
                  <div
                    className="relative mx-1 my-1.5 px-3 py-3 space-y-3 bg-muted/20 rounded-xl ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate"
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
                          className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                          aria-label="Select group icon"
                        >
                          <HugeiconsIcon
                            icon={ALL_ICONS_MAP[newGroupIcon]}
                            size={16}
                            strokeWidth={2}
                            style={{ color: newGroupColor || "#6366f1" }}
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
                          // Stop all key events from propagating to prevent dropdown typeahead navigation
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            handleInlineCreate();
                          } else if (e.key === "Escape") {
                            handleInlineCreateCancel();
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <UIButton
                        size="sm"
                        variant="secondary"
                        className="h-7 px-3 text-xs rounded-4xl font-bold"
                        onClick={handleInlineCreateCancel}
                      >
                        Cancel
                      </UIButton>
                      <UIButton
                        size="sm"
                        className="h-7 px-3 text-xs rounded-4xl"
                        onClick={handleInlineCreate}
                        disabled={!newGroupName.trim() || isCreating}
                      >
                        {isCreating ? "Creating..." : "Save"}
                      </UIButton>
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

          <div className="flex items-center gap-2">
            {/* Mobile View Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden size-9 rounded-xl hover:bg-muted/50 transition-colors active:scale-95"
                  aria-label="Change view mode"
                >
                  <HugeiconsIcon
                    icon={
                      viewMode === "list"
                        ? Menu01Icon
                        : viewMode === "card"
                          ? SquareIcon
                          : viewMode === "icon"
                            ? CircleIcon
                            : Folder01Icon
                    }
                    size={18}
                    strokeWidth={2}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 rounded-2xl p-2 ring-1 ring-foreground/5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
              >
                <DropdownMenuItem
                  className={`rounded-lg flex items-center gap-2 cursor-pointer ${viewMode === "list" ? "bg-primary/5 text-primary font-medium" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <HugeiconsIcon icon={Menu01Icon} size={16} />
                  List
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-lg flex items-center gap-2 cursor-pointer ${viewMode === "card" ? "bg-primary/5 text-primary font-medium" : ""}`}
                  onClick={() => setViewMode("card")}
                >
                  <HugeiconsIcon icon={SquareIcon} size={16} />
                  Card
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-lg flex items-center gap-2 cursor-pointer ${viewMode === "icon" ? "bg-primary/5 text-primary font-medium" : ""}`}
                  onClick={() => setViewMode("icon")}
                >
                  <HugeiconsIcon icon={CircleIcon} size={16} />
                  Icon
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-lg flex items-center gap-2 cursor-pointer ${viewMode === "folders" ? "bg-primary/5 text-primary font-medium" : ""}`}
                  onClick={() => setViewMode("folders")}
                >
                  <HugeiconsIcon icon={Folder01Icon} size={16} />
                  Folders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop View Mode Controls */}
            <div className="hidden md:flex items-center gap-1 px-1 py-1 rounded-xl bg-muted/30">
              <UIButton
                size="icon"
                variant={viewMode === "list" ? "default" : "ghost"}
                className="size-8 rounded-lg transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <HugeiconsIcon icon={Menu01Icon} size={16} strokeWidth={2} />
              </UIButton>
              <UIButton
                size="icon"
                variant={viewMode === "card" ? "default" : "ghost"}
                className="size-8 rounded-lg transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setViewMode("card")}
                aria-label="Card view"
              >
                <HugeiconsIcon icon={SquareIcon} size={16} strokeWidth={2} />
              </UIButton>
              <UIButton
                size="icon"
                variant={viewMode === "icon" ? "default" : "ghost"}
                className="size-8 rounded-lg transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setViewMode("icon")}
                aria-label="Icon view"
              >
                <HugeiconsIcon icon={CircleIcon} size={16} strokeWidth={2} />
              </UIButton>
              <UIButton
                size="icon"
                variant={viewMode === "folders" ? "default" : "ghost"}
                className="size-8 rounded-lg transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setViewMode("folders")}
                aria-label="Folder view"
              >
                <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
              </UIButton>
            </div>

            {/* Settings Button */}
            <SettingsDialog
              rowContent={rowContent}
              onRowContentChange={setRowContent}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl hover:bg-muted/50 transition-colors active:scale-95"
                aria-label="Settings"
              >
                <HugeiconsIcon
                  icon={Settings01Icon}
                  size={18}
                  strokeWidth={2}
                />
              </Button>
            </SettingsDialog>

            {/* User Menu */}
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
                className="w-56 rounded-2xl p-2 ring-1 ring-foreground/5 animate-in slide-in-from-top-2 duration-200 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
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
                <ApiTokenDialog>
                  <DropdownMenuItem
                    className="rounded-xl flex items-center gap-2 text-primary cursor-pointer transition-colors focus:bg-primary/5 font-medium py-2"
                    onSelect={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <HugeiconsIcon icon={Key02Icon} size={16} />
                    Manage Access Tokens
                  </DropdownMenuItem>
                </ApiTokenDialog>
                <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-primary cursor-pointer transition-colors focus:bg-primary/5 font-medium py-2">
                  <HugeiconsIcon icon={AiMagicIcon} size={16} />
                  Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOut}>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl flex items-center gap-2 text-destructive cursor-pointer transition-colors focus:bg-destructive/5 focus:text-destructive w-full py-2"
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
