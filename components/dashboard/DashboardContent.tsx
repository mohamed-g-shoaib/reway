"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { FolderBoard } from "@/components/dashboard/FolderBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import type { User } from "@/components/dashboard/nav/types";
import { useIsMac } from "@/hooks/useIsMac";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { GridIcon, ArrowUpRight03Icon } from "@hugeicons/core-free-icons";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import dynamic from "next/dynamic";
import { DashboardSidebar } from "./content/DashboardSidebar";
import { TableHeader } from "./content/TableHeader";
import { FloatingActionBar } from "./content/FloatingActionBar";
import { ConflictBar } from "./content/ConflictBar";
import { useDashboardRealtime } from "./content/useDashboardRealtime";
import { useImportHandlers } from "./content/useImportHandlers";
import { useExportHandlers } from "./content/useExportHandlers";
import { useGroupShortcuts } from "./content/useGroupShortcuts";
import { useGroupActions } from "./content/useGroupActions";
import { useSelectionActions } from "./content/useSelectionActions";
import { useBookmarkActions } from "./content/useBookmarkActions";
import { useOpenGroup } from "./content/useOpenGroup";
import { useCommandMode } from "./content/useCommandMode";
import { useDashboardDerived } from "./content/useDashboardDerived";

const EXTENSION_STORE_URL = "https://example.com/reway-extension";

interface DashboardContentProps {
  user: User;
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
}

import {
  addBookmark,
  checkDuplicateBookmarks,
  deleteBookmark as deleteAction,
  enrichCreatedBookmark,
  restoreBookmark as restoreAction,
  updateBookmark as updateBookmarkAction,
  updateBookmarksOrder,
  updateFolderBookmarksOrder,
} from "@/app/dashboard/actions/bookmarks";
import {
  createGroup,
  deleteGroup as deleteGroupAction,
  restoreGroup as restoreGroupAction,
  updateGroup as updateGroupAction,
} from "@/app/dashboard/actions/groups";

import type { IconPickerPopoverProps } from "./IconPickerPopover";
import type {
  EnrichmentResult,
  ImportEntry,
  ImportGroupSummary,
} from "./content/dashboard-types";

const IconPickerPopover = dynamic<IconPickerPopoverProps>(
  () => import("./IconPickerPopover").then((mod) => mod.IconPickerPopover),
  {
    loading: () => (
      <div className="h-8 w-8 animate-pulse rounded-lg bg-primary/10" />
    ),
    ssr: false,
  },
);

