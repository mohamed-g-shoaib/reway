"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight03Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  PencilEdit01Icon,
  Folder01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  pointerWithin,
  type CollisionDetection,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
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
}: DashboardSidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupRow | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [activeDragGroupId, setActiveDragGroupId] = useState<string | null>(
    null,
  );
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

  const enterReorderMode = () => {
    exitSelectionMode();
    setEditingGroupId(null);
    setReorderMode(true);
  };

  const exitReorderMode = () => {
    setReorderMode(false);
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGroupDragStart = (event: DragStartEvent) => {
    setActiveDragGroupId(event.active.id as string);
  };

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragGroupId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorderGroups(arrayMove(groups, oldIndex, newIndex));
  };

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  };

  const activeGroup = activeDragGroupId
    ? (groups.find((g) => g.id === activeDragGroupId) ?? null)
    : null;

  return (
    <aside
      className="hidden min-[1200px]:flex fixed left-6 top-43 bottom-6 z-30 w-60 flex-col gap-2 text-sm text-muted-foreground"
      data-onboarding="groups-desktop"
      onKeyDown={(event) => {
        if (!reorderMode) return;
        if (event.key === "Escape") {
          event.preventDefault();
          exitReorderMode();
        }
      }}
      tabIndex={-1}
    >
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

      {reorderMode ? (
        <ReorderModeBar onDone={exitReorderMode} />
      ) : null}

      {selectionMode ? (
        <SelectionModeBar
          selectedCount={selectedCount}
          onCancel={exitSelectionMode}
          onDelete={handleBulkDelete}
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
            const GroupIcon = group.icon
              ? ALL_ICONS_MAP[group.icon]
              : Folder01Icon;
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
    </aside>
  );
}
