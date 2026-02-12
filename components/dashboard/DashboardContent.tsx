"use client";

import React, { useState, useCallback } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { FolderBoard } from "@/components/dashboard/FolderBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import type { User } from "@/components/dashboard/nav/types";
import { useIsMac } from "@/hooks/useIsMac";
import { toast } from "sonner";
import { DashboardSidebar } from "./content/DashboardSidebar";
import { TableHeader } from "./content/TableHeader";
import { FloatingActionBar } from "./content/FloatingActionBar";
import { DashboardOnboarding } from "./DashboardOnboarding";
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
import {
  setPreferenceCookie,
  migrateLocalStorageToCookies,
} from "@/lib/cookies";

interface DashboardContentProps {
  user: User;
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
  initialViewModeAll?: "list" | "card" | "icon" | "folders";
  initialViewModeGroups?: "list" | "card" | "icon" | "folders";
  initialRowContent?: "date" | "group";
  initialCommandMode?: "add" | "search";
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

export function DashboardContent({
  user,
  initialBookmarks,
  initialGroups,
  initialViewModeAll = "list",
  initialViewModeGroups = "list",
  initialRowContent = "date",
  initialCommandMode = "add",
}: DashboardContentProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>(initialBookmarks);
  const [groups, setGroups] = useState<GroupRow[]>(initialGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [rowContent, setRowContent] = useState<"date" | "group">(
    initialRowContent,
  );
  const [viewModeAll, setViewModeAll] = useState<
    "list" | "card" | "icon" | "folders"
  >(initialViewModeAll);
  const [viewModeGroups, setViewModeGroups] = useState<
    "list" | "card" | "icon" | "folders"
  >(initialViewModeGroups);
  const [keyboardContext, setKeyboardContext] = useState<"folder" | "bookmark">(
    "bookmark",
  );

  const handleOptimisticRemoveBookmarks = useCallback(
    (ids: string[]) => {
      if (!ids || ids.length === 0) return;
      const idSet = new Set(ids);
      setBookmarks((prev) => prev.filter((b) => !idSet.has(b.id)));
    },
    [setBookmarks],
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [commandMode, setCommandMode] = useState<"add" | "search">(
    initialCommandMode,
  );
  const isMac = useIsMac();
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const viewMode = activeGroupId === "all" ? viewModeAll : viewModeGroups;
  const setViewMode = useCallback(
    (value: "list" | "card" | "icon" | "folders") => {
      if (activeGroupId === "all") {
        setViewModeAll(value);
      } else {
        setViewModeGroups(value);
      }
    },
    [activeGroupId],
  );
  const nonFolderViewMode = viewMode === "folders" ? "list" : viewMode;
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupIcon, setEditGroupIcon] = useState("folder");
  const [editGroupColor, setEditGroupColor] = useState<string | null>(null);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
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
  const lastDeletedGroupBookmarksRef = React.useRef<BookmarkRow[]>([]);
  const lastBulkDeletedRef = React.useRef<
    { bookmark: BookmarkRow; index: number }[]
  >([]);

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

  // Migrate from localStorage to cookies on first load
  React.useEffect(() => {
    migrateLocalStorageToCookies();
  }, []);

  // Sync preferences to cookies
  React.useEffect(() => {
    setPreferenceCookie("viewMode.all", viewModeAll);
  }, [viewModeAll]);

  React.useEffect(() => {
    setPreferenceCookie("viewMode.groups", viewModeGroups);
  }, [viewModeGroups]);

  React.useEffect(() => {
    setPreferenceCookie("rowContent", rowContent);
  }, [rowContent]);

  React.useEffect(() => {
    setPreferenceCookie("commandMode", commandMode);
  }, [commandMode]);

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
  const isFilteredSearch = deferredSearchQuery.trim().length > 0;

  useGroupShortcuts({ groups, setActiveGroupId });

  const {
    handleGroupCreated,
    handleUpdateGroup,
    handleSidebarGroupUpdate,
    handleDeleteGroup,
    handleInlineCreateGroup,
  } = useGroupActions({
    userId: user.id,
    activeGroupId,
    groups,
    bookmarks,
    setGroups,
    setBookmarks,
    sortBookmarks,
    sortGroups,
    setActiveGroupId,
    editGroupName,
    editGroupIcon,
    editGroupColor,
    setEditingGroupId,
    isUpdatingGroup,
    setIsUpdatingGroup,
    lastDeletedGroupRef,
    lastDeletedGroupBookmarksRef,
    createGroup,
    updateGroup: updateGroupAction,
    deleteGroup: deleteGroupAction,
    restoreGroup: restoreGroupAction,
    restoreBookmark: restoreAction,
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
    importResult,
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

  const { exportProgress, handleExportBookmarks, resetExportProgress } =
    useExportHandlers({
      bookmarks,
      groups,
    });

  const handleResolveConflicts = useCallback(
    async (action: "skip" | "override") => {
      void action;
      if (importPreview) {
        handleUpdateImportAction(action);
      }
    },
    [importPreview, handleUpdateImportAction],
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
    setBookmarks,
    initialBookmarks,
    deleteBookmark: deleteAction,
    restoreBookmark: restoreAction,
    lastBulkDeletedRef,
  });

  const { handleOpenGroup } = useOpenGroup({
    bookmarks,
    deferredSearchQuery,
  });

  const { handleCommandModeChange } = useCommandMode({
    setCommandMode,
  });

  return (
    <>
      <DashboardOnboarding />
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
          onDeleteGroup={handleDeleteGroup}
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
        <div className="flex-none z-40 bg-background px-1">
          <DashboardNav
            user={user}
            bookmarks={bookmarks}
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
            importResult={importResult}
            exportProgress={exportProgress}
            onImportFileSelected={handleImportFileSelected}
            onUpdateImportAction={handleUpdateImportAction}
            onConfirmImport={handleConfirmImport}
            onClearImport={handleClearImport}
            onExportBookmarks={handleExportBookmarks}
            onResetExport={resetExportProgress}
            onRemoveBookmarks={handleOptimisticRemoveBookmarks}
          />
          <div className="pt-4 md:pt-6">
            <CommandBar
              onAddBookmark={addOptimisticBookmark}
              onApplyEnrichment={applyEnrichment}
              onReplaceBookmarkId={replaceBookmarkId}
              activeGroupId={activeGroupId}
              mode={commandMode}
              searchQuery={searchQuery}
              onModeChange={handleCommandModeChange}
              onSearchChange={setSearchQuery}
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
                  isFiltered={isFilteredSearch}
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
                  activeGroupId={activeGroupId}
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
            onOpenSelected={handleOpenSelected}
            onBulkDelete={handleBulkDelete}
            onCancelSelection={handleCancelSelection}
          />
        )}
      </div>
    </>
  );
}
