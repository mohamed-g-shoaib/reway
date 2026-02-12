"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { GroupRow } from "@/lib/supabase/queries";
import Link from "next/link";
import RewayLogo from "@/components/logo";
import {
  checkDuplicateGroup,
  createGroup,
} from "@/app/dashboard/actions/groups";
import { ImportSheet } from "./nav/ImportSheet";
import { ExportSheet } from "./nav/ExportSheet";
import { DuplicatesSheet } from "./nav/DuplicatesSheet";
import { ViewModeControls } from "./nav/ViewModeControls";
import { UserMenu } from "./nav/UserMenu";
import { GroupMenu } from "./nav/GroupMenu";
import type { User } from "./nav/types";
import type { BookmarkRow } from "@/lib/supabase/queries";

interface DashboardNavProps {
  user: User;
  bookmarks: BookmarkRow[];
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
  showNotesTodos: boolean;
  setShowNotesTodos: (value: boolean) => void;
  viewMode: "list" | "card" | "icon" | "folders";
  setViewMode: (value: "list" | "card" | "icon" | "folders") => void;
  exportGroupOptions: string[];
  importPreview: {
    groups: { name: string; count: number; duplicateCount?: number }[];
    entries: {
      title: string;
      url: string;
      groupName: string;
      isDuplicate?: boolean;
      action?: "skip" | "override" | "add";
    }[];
  } | null;
  importProgress: {
    processed: number;
    total: number;
    status: "idle" | "importing" | "stopping" | "done" | "error" | "stopped";
  };
  importResult: {
    imported: number;
    cancelled: number;
    total: number;
    status: "done" | "stopped" | "error";
  } | null;
  exportProgress: {
    processed: number;
    total: number;
    status: "idle" | "exporting" | "done" | "error";
  };
  onImportFileSelected: (file: File) => void;
  onUpdateImportAction: (action: "skip" | "override") => void;
  onConfirmImport: (groups: string[]) => void;
  onClearImport: () => void;
  onExportBookmarks: (groups: string[]) => void;
  onResetExport?: () => void;
  onRemoveBookmarks?: (ids: string[]) => void;
}

