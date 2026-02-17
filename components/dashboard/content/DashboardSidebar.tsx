"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import type { GroupRow } from "@/lib/supabase/queries";
import type { IconPickerPopoverProps } from "../IconPickerPopover";
import { AllBookmarksRow } from "./sidebar/AllBookmarksRow";
import { GroupCreateCard } from "./sidebar/GroupCreateCard";
import { GroupEditCard } from "./sidebar/GroupEditCard";
import { GroupRowItem } from "./sidebar/GroupRowItem";
import {
  GroupDragOverlayRow,
  SortableGroupRow,
} from "./sidebar/GroupReorderRows";
import { ReorderModeBar } from "./sidebar/ReorderModeBar";
import { SelectionModeBar } from "./sidebar/SelectionModeBar";
import {
  BulkDeleteGroupsDialog,
  DeleteGroupDialog,
} from "./sidebar/DeleteGroupDialogs";
import { useGroupReorderDnd } from "./sidebar/useGroupReorderDnd";
import { useGroupSelection } from "./sidebar/useGroupSelection";

const IconPickerPopover = dynamic<IconPickerPopoverProps>(
  () => import("../IconPickerPopover").then((mod) => mod.IconPickerPopover),
  {
    loading: () => (
      <div className="h-8 w-8 animate-pulse rounded-lg bg-primary/10" />
    ),
    ssr: false,
  },
);