export function DashboardContent({
  user,
  initialBookmarks,
  initialGroups,
}: DashboardContentProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>(initialBookmarks);
  const [groups, setGroups] = useState<GroupRow[]>(initialGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [rowContent, setRowContent] = useState<"date" | "group">("date");
  const [viewMode, setViewMode] = useState<
    "list" | "card" | "icon" | "folders"
  >("list");
  const [keyboardContext, setKeyboardContext] = useState<"folder" | "bookmark">(
    "bookmark",
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandMode, setCommandMode] = useState<"add" | "search">("add");
  const isMac = useIsMac();
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const nonFolderViewMode = viewMode === "folders" ? "list" : viewMode;
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupIcon, setEditGroupIcon] = useState("folder");
  const [editGroupColor, setEditGroupColor] = useState<string | null>(null);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<
    string | null
  >(null);
  const [isInlineCreating, setIsInlineCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("folder");
  const [newGroupColor, setNewGroupColor] = useState<string | null>("#6366f1");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const lastDeletedRef = React.useRef<{
    bookmark: BookmarkRow;
    index: number;
  } | null>(null);
  const lastDeletedGroupRef = React.useRef<GroupRow | null>(null);
  const lastBulkDeletedRef = React.useRef<
    { bookmark: BookmarkRow; index: number }[]
  >([]);
  const [addConflicts, setAddConflicts] = useState<
    { url: string; title: string }[] | null
  >(null);
  const viewModeStorageKey = "reway.dashboard.viewMode";

  const normalizeGroupName = useCallback((value?: string | null) => {
    const name = value?.trim() ?? "";
    return name.length > 0 ? name : "Ungrouped";
  }, []);

  const isValidImportUrl = useCallback((url: string) => {
    if (!url) return false;
    if (!/^https?:\/\//i.test(url)) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const sortBookmarks = useCallback((items: BookmarkRow[]) => {
    return items.toSorted((a, b) => {
      const aOrder = a.order_index ?? Number.POSITIVE_INFINITY;
      const bOrder = b.order_index ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, []);

  const sortGroups = useCallback((items: GroupRow[]) => {
    return items.toSorted((a, b) => {
      // Handle cases where name might be undefined or null
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
  }, []);

  // Sync state with server props on mount only
  // Store initial data in ref to avoid re-renders on prop changes
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!hasInitialized.current) {
      setBookmarks(initialBookmarks);
      setGroups(sortGroups(initialGroups));
      hasInitialized.current = true;
    }
  }, [initialBookmarks, initialGroups, sortGroups]);

  React.useEffect(() => {
    try {
      const storedView = window.localStorage.getItem(viewModeStorageKey);
      if (
        storedView === "list" ||
        storedView === "card" ||
        storedView === "icon" ||
        storedView === "folders"
      ) {
        setViewMode(storedView);
      }
    } catch (error) {
      console.warn("Failed to load view mode:", error);
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(viewModeStorageKey, viewMode);
    } catch (error) {
      console.warn("Failed to persist view mode:", error);
    }
  }, [viewMode]);

  React.useEffect(() => {
    if (viewMode !== "folders") {
      setKeyboardContext("bookmark");
    }
  }, [viewMode]);

  useDashboardRealtime({
    userId: user.id,
    sortBookmarks,
    sortGroups,
    setBookmarks,
    setGroups,
  });

  const {
    addOptimisticBookmark,
    applyEnrichment,
    replaceBookmarkId,
    handleFolderReorder,
    handleDeleteBookmark,
    handleReorder,
    handleEditBookmark,
  } = useBookmarkActions({
    activeGroupId,
    initialBookmarks,
    setBookmarks,
    sortBookmarks,
    updateBookmarksOrder,
    updateFolderBookmarksOrder,
    deleteBookmark: deleteAction,
    restoreBookmark: restoreAction,
    updateBookmark: updateBookmarkAction,
    lastDeletedRef,
  });

  const { filteredBookmarks, groupCounts, exportGroupOptions } =
    useDashboardDerived({
      bookmarks,
      groups,
      activeGroupId,
      deferredSearchQuery,
    });

  useGroupShortcuts({ groups, setActiveGroupId });

  const {
    handleGroupCreated,
    handleUpdateGroup,
    handleSidebarGroupUpdate,
    handleDeleteGroup,
    handleDeleteGroupClick,
    handleInlineCreateGroup,
  } = useGroupActions({
    userId: user.id,
    activeGroupId,
    groups,
    setGroups,
    sortGroups,
    setActiveGroupId,
    editGroupName,
    editGroupIcon,
    editGroupColor,
    setEditingGroupId,
    isUpdatingGroup,
    setIsUpdatingGroup,
    deleteConfirmGroupId,
    setDeleteConfirmGroupId,
    lastDeletedGroupRef,
    createGroup,
    updateGroup: updateGroupAction,
    deleteGroup: deleteGroupAction,
    restoreGroup: restoreGroupAction,
    initialGroups,
    newGroupName,
    newGroupIcon,
    newGroupColor,
    setIsInlineCreating,
    setNewGroupName,
    setNewGroupIcon,
    setNewGroupColor,
    isCreatingGroup,
    setIsCreatingGroup,
  });

  const {
    importPreview,
    importProgress,
    handleImportFileSelected,
    handleConfirmImport,
    handleClearImport,
    handleUpdateImportAction,
  } = useImportHandlers({
    bookmarks,
    groups,
    userId: user.id,
    normalizeGroupName,
    isValidImportUrl,
    sortBookmarks,
    sortGroups,
    addBookmark,
    createGroup,
    enrichCreatedBookmark,
    checkDuplicateBookmarks,
    setBookmarks,
    setGroups,
  });

  const { exportProgress, handleExportBookmarks } = useExportHandlers({
    bookmarks,
    groups,
  });

  const handleResolveConflicts = useCallback(
    async (action: "skip" | "override") => {
      // 1. Handle Add Conflicts (from CommandBar)
      if (addConflicts) {
        const toProcess = [...addConflicts];
        setAddConflicts(null);

        if (action === "override") {
          await Promise.all(
            toProcess.map(async (item) => {
              const stableId = crypto.randomUUID();
              const optimistic = {
                id: stableId,
                url: item.url,
                title: item.title || item.url,
                favicon_url: null,
                description: null,
                group_id: activeGroupId !== "all" ? activeGroupId : null,
                user_id: user.id || "",
                created_at: new Date().toISOString(),
                order_index: Number.MIN_SAFE_INTEGER,
                status: "pending",
              } as BookmarkRow;

              addOptimisticBookmark(optimistic);

              try {
                const bookmarkId = await addBookmark({
                  url: item.url,
                  id: stableId,
                  title: item.title,
                  group_id: activeGroupId !== "all" ? activeGroupId : undefined,
                });
                if (bookmarkId) {
                  replaceBookmarkId(stableId, bookmarkId);
                }
                const enrichment = (await enrichCreatedBookmark(
                  bookmarkId ?? stableId,
                  item.url,
                )) as EnrichmentResult | undefined;
                applyEnrichment(bookmarkId ?? stableId, enrichment);
              } catch (error) {
                console.error("Failed to add duplicate bookmark:", error);
                toast.error(`Failed to add ${item.url}`);
              }
            }),
          );
        }
      }

      // 2. Handle Import Conflicts
      if (importPreview) {
        handleUpdateImportAction(action);
      }
    },
    [
      addConflicts,
      importPreview,
      handleUpdateImportAction,
      addOptimisticBookmark,
      applyEnrichment,
      replaceBookmarkId,
      user.id,
      activeGroupId,
    ],
  );

  const {
    handleToggleSelection,
    handleOpenSelected,
    handleBulkDelete,
    handleCancelSelection,
  } = useSelectionActions({
    bookmarks,
    selectedIds,
    setSelectedIds,
    setSelectionMode,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    setBookmarks,
    initialBookmarks,
    deleteBookmark: deleteAction,
    restoreBookmark: restoreAction,
    lastBulkDeletedRef,
  });

  const { handleOpenGroup } = useOpenGroup({
    bookmarks,
    deferredSearchQuery,
    extensionStoreUrl: EXTENSION_STORE_URL,
  });

  const { handleCommandModeChange } = useCommandMode({
    setCommandMode,
    setSearchQuery,
  });

  return (
    <>
      <div className="relative flex flex-col h-[calc(100dvh-3rem)] overflow-hidden">
        <DashboardSidebar
          groups={groups}
          activeGroupId={activeGroupId}
          setActiveGroupId={setActiveGroupId}
          handleOpenGroup={handleOpenGroup}
          editingGroupId={editingGroupId}
          setEditingGroupId={setEditingGroupId}
          editGroupName={editGroupName}
          setEditGroupName={setEditGroupName}
          editGroupIcon={editGroupIcon}
          setEditGroupIcon={setEditGroupIcon}
          editGroupColor={editGroupColor}
          setEditGroupColor={setEditGroupColor}
          isUpdatingGroup={isUpdatingGroup}
          handleSidebarGroupUpdate={handleSidebarGroupUpdate}
          deleteConfirmGroupId={deleteConfirmGroupId}
          handleDeleteGroupClick={handleDeleteGroupClick}
          isInlineCreating={isInlineCreating}
          setIsInlineCreating={setIsInlineCreating}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          newGroupIcon={newGroupIcon}
          setNewGroupIcon={setNewGroupIcon}
          newGroupColor={newGroupColor}
          setNewGroupColor={setNewGroupColor}
          isCreatingGroup={isCreatingGroup}
          handleInlineCreateGroup={handleInlineCreateGroup}
        />
        {/* Fixed Header Section */}
        <div className="flex-none z-40 bg-background/80 backdrop-blur-xl px-1">
          <DashboardNav
            user={user}
            groups={groups}
            activeGroupId={activeGroupId}
            groupCounts={groupCounts}
            onGroupSelect={setActiveGroupId}
            onGroupCreated={handleGroupCreated}
            onGroupUpdate={handleUpdateGroup}
            onGroupDelete={handleDeleteGroup}
            onGroupOpen={handleOpenGroup}
            rowContent={rowContent}
            setRowContent={setRowContent}
            viewMode={viewMode}
            setViewMode={setViewMode}
            exportGroupOptions={exportGroupOptions}
            importPreview={importPreview}
            importProgress={importProgress}
            exportProgress={exportProgress}
            onImportFileSelected={handleImportFileSelected}
            onUpdateImportAction={handleUpdateImportAction}
            onConfirmImport={handleConfirmImport}
            onClearImport={handleClearImport}
            onExportBookmarks={handleExportBookmarks}
          />
          <div className="pt-4 md:pt-6">
            <CommandBar
              onAddBookmark={addOptimisticBookmark}
              onApplyEnrichment={applyEnrichment}
              onReplaceBookmarkId={replaceBookmarkId}
              mode={commandMode}
              searchQuery={searchQuery}
              onModeChange={handleCommandModeChange}
              onSearchChange={setSearchQuery}
              onDuplicatesDetected={setAddConflicts}
            />
          </div>

          {/* Table Header - Fixed (List view only) */}
          <TableHeader
            viewMode={viewMode}
            keyboardContext={keyboardContext}
            isMac={isMac}
          />
        </div>

        {/* Scrollable Bookmarks Section */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto overscroll-contain min-h-0 px-1 pt-3 md:pt-2 pb-6 scrollbar-hover-only">
            <div>
              {viewMode === "folders" ? (
                <FolderBoard
                  bookmarks={filteredBookmarks}
                  groups={groups}
                  activeGroupId={activeGroupId}
                  onReorder={handleFolderReorder}
                  onDeleteBookmark={handleDeleteBookmark}
                  onEditBookmark={handleEditBookmark}
                  selectionMode={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelection={handleToggleSelection}
                  onEnterSelectionMode={() => setSelectionMode(true)}
                  onKeyboardContextChange={setKeyboardContext}
                />
              ) : (
                <BookmarkBoard
                  bookmarks={filteredBookmarks}
                  initialGroups={groups}
                  onReorder={handleReorder}
                  onDeleteBookmark={handleDeleteBookmark}
                  onEditBookmark={handleEditBookmark}
                  rowContent={rowContent}
                  viewMode={nonFolderViewMode}
                  selectionMode={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelection={handleToggleSelection}
                  onEnterSelectionMode={() => setSelectionMode(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        {selectionMode && selectedIds.size > 0 && (
          <FloatingActionBar
            selectedCount={selectedIds.size}
            bulkDeleteConfirm={bulkDeleteConfirm}
            onOpenSelected={handleOpenSelected}
            onBulkDelete={handleBulkDelete}
            onCancelSelection={handleCancelSelection}
          />
        )}
        <ConflictBar
          addConflicts={addConflicts}
          importPreview={importPreview}
          onResolve={handleResolveConflicts}
        />
      </div>
    </>
  );
}
