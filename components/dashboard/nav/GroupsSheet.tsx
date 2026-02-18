"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { DndContext, DragOverlay, MeasuringStrategy } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetSection,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import type { GroupRow } from "@/lib/supabase/queries";
import type { IconPickerPopoverProps } from "../IconPickerPopover";
import { AllBookmarksRow } from "../content/sidebar/AllBookmarksRow";
import { GroupCreateCard } from "../content/sidebar/GroupCreateCard";
import { GroupEditCard } from "../content/sidebar/GroupEditCard";
import { GroupRowItem } from "../content/sidebar/GroupRowItem";
import { GroupDragOverlayRow } from "../content/sidebar/GroupReorderRows";
import { SelectionModeBar } from "../content/sidebar/SelectionModeBar";
import {
  BulkDeleteGroupsDialog,
  DeleteGroupDialog,
} from "../content/sidebar/DeleteGroupDialogs";
import { useGroupReorderDnd } from "../content/sidebar/useGroupReorderDnd";
import { useGroupSelection } from "../content/sidebar/useGroupSelection";
import { SortableGroupRowItem } from "../content/sidebar/SortableGroupRowItem";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";

const IconPickerPopover = dynamic<IconPickerPopoverProps>(
  () => import("../IconPickerPopover").then((mod) => mod.IconPickerPopover),
  {
    loading: () => (
      <div className="h-8 w-8 animate-pulse rounded-lg bg-primary/10" />
    ),
    ssr: false,
  },
);

interface GroupsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function GroupsSheet({
  open,
  onOpenChange,
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
}: GroupsSheetProps) {
  const reorderableGroups = groups.filter((g) => g.id !== "no-group");

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
    sensors,
    collisionDetection,
    activeGroup,
    handleGroupDragStart,
    handleGroupDragEnd,
  } = useGroupReorderDnd({ groups: reorderableGroups, onReorderGroups });

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

  useEffect(() => {
    if (!open) {
      exitSelectionMode();
      setEditingGroupId(null);
    }
  }, [exitSelectionMode, open, setEditingGroupId]);

  const headerDescription = useMemo(() => {
    return "Browse, create, and manage your groups.";
  }, []);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="flex w-full flex-col sm:max-w-md p-0"
        >
          <SheetHeader>
            <SheetTitle className="text-lg">Groups</SheetTitle>
            <SheetDescription>{headerDescription}</SheetDescription>
          </SheetHeader>

          <SheetBody className="flex flex-col gap-3">
            <SheetSection className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <KbdGroup className="gap-0.5">
                  <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">Shift</Kbd>
                  <Kbd className="h-4.5 min-w-4.5 text-[10px] px-1">A–Z</Kbd>
                </KbdGroup>
                <span>Switch Group</span>
              </div>

              <div className="flex flex-1 min-h-0 flex-col">
                <AllBookmarksRow
                  active={activeGroupId === "all"}
                  selectionMode={selectionMode}
                  onSelectAll={() => {
                    setActiveGroupId("all");
                    onOpenChange(false);
                  }}
                  onOpenAll={() => {
                    handleOpenGroup("all");
                    onOpenChange(false);
                  }}
                  onToggleSelectionMode={() => {
                    if (selectionMode) exitSelectionMode();
                    else enterSelectionMode();
                  }}
                />

                {selectionMode ? (
                  <SelectionModeBar
                    selectedCount={selectedCount}
                    onCancel={exitSelectionMode}
                    onDelete={requestBulkDelete}
                  />
                ) : null}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hover-only">
                  <DndContext
                    id="groups-sheet-dnd"
                    sensors={sensors}
                    collisionDetection={collisionDetection}
                    onDragStart={(event) => {
                      if (selectionMode || editingGroupId || isInlineCreating)
                        return;
                      handleGroupDragStart(event);
                    }}
                    onDragEnd={(event) => {
                      if (selectionMode || editingGroupId || isInlineCreating)
                        return;
                      handleGroupDragEnd(event);
                    }}
                    modifiers={[restrictToVerticalAxis]}
                    measuring={{
                      droppable: {
                        strategy: MeasuringStrategy.WhileDragging,
                      },
                    }}
                  >
                    <SortableContext
                      items={reorderableGroups.map((g) => g.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-1">
                        {groups.map((group) => {
                          if (group.id === "no-group") {
                            const isActive = activeGroupId === "no-group";
                            const NoGroupIcon =
                              ALL_ICONS_MAP[group.icon || "folder"] ??
                              ALL_ICONS_MAP["folder"];
                            return (
                              <div
                                key={group.id}
                                className={`group flex items-center gap-3 px-2 py-1.5 transition-colors duration-200 ${
                                  isActive
                                    ? "text-foreground font-semibold"
                                    : selectionMode
                                      ? ""
                                      : "hover:text-primary/90"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectionMode) return;
                                    setActiveGroupId("no-group");
                                    onOpenChange(false);
                                  }}
                                  className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                                  disabled={selectionMode}
                                >
                                  <span
                                    className={`h-px transition-[width,opacity] duration-200 ease-out ${
                                      isActive
                                        ? "w-12 opacity-80"
                                        : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                                    } bg-current`}
                                  />
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <HugeiconsIcon
                                      icon={NoGroupIcon}
                                      size={16}
                                      strokeWidth={2}
                                      className="text-foreground/80"
                                    />
                                    <span className="truncate max-w-32">
                                      No Group
                                    </span>
                                  </div>
                                </button>
                              </div>
                            );
                          }

                          const isEditing = editingGroupId === group.id;
                          const dndDisabled =
                            selectionMode ||
                            isInlineCreating ||
                            Boolean(editingGroupId) ||
                            isEditing;

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
                                onSave={() =>
                                  handleSidebarGroupUpdate(group.id)
                                }
                              />
                            );
                          }

                          return (
                            <SortableGroupRowItem
                              key={group.id}
                              id={group.id}
                              disabled={dndDisabled}
                            >
                              <GroupRowItem
                                group={group}
                                active={activeGroupId === group.id}
                                selectionMode={selectionMode}
                                isSelected={selectedGroupIds.has(group.id)}
                                onToggleSelected={() =>
                                  toggleSelected(group.id)
                                }
                                onSelectGroup={() => {
                                  setActiveGroupId(group.id);
                                  onOpenChange(false);
                                }}
                                onEnterSelectionMode={enterSelectionMode}
                                onOpenGroup={() => {
                                  handleOpenGroup(group.id);
                                  onOpenChange(false);
                                }}
                                onEdit={() => {
                                  setEditingGroupId(group.id);
                                  setEditGroupName(group.name);
                                  setEditGroupIcon(group.icon || "folder");
                                  setEditGroupColor(group.color || "#6366f1");
                                }}
                                onRequestDelete={() => openDeleteDialog(group)}
                              />
                            </SortableGroupRowItem>
                          );
                        })}
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
                </div>
              </div>
            </SheetSection>

            <GroupCreateCard
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

            <div className="pt-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full rounded-4xl cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <DeleteGroupDialog
        open={deleteDialogOpen}
        onOpenChange={(nextOpen) => {
          setDeleteDialogOpen(nextOpen);
          if (!nextOpen) setDeleteTarget(null);
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
}
