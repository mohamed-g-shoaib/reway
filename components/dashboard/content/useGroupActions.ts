"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { GroupRow } from "@/lib/supabase/queries";

interface UseGroupActionsOptions {
  userId: string;
  activeGroupId: string;
  groups: GroupRow[];
  setGroups: React.Dispatch<React.SetStateAction<GroupRow[]>>;
  sortGroups: (items: GroupRow[]) => GroupRow[];
  setActiveGroupId: (id: string) => void;
  editGroupName: string;
  editGroupIcon: string;
  editGroupColor: string | null;
  setEditingGroupId: (value: string | null) => void;
  isUpdatingGroup: boolean;
  setIsUpdatingGroup: (value: boolean) => void;
  deleteConfirmGroupId: string | null;
  setDeleteConfirmGroupId: (value: string | null) => void;
  lastDeletedGroupRef: React.MutableRefObject<GroupRow | null>;
  createGroup: (formData: {
    name: string;
    icon: string;
    color?: string | null;
  }) => Promise<string>;
  updateGroup: (
    id: string,
    formData: { name: string; icon: string; color?: string | null },
  ) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  restoreGroup: (group: {
    id: string;
    name: string;
    icon: string;
    color?: string | null;
  }) => Promise<void>;
  initialGroups: GroupRow[];
  newGroupName: string;
  newGroupIcon: string;
  newGroupColor: string | null;
  setIsInlineCreating: (value: boolean) => void;
  setNewGroupName: (value: string) => void;
  setNewGroupIcon: (value: string) => void;
  setNewGroupColor: (value: string | null) => void;
  isCreatingGroup: boolean;
  setIsCreatingGroup: (value: boolean) => void;
}

export function useGroupActions({
  userId,
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
  updateGroup,
  deleteGroup,
  restoreGroup,
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
}: UseGroupActionsOptions) {
  const handleGroupCreated = useCallback(
    (id: string, name: string, icon: string, color?: string | null) => {
      const newGroup: GroupRow = {
        id,
        name,
        icon,
        user_id: userId,
        created_at: new Date().toISOString(),
        color: color ?? null,
        order_index: null,
      };
      setGroups((prev) => sortGroups([...prev, newGroup]));
      setActiveGroupId(id);
    },
    [setActiveGroupId, setGroups, sortGroups, userId],
  );

  const handleUpdateGroup = useCallback(
    async (id: string, name: string, icon: string, color?: string | null) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, name, icon, color: color ?? null } : g,
        ),
      );
      try {
        await updateGroup(id, { name, icon, color: color ?? null });
      } catch (error) {
        console.error("Update group failed:", error);
        toast.error("Failed to update group");
        setGroups((prev) =>
          prev.map((g) =>
            g.id === id ? groups.find((og) => og.id === id) || g : g,
          ),
        );
      }
    },
    [groups, setGroups, updateGroup],
  );

  const handleSidebarGroupUpdate = useCallback(
    async (id: string) => {
      if (!editGroupName.trim() || isUpdatingGroup) return;
      setIsUpdatingGroup(true);
      try {
        await handleUpdateGroup(
          id,
          editGroupName.trim(),
          editGroupIcon,
          editGroupColor,
        );
        setEditingGroupId(null);
      } catch (error) {
        console.error("Failed to update group:", error);
      } finally {
        setIsUpdatingGroup(false);
      }
    },
    [
      editGroupColor,
      editGroupIcon,
      editGroupName,
      handleUpdateGroup,
      isUpdatingGroup,
      setEditingGroupId,
      setIsUpdatingGroup,
    ],
  );

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      let deletedGroup: GroupRow | undefined;

      setGroups((prev) => {
        deletedGroup = prev.find((g) => g.id === id);
        if (deletedGroup) {
          lastDeletedGroupRef.current = deletedGroup;
        }
        return prev.filter((g) => g.id !== id);
      });

      if (activeGroupId === id) {
        setActiveGroupId("all");
      }

      if (deletedGroup) {
        toast.error("Group deleted", {
          action: {
            label: "Undo",
            onClick: async () => {
              const lastDeleted = lastDeletedGroupRef.current;
              if (!lastDeleted) return;
              setGroups((prev) => {
                if (prev.some((g) => g.id === lastDeleted.id)) return prev;
                return sortGroups([...prev, lastDeleted]);
              });
              try {
                await restoreGroup({
                  id: lastDeleted.id,
                  name: lastDeleted.name,
                  icon: lastDeleted.icon || "folder",
                  color: lastDeleted.color,
                });
              } catch (error) {
                console.error("Restore group failed:", error);
                toast.error("Failed to restore group");
              }
            },
          },
        });
      }

      try {
        await deleteGroup(id);
      } catch (error) {
        console.error("Delete group failed:", error);
        toast.error("Failed to delete group");
        setGroups((prev) => {
          const deletedFromInitial = initialGroups.find((g) => g.id === id);
          return deletedFromInitial
            ? sortGroups([...prev, deletedFromInitial])
            : prev;
        });
      }
    },
    [
      activeGroupId,
      deleteGroup,
      initialGroups,
      lastDeletedGroupRef,
      restoreGroup,
      setActiveGroupId,
      setGroups,
      sortGroups,
    ],
  );

  const handleDeleteGroupClick = useCallback(
    (id: string) => {
      if (deleteConfirmGroupId === id) {
        handleDeleteGroup(id);
        setDeleteConfirmGroupId(null);
      } else {
        setDeleteConfirmGroupId(id);
        setTimeout(() => setDeleteConfirmGroupId(null), 3000);
      }
    },
    [deleteConfirmGroupId, handleDeleteGroup, setDeleteConfirmGroupId],
  );

  const handleInlineCreateGroup = useCallback(async () => {
    if (!newGroupName.trim() || isCreatingGroup) return;
    setIsCreatingGroup(true);
    try {
      const groupId = await createGroup({
        name: newGroupName.trim(),
        icon: newGroupIcon,
        color: newGroupColor,
      });
      handleGroupCreated(
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
      toast.error("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  }, [
    createGroup,
    handleGroupCreated,
    isCreatingGroup,
    newGroupColor,
    newGroupIcon,
    newGroupName,
    setIsCreatingGroup,
    setIsInlineCreating,
    setNewGroupColor,
    setNewGroupIcon,
    setNewGroupName,
  ]);

  return {
    handleGroupCreated,
    handleUpdateGroup,
    handleSidebarGroupUpdate,
    handleDeleteGroup,
    handleDeleteGroupClick,
    handleInlineCreateGroup,
  };
}