export function DashboardNav({
  user,
  bookmarks,
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
  showNotesTodos,
  setShowNotesTodos,
  viewMode,
  setViewMode,
  exportGroupOptions,
  importPreview,
  importProgress,
  importResult,
  exportProgress,
  onImportFileSelected,
  onUpdateImportAction,
  onConfirmImport,
  onClearImport,
  onExportBookmarks,
  onResetExport,
  onRemoveBookmarks,
}: DashboardNavProps) {
  const [isInlineCreating, setIsInlineCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("folder");
  const pickRandomGroupColor = () => {
    const palette = [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#f43f5e",
      "#f97316",
      "#f59e0b",
      "#84cc16",
      "#10b981",
      "#06b6d4",
      "#3b82f6",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const [newGroupColor, setNewGroupColor] = useState<string | null>("#6366f1");
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupIcon, setEditGroupIcon] = useState("folder");
  const [editGroupColor, setEditGroupColor] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [exportSheetOpen, setExportSheetOpen] = useState(false);
  const [duplicatesSheetOpen, setDuplicatesSheetOpen] = useState(false);
  const [selectedImportGroups, setSelectedImportGroups] = useState<string[]>(
    [],
  );
  const [selectedExportGroups, setSelectedExportGroups] = useState<string[]>(
    [],
  );
  const hasInitializedExportSelection = useRef(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUpdateGroup = async (id: string, onError?: () => void) => {
    if (!editGroupName.trim() || isUpdating) return;
    setIsUpdating(true);
    try {
      const { exists } = await checkDuplicateGroup(editGroupName.trim(), id);
      if (exists) {
        toast.error(`A group named "${editGroupName.trim()}" already exists`);
        onError?.();
        return;
      }
      await onGroupUpdate?.(
        id,
        editGroupName.trim(),
        editGroupIcon,
        editGroupColor,
      );
      setEditingGroupId(null);
    } catch (error) {
      console.error("Failed to update group:", error);
      if (error instanceof Error && /already exists/i.test(error.message)) {
        toast.error(error.message);
        onError?.();
      } else {
        toast.error("Failed to update group");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGroupClick = (id: string) => {
    onGroupDelete?.(id);
  };

  const handleInlineCreate = async (onError?: () => void) => {
    if (!newGroupName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const { exists } = await checkDuplicateGroup(newGroupName.trim());
      if (exists) {
        toast.error(`A group named "${newGroupName.trim()}" already exists`);
        onError?.();
        return;
      }

      const folderColor =
        newGroupIcon === "folder" ? pickRandomGroupColor() : newGroupColor;

      const groupId = await createGroup({
        name: newGroupName.trim(),
        icon: newGroupIcon,
        color: folderColor,
      });
      onGroupCreated?.(groupId, newGroupName.trim(), newGroupIcon, folderColor);
      setIsInlineCreating(false);
      setNewGroupName("");
      setNewGroupIcon("folder");
      setNewGroupColor("#6366f1");
    } catch (error) {
      console.error("Failed to create group:", error);
      if (error instanceof Error && /already exists/i.test(error.message)) {
        toast.error(error.message);
        onError?.();
      } else {
        toast.error("Failed to create group");
      }
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

  const handleToggleImportGroup = (name: string) => {
    setSelectedImportGroups((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  const handleToggleExportGroup = (name: string) => {
    setSelectedExportGroups((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  const handleOpenImportDialog = () => {
    setImportSheetOpen(true);
    if (importPreview) {
      setSelectedImportGroups(importPreview.groups.map((group) => group.name));
    } else {
      setSelectedImportGroups([]);
    }
  };

  const handleImportOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedImportGroups([]);

      onClearImport();
    }
    setImportSheetOpen(open);
  };

  const handleOpenExportDialog = () => {
    setSelectedExportGroups(exportGroupOptions);
    hasInitializedExportSelection.current = true;
    onResetExport?.();
    setExportSheetOpen(true);
  };

  const handleExportOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedExportGroups([]);
      onResetExport?.();
    }
    setExportSheetOpen(open);
  };

  const handleOpenDuplicatesSheet = () => {
    setDuplicatesSheetOpen(true);
  };

  return (
    <>
      <ImportSheet
        open={importSheetOpen}
        onOpenChange={handleImportOpenChange}
        importPreview={importPreview}
        importProgress={importProgress}
        importResult={importResult}
        selectedImportGroups={selectedImportGroups}
        onToggleImportGroup={handleToggleImportGroup}
        onImportFileSelected={onImportFileSelected}
        onUpdateImportAction={onUpdateImportAction}
        onConfirmImport={onConfirmImport}
        onClearImport={onClearImport}
      />

      <ExportSheet
        open={exportSheetOpen}
        onOpenChange={handleExportOpenChange}
        exportGroupOptions={exportGroupOptions}
        exportProgress={exportProgress}
        selectedExportGroups={selectedExportGroups}
        onToggleExportGroup={handleToggleExportGroup}
        onExportBookmarks={onExportBookmarks}
      />

      <DuplicatesSheet
        open={duplicatesSheetOpen}
        onOpenChange={setDuplicatesSheetOpen}
        bookmarks={bookmarks}
        onRemoveBookmarks={onRemoveBookmarks}
      />

      <nav className="z-40 mx-auto max-w-3xl transition-transform duration-200 group-data-[scrolled=true]/body:top-2">
        <div className="flex h-14 w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden md:flex shrink-0 items-center">
              <RewayLogo className="size-8" aria-label="Reway" />
            </Link>

            <GroupMenu
              groups={groups}
              activeGroupId={activeGroupId}
              groupCounts={groupCounts}
              onGroupSelect={onGroupSelect}
              onGroupOpen={onGroupOpen}
              onDeleteGroupClick={handleDeleteGroupClick}
              editingGroupId={editingGroupId}
              editGroupName={editGroupName}
              setEditGroupName={setEditGroupName}
              editGroupIcon={editGroupIcon}
              setEditGroupIcon={setEditGroupIcon}
              editGroupColor={editGroupColor}
              setEditGroupColor={setEditGroupColor}
              isUpdating={isUpdating}
              onUpdateGroup={handleUpdateGroup}
              isInlineCreating={isInlineCreating}
              setIsInlineCreating={setIsInlineCreating}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              newGroupIcon={newGroupIcon}
              setNewGroupIcon={setNewGroupIcon}
              newGroupColor={newGroupColor}
              setNewGroupColor={setNewGroupColor}
              isCreating={isCreating}
              onInlineCreate={handleInlineCreate}
              onInlineCreateCancel={handleInlineCreateCancel}
              setEditingGroupId={setEditingGroupId}
            />
          </div>

          <div className="flex items-center gap-2">
            <ViewModeControls viewMode={viewMode} setViewMode={setViewMode} />
            <UserMenu
              user={user}
              initials={initials}
              rowContent={rowContent}
              onRowContentChange={setRowContent}
              showNotesTodos={showNotesTodos}
              onShowNotesTodosChange={setShowNotesTodos}
              onOpenImportSheet={handleOpenImportDialog}
              onOpenExportSheet={handleOpenExportDialog}
              onOpenDuplicatesSheet={handleOpenDuplicatesSheet}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
