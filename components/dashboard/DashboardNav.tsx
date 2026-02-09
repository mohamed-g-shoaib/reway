"use client";

import { useRef, useState } from "react";
import { GroupRow } from "@/lib/supabase/queries";
import Image from "next/image";
import Link from "next/link";
import { createGroup } from "@/app/dashboard/actions/groups";
import { ImportDialog } from "./nav/ImportDialog";
import { ExportDialog } from "./nav/ExportDialog";
import { ViewModeControls } from "./nav/ViewModeControls";
import { UserMenu } from "./nav/UserMenu";
import { GroupMenu } from "./nav/GroupMenu";
import type { User } from "./nav/types";

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
    status: "idle" | "importing" | "done" | "error";
  };
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
  exportGroupOptions,
  importPreview,
  importProgress,
  exportProgress,
  onImportFileSelected,
  onUpdateImportAction,
  onConfirmImport,
  onClearImport,
  onExportBookmarks,
  onResetExport,
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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
    setImportDialogOpen(true);
    if (importPreview) {
      setSelectedImportGroups(importPreview.groups.map((group) => group.name));
    } else {
      setSelectedImportGroups([]);
    }
  };

  const handleOpenExportDialog = () => {
    if (!hasInitializedExportSelection.current) {
      setSelectedExportGroups(exportGroupOptions);
      hasInitializedExportSelection.current = true;
    }
    onResetExport?.();
    setExportDialogOpen(true);
  };

  const handleExportOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedExportGroups([]);
      onResetExport?.();
    }
    setExportDialogOpen(open);
  };

  return (
    <>
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        importPreview={importPreview}
        importProgress={importProgress}
        selectedImportGroups={selectedImportGroups}
        onToggleImportGroup={handleToggleImportGroup}
        onImportFileSelected={onImportFileSelected}
        onUpdateImportAction={onUpdateImportAction}
        onConfirmImport={onConfirmImport}
        onClearImport={onClearImport}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={handleExportOpenChange}
        exportGroupOptions={exportGroupOptions}
        exportProgress={exportProgress}
        selectedExportGroups={selectedExportGroups}
        onToggleExportGroup={handleToggleExportGroup}
        onExportBookmarks={onExportBookmarks}
      />

      <nav className="z-40 mx-auto max-w-3xl transition-transform duration-200 group-data-[scrolled=true]/body:top-2">
        <div className="flex h-14 w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden md:flex shrink-0 items-center transition-opacity hover:opacity-80 active:scale-95"
            >
              <Image
                src="/logo.svg"
                width={32}
                height={32}
                alt="Reway Logo"
                className="select-none dark:invert"
              />
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
              deleteConfirmGroupId={deleteConfirmGroupId}
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
              onOpenImportDialog={handleOpenImportDialog}
              onOpenExportDialog={handleOpenExportDialog}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
