"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { FolderBoard } from "@/components/dashboard/FolderBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav, type User } from "@/components/dashboard/DashboardNav";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMac } from "@/hooks/useIsMac";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight03Icon,
  GridIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Alert02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const EXTENSION_STORE_URL = "https://example.com/reway-extension";

interface DashboardContentProps {
  user: User;
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
}

import {
  updateBookmarksOrder,
  updateFolderBookmarksOrder,
  createGroup,
  addBookmark,
  enrichCreatedBookmark,
  deleteBookmark as deleteAction,
  restoreBookmark as restoreAction,
  updateBookmark as updateBookmarkAction,
  updateGroup as updateGroupAction,
  deleteGroup as deleteGroupAction,
  restoreGroup as restoreGroupAction,
  checkDuplicateBookmarks,
} from "@/app/dashboard/actions";

import type { IconPickerPopoverProps } from "./IconPickerPopover";

type ImportEntry = {
  title: string;
  url: string;
  groupName: string;
  isDuplicate?: boolean;
  existingBookmark?: { id: string; title: string; url: string };
  action?: "skip" | "override" | "add"; // Action to take for duplicates
};

type ImportGroupSummary = {
  name: string;
  count: number;
  duplicateCount?: number;
};

type EnrichmentResult =
  | {
      status: "ready";
      title?: string | null;
      description?: string | null;
      favicon_url?: string | null;
      og_image_url?: string | null;
      image_url?: string | null;
      last_fetched_at?: string | null;
      error_reason?: string | null;
    }
  | {
      status: "failed";
      error_reason?: string | null;
    };

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
  const letterCycleRef = React.useRef<Record<string, number>>({});
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
  const [importPreview, setImportPreview] = useState<{
    groups: ImportGroupSummary[];
    entries: ImportEntry[];
  } | null>(null);
  const [importProgress, setImportProgress] = useState({
    processed: 0,
    total: 0,
    status: "idle" as "idle" | "importing" | "done" | "error",
  });
  const [addConflicts, setAddConflicts] = useState<
    { url: string; title: string }[] | null
  >(null);
  const [exportProgress, setExportProgress] = useState({
    processed: 0,
    total: 0,
    status: "idle" as "idle" | "exporting" | "done" | "error",
  });
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
    return [...items].sort((a, b) => {
      const aOrder = a.order_index ?? Number.POSITIVE_INFINITY;
      const bOrder = b.order_index ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, []);

  const sortGroups = useCallback((items: GroupRow[]) => {
    return [...items].sort((a, b) => {
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

  React.useEffect(() => {
    const supabase = createClient();
    supabase.realtime.setAuth();

    const bookmarksChannel = supabase
      .channel(`user:${user.id}:bookmarks`, { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, (payload) => {
        const nextRow = payload.payload as BookmarkRow | undefined;
        if (!nextRow) return;
        setBookmarks((prev) => {
          // Don't add if already exists (optimistic update)
          if (prev.some((b) => b.id === nextRow.id)) return prev;
          return sortBookmarks([nextRow, ...prev]);
        });
      })
      .on("broadcast", { event: "UPDATE" }, (payload) => {
        const nextRow = payload.payload as BookmarkRow | undefined;
        if (!nextRow) return;
        setBookmarks((prev) =>
          sortBookmarks(
            prev.map((item) => (item.id === nextRow.id ? nextRow : item)),
          ),
        );
      })
      .on("broadcast", { event: "DELETE" }, (payload) => {
        const oldRow = payload.payload as BookmarkRow | undefined;
        if (!oldRow) return;
        setBookmarks((prev) => prev.filter((item) => item.id !== oldRow.id));
      })
      .subscribe();

    const groupsChannel = supabase
      .channel(`user:${user.id}:groups`, { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, (payload) => {
        const nextRow = payload.payload as GroupRow | undefined;
        if (!nextRow?.name?.trim()) return;
        setGroups((prev) => {
          // Don't add if already exists (optimistic update)
          if (prev.some((g) => g.id === nextRow.id)) return prev;
          return sortGroups([nextRow, ...prev]);
        });
      })
      .on("broadcast", { event: "UPDATE" }, (payload) => {
        const nextRow = payload.payload as GroupRow | undefined;
        if (!nextRow) return;
        setGroups((prev) =>
          sortGroups(
            prev.map((item) => (item.id === nextRow.id ? nextRow : item)),
          ),
        );
      })
      .on("broadcast", { event: "DELETE" }, (payload) => {
        const oldRow = payload.payload as GroupRow | undefined;
        if (!oldRow) return;
        setGroups((prev) => prev.filter((item) => item.id !== oldRow.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookmarksChannel);
      supabase.removeChannel(groupsChannel);
    };
  }, [sortBookmarks, sortGroups, user.id]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type !== "reway_broadcast_bookmark") return;
      const bookmark = event.data.bookmark as BookmarkRow | undefined;
      if (!bookmark?.id) return;
      setBookmarks((prev) => {
        if (prev.some((item) => item.id === bookmark.id)) {
          return prev.map((item) =>
            item.id === bookmark.id ? bookmark : item,
          );
        }
        return sortBookmarks([bookmark, ...prev]);
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sortBookmarks]);

  const addOptimisticBookmark = useCallback(
    (bookmark: BookmarkRow) => {
      // If we're in a specific group, ensure the new bookmark gets that group_id
      const newBookmark = {
        ...bookmark,
        group_id: activeGroupId !== "all" ? activeGroupId : bookmark.group_id,
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    },
    [activeGroupId],
  );

  const handleFolderReorder = useCallback(
    async (groupId: string, newOrder: BookmarkRow[]) => {
      setBookmarks((prev) => {
        const updatedOrder = newOrder.map((bookmark, index) => ({
          ...bookmark,
          folder_order_index: index,
        }));
        const otherBookmarks = prev.filter((bookmark) => {
          const bookmarkGroup = bookmark.group_id ?? "no-group";
          return bookmarkGroup !== groupId;
        });
        return [...updatedOrder, ...otherBookmarks];
      });

      const updates = newOrder.map((bookmark, index) => ({
        id: bookmark.id,
        folder_order_index: index,
      }));

      try {
        await updateFolderBookmarksOrder(updates);
      } catch (error) {
        console.error("Reorder failed:", error);
        toast.error("Failed to reorder bookmarks");
        setBookmarks(initialBookmarks);
      }
    },
    [initialBookmarks],
  );

  const handleDeleteBookmark = useCallback(async (id: string) => {
    let deletedBookmark: BookmarkRow | undefined;
    let deletedIndex = -1;

    setBookmarks((prev) => {
      deletedIndex = prev.findIndex((b) => b.id === id);
      deletedBookmark = prev[deletedIndex];
      if (deletedBookmark) {
        lastDeletedRef.current = {
          bookmark: deletedBookmark,
          index: deletedIndex,
        };
      }
      return prev.filter((b) => b.id !== id);
    });

    if (deletedBookmark) {
      toast.error("Bookmark deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            const lastDeleted = lastDeletedRef.current;
            if (!lastDeleted) return;
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === lastDeleted.bookmark.id)) {
                return prev;
              }
              const next = [...prev];
              next.splice(
                Math.min(lastDeleted.index, next.length),
                0,
                lastDeleted.bookmark,
              );
              return next;
            });
            try {
              await restoreAction(lastDeleted.bookmark);
            } catch (error) {
              console.error("Restore failed:", error);
              toast.error("Failed to restore bookmark");
            }
          },
        },
      });
    }

    try {
      await deleteAction(id);
    } catch (error) {
      console.error("Delete failed:", error);
      setBookmarks((prev) => {
        const deletedFromInitial = initialBookmarks.find((b) => b.id === id);
        return deletedFromInitial ? [...prev, deletedFromInitial] : prev;
      });
      toast.error("Failed to delete bookmark");
    }
  }, []);

  const handleReorder = useCallback(
    async (newOrder: BookmarkRow[]) => {
      // When reordering, we need to merge the new order back into the global bookmarks list
      // while maintaining bookmarks that aren't currently visible (if filtering)
      setBookmarks((prev) => {
        const updatedOrder = newOrder.map((bookmark, index) => ({
          ...bookmark,
          order_index: index,
        }));
        const otherBookmarks = prev.filter((b) =>
          activeGroupId === "all" ? false : b.group_id !== activeGroupId,
        );
        return [...updatedOrder, ...otherBookmarks];
      });

      // Prepare updates for the DB (only for those in the current view)
      const updates = newOrder.map((bookmark, index) => ({
        id: bookmark.id,
        order_index: index,
      }));

      try {
        await updateBookmarksOrder(updates);
      } catch (error) {
        console.error("Reorder failed:", error);
        toast.error("Failed to reorder bookmarks");
        // Restore original order by re-fetching or reverting
        setBookmarks(initialBookmarks);
      }
    },
    [activeGroupId],
  );

  // Filter bookmarks based on active group - memoized to prevent unnecessary re-renders
  const filteredBookmarks = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    return bookmarks.filter((b) => {
      const matchesGroup =
        activeGroupId === "all" ? true : b.group_id === activeGroupId;
      if (!matchesGroup) return false;
      if (!normalizedQuery) return true;
      const haystack = [b.title, b.url, b.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [bookmarks, activeGroupId, deferredSearchQuery]);

  const groupsByFirstLetter = useMemo(() => {
    const map: Record<string, string[]> = {};

    // Helper to normalize accented characters to their base form
    const normalizeChar = (char: string): string => {
      // Use NFD decomposition to separate accents, then remove diacritics
      return char
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    // Add "All Bookmarks" to the mapping
    const allBookmarksFirstLetter = "a";
    if (!map[allBookmarksFirstLetter]) {
      map[allBookmarksFirstLetter] = [];
    }
    map[allBookmarksFirstLetter].push("all");

    // Add actual groups
    for (const group of groups) {
      const groupName = group.name ?? "";
      const firstChar = groupName.trim().charAt(0);
      if (!firstChar) continue;

      const normalizedLetter = normalizeChar(firstChar);
      // Only map if it's a letter (a-z) - numbers and special chars are skipped
      if (/[a-z]/.test(normalizedLetter)) {
        if (!map[normalizedLetter]) {
          map[normalizedLetter] = [];
        }
        map[normalizedLetter].push(group.id);
      }
    }
    return map;
  }, [groups]);

  React.useEffect(() => {
    letterCycleRef.current = {};
  }, [groups]);

  const handleGroupCreated = useCallback(
    (id: string, name: string, icon: string, color?: string | null) => {
      const newGroup: GroupRow = {
        id,
        name,
        icon,
        user_id: user.id,
        created_at: new Date().toISOString(),
        color: color ?? null,
        order_index: null,
      };
      setGroups((prev) => sortGroups([...prev, newGroup]));
      setActiveGroupId(id);
    },
    [sortGroups, user.id],
  );

  const handleUpdateGroup = useCallback(
    async (id: string, name: string, icon: string, color?: string | null) => {
      // Optimistic update
      setGroups((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, name, icon, color: color ?? null } : g,
        ),
      );
      try {
        await updateGroupAction(id, { name, icon, color: color ?? null });
      } catch (error) {
        console.error("Update group failed:", error);
        toast.error("Failed to update group");
        // Revert optimistic update
        setGroups((prev) =>
          prev.map((g) =>
            g.id === id ? groups.find((og) => og.id === id) || g : g,
          ),
        );
      }
    },
    [],
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
      editGroupName,
      editGroupIcon,
      editGroupColor,
      handleUpdateGroup,
      isUpdatingGroup,
    ],
  );

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      let deletedGroup: GroupRow | undefined;

      // Optimistic delete
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
                await restoreGroupAction({
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
        await deleteGroupAction(id);
      } catch (error) {
        console.error("Delete group failed:", error);
        toast.error("Failed to delete group");
        // Restore group if delete failed
        setGroups((prev) => {
          const deletedFromInitial = initialGroups.find((g) => g.id === id);
          return deletedFromInitial
            ? sortGroups([...prev, deletedFromInitial])
            : prev;
        });
      }
    },
    [activeGroupId, initialGroups, sortGroups],
  );

  const parseBookmarkHtml = useCallback((content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const root = doc.querySelector("dl");
    const entries: ImportEntry[] = [];

    if (!root) return entries;

    const traverse = (node: Element, stack: string[]) => {
      const children = Array.from(node.children);

      for (const child of children) {
        const tag = child.tagName.toLowerCase();
        if (tag === "dt") {
          const firstChild = child.firstElementChild;
          const folderHeading =
            firstChild?.tagName.toLowerCase() === "h3"
              ? firstChild
              : child.querySelector("h3");
          const link =
            firstChild?.tagName.toLowerCase() === "a"
              ? firstChild
              : child.querySelector("a");

          if (folderHeading) {
            const folderName = folderHeading.textContent?.trim() ?? "";

            // Try nextElementSibling first (standard Netscape format)
            let nestedDl = child.nextElementSibling;

            // If not found, check if DL is a child of the DT (browser parsing variation)
            if (!nestedDl || nestedDl.tagName.toLowerCase() !== "dl") {
              nestedDl = child.querySelector("dl");
            }

            if (nestedDl && nestedDl.tagName.toLowerCase() === "dl") {
              if (folderName.length > 0) {
                stack.push(folderName);
                traverse(nestedDl, stack);
                stack.pop();
              } else {
                traverse(nestedDl, stack);
              }
            }
            continue;
          }

          if (link) {
            const url = link.getAttribute("href") || "";
            const title = link.textContent?.trim() || url;
            if (url && isValidImportUrl(url)) {
              const groupName =
                stack.length > 0 ? stack[stack.length - 1] : "Ungrouped";
              entries.push({
                title,
                url,
                // Use only the immediate parent folder (last in stack), flattening nested structure
                groupName: normalizeGroupName(groupName),
              });
            }
          }
        } else {
          traverse(child, stack);
        }
      }
    };

    traverse(root, []);
    return entries;
  }, []);

  const handleImportFileSelected = useCallback(
    async (file: File) => {
      const content = await file.text();
      const rawEntries = parseBookmarkHtml(content);
      if (rawEntries.length === 0) {
        toast.error("No bookmarks found in file");
        return;
      }

      // Check for duplicates
      const urls = rawEntries.map((entry) => entry.url);
      let duplicateMap: Record<
        string,
        { id: string; title: string; url: string }
      > = {};

      try {
        const result = await checkDuplicateBookmarks(urls);
        duplicateMap = result.duplicates;
      } catch (error) {
        console.error("Failed to check for duplicates:", error);
        // Continue without duplicate checking if it fails
      }

      // Mark entries with duplicate info
      const entries: ImportEntry[] = rawEntries.map((entry) => {
        const existingBookmark = duplicateMap[entry.url];
        return {
          ...entry,
          isDuplicate: !!existingBookmark,
          existingBookmark: existingBookmark,
          action: existingBookmark ? "skip" : "add", // Default to skip for duplicates
        };
      });

      const counts = entries.reduce<
        Record<string, { count: number; duplicateCount: number }>
      >((acc, entry) => {
        const groupName = normalizeGroupName(entry.groupName);
        if (!acc[groupName]) {
          acc[groupName] = { count: 0, duplicateCount: 0 };
        }
        acc[groupName].count += 1;
        if (entry.isDuplicate) {
          acc[groupName].duplicateCount += 1;
        }
        return acc;
      }, {});

      const groupSummaries = Object.entries(counts).map(
        ([name, { count, duplicateCount }]) => ({
          name,
          count,
          duplicateCount,
        }),
      );

      const totalDuplicates = entries.filter((e) => e.isDuplicate).length;
      if (totalDuplicates > 0) {
        toast.info(
          `${totalDuplicates} bookmark${totalDuplicates > 1 ? "s" : ""} already exist and will be skipped`,
          {
            description: "You can override duplicates in the import preview",
          },
        );
      }

      setImportPreview({ groups: groupSummaries, entries });
    },
    [normalizeGroupName, parseBookmarkHtml],
  );

  const handleConfirmImport = useCallback(
    async (selectedGroups: string[]) => {
      if (!importPreview) return;
      const allowed = new Set(
        selectedGroups.map((name) => normalizeGroupName(name)),
      );
      // Filter entries: must be in selected groups AND not marked as "skip"
      const entries = importPreview.entries
        .map((entry) => ({
          ...entry,
          groupName: normalizeGroupName(entry.groupName),
        }))
        .filter(
          (entry) => allowed.has(entry.groupName) && entry.action !== "skip",
        );
      if (entries.length === 0) {
        toast.info("No bookmarks to import after filtering duplicates");
        return;
      }

      setImportProgress({
        processed: 0,
        total: entries.length,
        status: "importing",
      });

      const existingGroups = new Map<string, GroupRow>();
      groups.forEach((group) => {
        const name = normalizeGroupName(group.name);
        if (name !== "Ungrouped") {
          existingGroups.set(name, group);
        }
      });

      const groupNamesToCreate = Array.from(
        new Set(
          entries
            .map((entry) => entry.groupName)
            .filter(
              (name) => name !== "Ungrouped" && !existingGroups.has(name),
            ),
        ),
      );

      const createdGroups = await Promise.all(
        groupNamesToCreate.map(async (name) => {
          const newGroupId = await createGroup({
            name,
            icon: "folder",
            color: "#6366f1",
          });
          return {
            id: newGroupId,
            name,
            icon: "folder",
            color: "#6366f1",
            user_id: user.id,
            created_at: new Date().toISOString(),
            order_index: null,
          } satisfies GroupRow;
        }),
      );

      const groupMap = new Map<string, GroupRow>([...existingGroups]);
      createdGroups.forEach((group) => groupMap.set(group.name, group));

      if (createdGroups.length > 0) {
        setGroups((prev) => sortGroups([...prev, ...createdGroups]));
      }

      const currentMinOrder = bookmarks.reduce<number>((min, bookmark) => {
        const orderValue = bookmark.order_index ?? Number.POSITIVE_INFINITY;
        return orderValue < min ? orderValue : min;
      }, Number.POSITIVE_INFINITY);
      const startingOrder =
        currentMinOrder === Number.POSITIVE_INFINITY ? 0 : currentMinOrder;

      const pendingEntries = entries.map((entry, index) => {
        const groupId =
          entry.groupName === "Ungrouped"
            ? null
            : (groupMap.get(entry.groupName)?.id ?? null);
        return {
          entry,
          groupId,
          optimisticId: crypto.randomUUID(),
          orderIndex: startingOrder - (index + 1),
        };
      });

      const optimisticRows: BookmarkRow[] = pendingEntries.map((item) => ({
        id: item.optimisticId,
        url: item.entry.url,
        normalized_url: item.entry.url,
        title: item.entry.title || item.entry.url,
        description: null,
        error_reason: null,
        favicon_url: null,
        og_image_url: null,
        image_url: null,
        group_id: item.groupId ?? null,
        is_enriching: true,
        last_fetched_at: null,
        screenshot_url: null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        order_index: item.orderIndex,
        folder_order_index: null,
        status: "pending",
      }));

      setBookmarks((prev) => sortBookmarks([...optimisticRows, ...prev]));

      let processed = 0;
      const addPromises = pendingEntries.map(
        async ({ entry, groupId, optimisticId, orderIndex }) => {
          try {
            const bookmarkId = await addBookmark({
              url: entry.url,
              id: optimisticId,
              title: entry.title,
              group_id: groupId ?? undefined,
            });
            if (bookmarkId && bookmarkId !== optimisticId) {
              setBookmarks((prev) =>
                prev.map((item) =>
                  item.id === optimisticId
                    ? {
                        ...item,
                        id: bookmarkId,
                        order_index: orderIndex,
                      }
                    : item,
                ),
              );
            }
            const enrichment = (await enrichCreatedBookmark(
              bookmarkId ?? optimisticId,
              entry.url,
            )) as EnrichmentResult | undefined;
            if (enrichment?.status === "ready") {
              setBookmarks((prev) =>
                prev.map((item) =>
                  item.id === optimisticId
                    ? {
                        ...item,
                        title: enrichment.title ?? item.title,
                        description: enrichment.description ?? item.description,
                        favicon_url: enrichment.favicon_url ?? item.favicon_url,
                        og_image_url:
                          enrichment.og_image_url ?? item.og_image_url,
                        image_url: enrichment.image_url ?? item.image_url,
                        status: "ready",
                        is_enriching: false,
                        error_reason: null,
                        last_fetched_at:
                          enrichment.last_fetched_at ?? item.last_fetched_at,
                      }
                    : item,
                ),
              );
            } else if (enrichment?.status === "failed") {
              setBookmarks((prev) =>
                prev.map((item) =>
                  item.id === optimisticId
                    ? {
                        ...item,
                        status: "failed",
                        is_enriching: false,
                        error_reason:
                          enrichment.error_reason ?? "Enrichment failed",
                      }
                    : item,
                ),
              );
            }
          } catch (error) {
            console.error("Import add failed:", error);
            setBookmarks((prev) =>
              prev.map((item) =>
                item.id === optimisticId
                  ? {
                      ...item,
                      status: "failed",
                      is_enriching: false,
                      error_reason: "Import failed",
                    }
                  : item,
              ),
            );
          } finally {
            processed += 1;
            setImportProgress({
              processed,
              total: entries.length,
              status: "importing",
            });
          }
        },
      );

      await Promise.all(addPromises);

      setImportProgress({ processed, total: entries.length, status: "done" });
      toast.success(`Imported ${entries.length} bookmarks`);
      setImportPreview(null);
    },
    [
      addBookmark,
      bookmarks,
      createGroup,
      enrichCreatedBookmark,
      groups,
      importPreview,
      normalizeGroupName,
      sortBookmarks,
      sortGroups,
      user.id,
    ],
  );

  const handleClearImport = useCallback(() => {
    setImportPreview(null);
    setImportProgress({ processed: 0, total: 0, status: "idle" });
  }, []);

  const handleUpdateImportAction = useCallback(
    (action: "skip" | "override") => {
      setImportPreview((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          entries: prev.entries.map((entry) => ({
            ...entry,
            action: entry.isDuplicate ? action : "add",
          })),
        };
      });
    },
    [],
  );

  const handleExportBookmarks = useCallback(
    (selectedGroups: string[]) => {
      const allowed = new Set(selectedGroups);
      const grouped = new Map<string, BookmarkRow[]>();
      bookmarks.forEach((bookmark) => {
        const groupName = bookmark.group_id
          ? groups.find((g) => g.id === bookmark.group_id)?.name || "Ungrouped"
          : "Ungrouped";
        if (!allowed.has(groupName)) return;
        if (!grouped.has(groupName)) grouped.set(groupName, []);
        grouped.get(groupName)?.push(bookmark);
      });

      const groupNames = Array.from(grouped.keys());
      setExportProgress({
        processed: 0,
        total: groupNames.length,
        status: "exporting",
      });

      const escapeHtml = (value: string) =>
        value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;");

      let html =
        "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n" +
        "<!-- This is an automatically generated file. -->\n" +
        '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n' +
        "<TITLE>Bookmarks</TITLE>\n" +
        "<H1>Bookmarks</H1>\n" +
        "<DL><p>\n" +
        '  <DT><H3 ADD_DATE="' +
        Math.floor(Date.now() / 1000) +
        '" LAST_MODIFIED="0">Reway Export</H3>\n' +
        "  <DL><p>\n";

      groupNames.forEach((groupName, index) => {
        const items = grouped.get(groupName) || [];
        html += `    <DT><H3 ADD_DATE=\"${Math.floor(Date.now() / 1000)}\" LAST_MODIFIED=\"0\">${escapeHtml(groupName)}</H3>\n`;
        html += "    <DL><p>\n";
        items.forEach((bookmark) => {
          html += `      <DT><A HREF=\"${escapeHtml(bookmark.url)}\">${escapeHtml(bookmark.title || bookmark.url)}</A>\n`;
        });
        html += "    </DL><p>\n";
        setExportProgress({
          processed: index + 1,
          total: groupNames.length,
          status: "exporting",
        });
      });

      html += "  </DL><p>\n</DL><p>\n";

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reway-bookmarks-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportProgress({
        processed: groupNames.length,
        total: groupNames.length,
        status: "done",
      });
    },
    [bookmarks, groups],
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
    [deleteConfirmGroupId, handleDeleteGroup],
  );

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
                order_index: null,
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
                await enrichCreatedBookmark(bookmarkId, item.url);
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
      user.id,
      activeGroupId,
    ],
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
    handleGroupCreated,
    isCreatingGroup,
    newGroupColor,
    newGroupIcon,
    newGroupName,
  ]);

  const handleEditBookmark = useCallback(
    async (
      id: string,
      data: {
        title: string;
        url: string;
        description?: string;
        group_id?: string;
      },
    ) => {
      // Optimistic update
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                title: data.title,
                url: data.url,
                description: data.description ?? null,
                group_id: data.group_id ?? null,
              }
            : b,
        ),
      );

      try {
        await updateBookmarkAction(id, {
          title: data.title,
          url: data.url,
          description: data.description,
          group_id: data.group_id || null,
        });
      } catch (error) {
        console.error("Update bookmark failed:", error);
        toast.error("Failed to update bookmark");
        // Revert optimistic update
        setBookmarks((prev) =>
          prev.map((b) => {
            if (b.id === id) {
              const originalBookmark = initialBookmarks.find(
                (ob) => ob.id === id,
              );
              return originalBookmark || b;
            }
            return b;
          }),
        );
      }
    },
    [],
  );

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Exit selection mode if no items selected
      if (next.size === 0) {
        setSelectionMode(false);
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (!bulkDeleteConfirm) return;
    const timeout = window.setTimeout(() => {
      setBulkDeleteConfirm(false);
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [bulkDeleteConfirm]);

  const handleOpenSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selectedBookmarks = bookmarks.filter((b) => selectedIds.has(b.id));
    selectedBookmarks.forEach((bookmark) => {
      window.open(bookmark.url, "_blank", "noopener,noreferrer");
    });
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [bookmarks, selectedIds]);

  const handleOpenGroup = useCallback(
    async (groupId: string) => {
      const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
      const targetBookmarks = bookmarks.filter((bookmark) => {
        const matchesGroup =
          groupId === "all" ? true : bookmark.group_id === groupId;
        if (!matchesGroup) return false;
        if (!normalizedQuery) return true;
        const haystack = [bookmark.title, bookmark.url, bookmark.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      if (targetBookmarks.length === 0) return;
      const urls = targetBookmarks
        .map((bookmark) => bookmark.url)
        .filter(Boolean);

      const requestId = crypto.randomUUID();
      const response = await new Promise<{
        ok: boolean;
        count?: number;
        error?: string;
      } | null>((resolve) => {
        const timer = window.setTimeout(() => {
          window.removeEventListener("message", onMessage);
          resolve(null);
        }, 250);

        const onMessage = (event: MessageEvent) => {
          if (event?.data?.type !== "reway_open_group_response") return;
          if (event.data.requestId !== requestId) return;
          window.clearTimeout(timer);
          window.removeEventListener("message", onMessage);
          resolve(event.data.response ?? null);
        };

        window.addEventListener("message", onMessage);
        window.postMessage(
          { type: "reway_open_group", requestId, groupId, urls },
          "*",
        );
      });

      if (response?.ok) {
        toast.success(
          `Opened ${response.count ?? targetBookmarks.length} tabs via extension`,
        );
        return;
      }

      if (targetBookmarks.length > 1) {
        targetBookmarks.forEach((bookmark, index) => {
          if (index === 0) {
            window.open(bookmark.url, "_blank", "noopener,noreferrer");
          } else {
            setTimeout(() => {
              window.open(bookmark.url, "_blank", "noopener,noreferrer");
            }, index * 100);
          }
        });
      } else {
        window.open(targetBookmarks[0].url, "_blank", "noopener,noreferrer");
      }

      toast.error("Install the Reway extension for instant open-all", {
        action: {
          label: "Get extension",
          onClick: () => window.open(EXTENSION_STORE_URL, "_blank"),
        },
      });
    },
    [bookmarks, deferredSearchQuery],
  );

  const handleBulkDelete = useCallback(async () => {
    if (!bulkDeleteConfirm) {
      setBulkDeleteConfirm(true);
      return;
    }

    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    const deletedBookmarks = bookmarks
      .map((bookmark, index) => ({ bookmark, index }))
      .filter(({ bookmark }) => selectedIds.has(bookmark.id));

    lastBulkDeletedRef.current = deletedBookmarks;

    // Optimistic delete
    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setSelectionMode(false);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);

    try {
      await Promise.all(idsToDelete.map((id) => deleteAction(id)));
      toast.error(`Bookmark${idsToDelete.length > 1 ? "s" : ""} deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const toRestore = lastBulkDeletedRef.current;
            if (toRestore.length === 0) return;
            setBookmarks((prev) => {
              const next = [...prev];
              const sorted = [...toRestore].sort((a, b) => a.index - b.index);
              sorted.forEach(({ bookmark, index }) => {
                if (next.some((b) => b.id === bookmark.id)) return;
                next.splice(Math.min(index, next.length), 0, bookmark);
              });
              return next;
            });
            try {
              await Promise.all(
                toRestore.map(({ bookmark }) => restoreAction(bookmark)),
              );
            } catch (error) {
              console.error("Restore failed:", error);
              toast.error("Failed to restore bookmarks");
            }
          },
        },
      });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete some bookmarks");
      // Restore bookmarks
      setBookmarks(initialBookmarks);
    }
  }, [bulkDeleteConfirm, selectedIds, bookmarks, initialBookmarks]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleCommandModeChange = useCallback((mode: "add" | "search") => {
    setCommandMode(mode);
    if (mode === "add") {
      setSearchQuery("");
    }
  }, []);

  // Calculate bookmark counts per group (O(N) single-pass)
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookmarks) {
      if (b.group_id) {
        counts[b.group_id] = (counts[b.group_id] || 0) + 1;
      }
    }
    return counts;
  }, [bookmarks]);

  const exportGroupOptions = useMemo(() => {
    const names = new Set<string>();
    names.add("Ungrouped");
    groups.forEach((group) => {
      if (group.name) {
        names.add(group.name);
      }
    });
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [groups]);

  // Keyboard shortcut: Shift + Letter to quickly navigate to groups
  // Pressing the same letter multiple times cycles through groups starting with that letter
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger with Shift + single letter (no Ctrl/Cmd/Alt modifiers)
      if (!event.shiftKey) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;

      // Don't interfere when user is typing in input fields
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const letter = event.key.toLowerCase();
      const groupIds = groupsByFirstLetter[letter];
      if (!groupIds || groupIds.length === 0) return;

      event.preventDefault();
      const currentIndex = letterCycleRef.current[letter] ?? -1;
      const nextIndex = (currentIndex + 1) % groupIds.length;
      letterCycleRef.current[letter] = nextIndex;
      setActiveGroupId(groupIds[nextIndex]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [groupsByFirstLetter]);

  return (
    <>
      <div className="relative flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
        <aside className="hidden lg:flex fixed left-6 top-28 z-30 flex-col gap-2 text-sm text-muted-foreground/70">
          <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground/60">
            <KbdGroup className="gap-0.5">
              <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1">
                Shift
              </Kbd>
              <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1">A–Z</Kbd>
            </KbdGroup>
            <span>Switch Group</span>
          </div>
          <div
            className={`group flex items-center gap-3 px-2 py-1.5 transition-colors ${
              activeGroupId === "all"
                ? "text-foreground font-semibold"
                : "hover:text-foreground/80"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveGroupId("all")}
              className="flex items-center gap-3 min-w-0 flex-1 text-left"
            >
              <span
                className={`h-px transition-all duration-300 ease-out ${
                  activeGroupId === "all"
                    ? "w-12 opacity-80"
                    : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                } bg-current`}
              />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <HugeiconsIcon
                  icon={GridIcon}
                  size={16}
                  strokeWidth={2}
                  className="text-muted-foreground/70"
                />
                <span className="truncate">All Bookmarks</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleOpenGroup("all")}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-foreground transition-opacity"
              aria-label="Open all bookmarks"
            >
              <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
            </button>
          </div>
          {groups.map((group) => {
            const GroupIcon = group.icon ? ALL_ICONS_MAP[group.icon] : GridIcon;
            const isEditing = editingGroupId === group.id;
            const isDeleteConfirm = deleteConfirmGroupId === group.id;

            if (isEditing) {
              return (
                <div
                  key={group.id}
                  className="relative mx-1 my-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-foreground/5"
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
                          style={{ color: editGroupColor || "#6366f1" }}
                        />
                      </button>
                    </IconPickerPopover>
                    <Input
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      placeholder="Group name"
                      className="h-8 flex-1 text-sm rounded-xl"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSidebarGroupUpdate(group.id);
                        } else if (e.key === "Escape") {
                          setEditingGroupId(null);
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 px-3 text-xs rounded-4xl font-bold"
                      onClick={() => setEditingGroupId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs rounded-4xl"
                      onClick={() => handleSidebarGroupUpdate(group.id)}
                      disabled={!editGroupName.trim() || isUpdatingGroup}
                    >
                      {isUpdatingGroup ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={group.id}
                className={`group flex items-center gap-3 px-2 py-1.5 transition-colors ${
                  activeGroupId === group.id
                    ? "text-foreground font-semibold"
                    : "hover:text-foreground/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <span
                    className={`h-px transition-all duration-300 ease-out ${
                      activeGroupId === group.id
                        ? "w-12 opacity-80"
                        : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                    } bg-current`}
                  />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <HugeiconsIcon
                      icon={GroupIcon}
                      size={16}
                      strokeWidth={2}
                      style={{ color: group.color || undefined }}
                    />
                    <span className="truncate max-w-32">{group.name}</span>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenGroup(group.id)}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors"
                    aria-label={`Open ${group.name}`}
                  >
                    <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditGroupName(group.name);
                      setEditGroupIcon(group.icon || "folder");
                      setEditGroupColor(group.color || "#6366f1");
                    }}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors"
                    aria-label={`Edit ${group.name}`}
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroupClick(group.id)}
                    className={`transition-colors ${
                      isDeleteConfirm
                        ? "text-destructive"
                        : "text-muted-foreground/50 hover:text-destructive"
                    }`}
                    aria-label={
                      isDeleteConfirm
                        ? `Confirm delete ${group.name}`
                        : `Delete ${group.name}`
                    }
                  >
                    <HugeiconsIcon
                      icon={isDeleteConfirm ? Alert02Icon : Delete02Icon}
                      size={14}
                    />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-3 mt-2 border-t border-border/40">
            {isInlineCreating ? (
              <div className="relative mx-1 mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-foreground/5">
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
                        icon={
                          ALL_ICONS_MAP[newGroupIcon] || ALL_ICONS_MAP["folder"]
                        }
                        size={16}
                        strokeWidth={2}
                        style={{ color: newGroupColor || "#6366f1" }}
                      />
                    </button>
                  </IconPickerPopover>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="New group"
                    className="h-8 flex-1 text-sm rounded-xl"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleInlineCreateGroup();
                      } else if (e.key === "Escape") {
                        setIsInlineCreating(false);
                        setNewGroupName("");
                        setNewGroupIcon("folder");
                        setNewGroupColor("#6366f1");
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-3 text-xs rounded-4xl font-bold"
                    onClick={() => {
                      setIsInlineCreating(false);
                      setNewGroupName("");
                      setNewGroupIcon("folder");
                      setNewGroupColor("#6366f1");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs rounded-4xl"
                    onClick={handleInlineCreateGroup}
                    disabled={!newGroupName.trim() || isCreatingGroup}
                  >
                    {isCreatingGroup ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsInlineCreating(true)}
                className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                Create group
              </button>
            )}
          </div>
        </aside>
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
              mode={commandMode}
              searchQuery={searchQuery}
              onModeChange={handleCommandModeChange}
              onSearchChange={setSearchQuery}
              onDuplicatesDetected={setAddConflicts}
            />
          </div>

          {/* Table Header - Fixed (List view only) */}
          <div className="hidden md:flex items-center gap-6 px-5 pt-6 pb-3 text-[11px] font-medium text-muted-foreground/50">
            <div className="flex items-center gap-1.5">
              <KbdGroup className="gap-0.5">
                {viewMode !== "list" ? (
                  <>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ←
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↑
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↓
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      →
                    </Kbd>
                  </>
                ) : (
                  <>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↑
                    </Kbd>
                    <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                      ↓
                    </Kbd>
                  </>
                )}
              </KbdGroup>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1.5">
                Space
              </Kbd>
              <span>preview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KbdGroup className="gap-0.5">
                <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1.5">
                  {isMac ? "⌘" : "Ctrl"}
                </Kbd>
                <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">
                  ⏎
                </Kbd>
              </KbdGroup>
              <span>
                {viewMode === "folders"
                  ? keyboardContext === "folder"
                    ? "open folder"
                    : "open"
                  : "open"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd className="h-[18px] min-w-[18px] text-[10px] px-0.5">⏎</Kbd>
              <span>copy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KbdGroup className="gap-0.5">
                <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1">
                  Shift
                </Kbd>
                <Kbd className="h-[18px] min-w-[18px] text-[10px] px-1">
                  Click
                </Kbd>
              </KbdGroup>
              <span>bulk select</span>
            </div>
          </div>
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background border border-border/50 shadow-lg ring-1 ring-foreground/5">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {selectedIds.size} selected
              </span>
              <div className="h-4 w-px bg-border/50" />
              <button
                type="button"
                onClick={handleOpenSelected}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none"
              >
                Open
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none ${
                  bulkDeleteConfirm
                    ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                }`}
              >
                {bulkDeleteConfirm ? "Sure?" : "Delete"}
              </button>
              <button
                type="button"
                onClick={handleCancelSelection}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-medium text-sm transition-all duration-150 active:scale-[0.97] motion-reduce:transition-none"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* Conflict Resolution Bar */}
        {(addConflicts ||
          (importPreview &&
            importPreview.entries.some((e) => e.isDuplicate))) && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-background border border-border/50 shadow-lg ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 pr-1 text-foreground">
                <HugeiconsIcon
                  icon={Alert02Icon}
                  size={20}
                  className="text-amber-500"
                />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {addConflicts
                    ? `${addConflicts.length} duplicate${
                        addConflicts.length > 1 ? "s" : ""
                      } found`
                    : `${
                        importPreview?.entries.filter((e) => e.isDuplicate)
                          .length
                      } duplicates in import`}
                </span>
              </div>
              <div className="h-4 w-px bg-border/60" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResolveConflicts("override")}
                  className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-[11px] uppercase tracking-wider transition-all active:scale-[0.97]"
                >
                  Add anyway
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveConflicts("skip")}
                  className="px-3.5 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-semibold text-[11px] uppercase tracking-wider transition-all active:scale-[0.97]"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