interface DashboardSidebarProps {
  groups: GroupRow[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  onReorderGroups: (newOrder: GroupRow[]) => void;
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
  layoutDensity?: "compact" | "extended";
}

export function DashboardSidebar({
  groups,
  activeGroupId,
  setActiveGroupId,
  onReorderGroups,
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
  layoutDensity = "compact",
}: DashboardSidebarProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  const canPin = useMemo(() => {
    if (layoutDensity !== "extended") return false;
    const mainMaxWidth = 1600;
    const sidebarWidth = 240;
    const gutters = 24 + 24;
    const required = mainMaxWidth + sidebarWidth * 2 + gutters;
    return viewportWidth >= required;
  }, [layoutDensity, viewportWidth]);

  const scheduleClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsHoverOpen(false);
    }, 600);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupRow | null>(null);
  const {
    selectionMode,
    selectedGroupIds,
    selectedCount,
    selectedGroups,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelected,
    requestBulkDelete,
  } = useGroupSelection({ groups });

  const openDeleteDialog = (group: GroupRow) => {
    setDeleteTarget(group);
    setDeleteDialogOpen(true);
  };

  const {
    reorderMode,
    enterReorderMode,
    exitReorderMode,
    sensors,
    collisionDetection,
    activeGroup,
    handleGroupDragStart,
    handleGroupDragEnd,
  } = useGroupReorderDnd({
    groups,
    onReorderGroups,
    onEnterReorderMode: () => {
      exitSelectionMode();
      setEditingGroupId(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDeleteGroup(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedGroups.length === 0) return;
    selectedGroups.forEach((g) => onDeleteGroup(g.id));
    setBulkDeleteDialogOpen(false);
    exitSelectionMode();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!reorderMode) return;
    if (event.key === "Escape") {
      event.preventDefault();
      exitReorderMode();
    }
  };

  const sidebarBody = (
    <>
      <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
        <KbdGroup className="gap-0.5">
          <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">Shift</Kbd>
          <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">A–Z</Kbd>
        </KbdGroup>
        <span>Switch Group</span>
      </div>

      <AllBookmarksRow
        active={activeGroupId === "all"}
        selectionMode={selectionMode}
        reorderMode={reorderMode}
        onSelectAll={() => setActiveGroupId("all")}
        onOpenAll={() => handleOpenGroup("all")}
        onEnterReorderMode={enterReorderMode}
        onToggleSelectionMode={() => {
          if (selectionMode) exitSelectionMode();
          else enterSelectionMode();
        }}
      />

      {reorderMode ? <ReorderModeBar onDone={exitReorderMode} /> : null}

      {selectionMode ? (
        <SelectionModeBar
          selectedCount={selectedCount}
          onCancel={exitSelectionMode}
          onDelete={requestBulkDelete}
        />
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hover-only">
        {reorderMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleGroupDragStart}
            onDragEnd={handleGroupDragEnd}
            modifiers={[restrictToVerticalAxis]}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.WhileDragging,
              },
            }}
          >
            <SortableContext
              items={groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1">
                {groups.map((group) => (
                  <SortableGroupRow key={group.id} group={group} />
                ))}
              </div>
            </SortableContext>

            {typeof document !== "undefined" &&
              createPortal(
                <DragOverlay dropAnimation={null} adjustScale={false}>
                  {activeGroup ? (
                    <GroupDragOverlayRow group={activeGroup} />
                  ) : null}
                </DragOverlay>,
                document.body,
              )}
          </DndContext>
        ) : (
          groups.map((group) => {
            const isEditing = editingGroupId === group.id;

            if (isEditing) {
              return (
                <GroupEditCard
                  key={group.id}
                  group={group}
                  IconPickerPopover={IconPickerPopover}
                  editGroupName={editGroupName}
                  setEditGroupName={setEditGroupName}
                  editGroupIcon={editGroupIcon}
                  setEditGroupIcon={setEditGroupIcon}
                  editGroupColor={editGroupColor}
                  setEditGroupColor={setEditGroupColor}
                  isUpdatingGroup={isUpdatingGroup}
                  onCancel={() => setEditingGroupId(null)}
                  onSave={() => handleSidebarGroupUpdate(group.id)}
                />
              );
            }

            return (
              <GroupRowItem
                key={group.id}
                group={group}
                active={activeGroupId === group.id}
                selectionMode={selectionMode}
                isSelected={selectedGroupIds.has(group.id)}
                onToggleSelected={() => toggleSelected(group.id)}
                onSelectGroup={() => setActiveGroupId(group.id)}
                onEnterSelectionMode={enterSelectionMode}
                onOpenGroup={() => handleOpenGroup(group.id)}
                onEnterReorderMode={enterReorderMode}
                onEdit={() => {
                  setEditingGroupId(group.id);
                  setEditGroupName(group.name);
                  setEditGroupIcon(group.icon || "folder");
                  setEditGroupColor(group.color || "#6366f1");
                }}
                onRequestDelete={() => openDeleteDialog(group)}
              />
            );
          })
        )}
      </div>

      <GroupCreateCard
        reorderMode={reorderMode}
        isInlineCreating={isInlineCreating}
        setIsInlineCreating={setIsInlineCreating}
        IconPickerPopover={IconPickerPopover}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupIcon={newGroupIcon}
        setNewGroupIcon={setNewGroupIcon}
        newGroupColor={newGroupColor}
        setNewGroupColor={setNewGroupColor}
        isCreatingGroup={isCreatingGroup}
        onCreate={() => handleInlineCreateGroup()}
      />
    </>
  );

  const sidebarDialogs = (
    <>
      <DeleteGroupDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        target={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteGroupsDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        selectedCount={selectedCount}
        onConfirm={handleConfirmBulkDelete}
      />
    </>
  );

  if (layoutDensity !== "extended") {
    return (
      <>
        <aside
          className="hidden min-[1200px]:flex fixed left-6 top-43 bottom-6 z-30 w-60 flex-col gap-2 text-sm text-muted-foreground"
          data-onboarding="groups-desktop"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {sidebarBody}
        </aside>
        {sidebarDialogs}
      </>
    );
  }

  return (
    <>
      <aside
        className={`hidden min-[1200px]:flex fixed left-6 top-43 bottom-6 z-50 w-60 flex-col gap-2 text-sm text-muted-foreground ${
          canPin ? "" : "min-[1200px]:hidden"
        }`}
        data-onboarding="groups-desktop"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {sidebarBody}
      </aside>

      {!canPin ? (
        <>
          <button
            type="button"
            className="hidden min-[1200px]:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 h-14 w-7 items-center justify-center rounded-r-2xl bg-muted/20 ring-1 ring-inset ring-foreground/10 text-muted-foreground text-[11px] hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="Toggle groups sidebar"
            onClick={() => {
              setIsPinnedOpen((p) => !p);
              setIsHoverOpen(true);
            }}
            onMouseEnter={() => {
              cancelClose();
              setIsHoverOpen(true);
            }}
            onMouseLeave={() => {
              if (!isPinnedOpen) scheduleClose();
            }}
          >
            G
          </button>

          <aside
            className={`hidden min-[1200px]:block fixed left-0 top-43 bottom-6 z-50 w-60 transition-transform duration-200 ease-out motion-reduce:transition-none ${
              isPinnedOpen || isHoverOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onMouseEnter={() => {
              cancelClose();
              setIsHoverOpen(true);
            }}
            onMouseLeave={() => {
              if (!isPinnedOpen) scheduleClose();
            }}
          >
            <div className="h-full rounded-r-3xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 ring-1 ring-foreground/8 px-2 py-2 flex flex-col gap-2 text-sm text-muted-foreground">
              {sidebarBody}
            </div>
          </aside>
        </>
      ) : null}

      {sidebarDialogs}
    </>
  );
}
