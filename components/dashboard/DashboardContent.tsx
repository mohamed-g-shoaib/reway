"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { BookmarkBoard } from "@/components/dashboard/BookmarkBoard";
import { FolderBoard } from "@/components/dashboard/FolderBoard";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { DashboardNav, type User } from "@/components/dashboard/DashboardNav";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useIsMac } from "@/hooks/useIsMac";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight03Icon, GridIcon } from "@hugeicons/core-free-icons";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import { createClient } from "@/lib/supabase/client";

const EXTENSION_STORE_URL = "https://example.com/reway-extension";

interface DashboardContentProps {
  user: User;
  initialBookmarks: BookmarkRow[];
  initialGroups: GroupRow[];
}

import {
  updateBookmarksOrder,
  updateFolderBookmarksOrder,
  deleteBookmark as deleteAction,
  restoreBookmark as restoreAction,
  updateBookmark as updateBookmarkAction,
  updateGroup as updateGroupAction,
  deleteGroup as deleteGroupAction,
} from "@/app/dashboard/actions";

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
  const [keyboardContext, setKeyboardContext] = useState<
    "folder" | "bookmark"
  >("bookmark");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandMode, setCommandMode] = useState<"add" | "search">("add");
  const isMac = useIsMac();
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const letterCycleRef = React.useRef<Record<string, number>>({});
  const nonFolderViewMode = viewMode === "folders" ? "list" : viewMode;
  const lastDeletedRef = React.useRef<{
    bookmark: BookmarkRow;
    index: number;
  } | null>(null);
  const lastBulkDeletedRef = React.useRef<
    { bookmark: BookmarkRow; index: number }[]
  >([]);
  const viewModeStorageKey = "reway.dashboard.viewMode";

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
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
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
        setBookmarks((prev) => sortBookmarks([nextRow, ...prev]));
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
        if (!nextRow) return;
        setGroups((prev) => sortGroups([nextRow, ...prev]));
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
          return prev.map((item) => (item.id === bookmark.id ? bookmark : item));
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
      const firstChar = group.name.trim().charAt(0);
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

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      // Optimistic delete
      setGroups((prev) => prev.filter((g) => g.id !== id));
      if (activeGroupId === id) {
        setActiveGroupId("all");
      }
      try {
        await deleteGroupAction(id);
      } catch (error) {
        console.error("Delete group failed:", error);
        toast.error("Failed to delete group");
        // Restore group if delete failed
        setGroups((prev) => {
          const deletedGroup = initialGroups.find((g) => g.id === id);
          return deletedGroup ? [...prev, deletedGroup] : prev;
        });
      }
    },
    [activeGroupId],
  );

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
      const urls = targetBookmarks.map((bookmark) => bookmark.url).filter(Boolean);

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
                    <span className="truncate max-w-36">{group.name}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGroup(group.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-foreground transition-opacity"
                  aria-label={`Open ${group.name}`}
                >
                  <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                </button>
              </div>
            );
          })}
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
          />
          <div className="pt-4 md:pt-6">
            <CommandBar
              onAddBookmark={addOptimisticBookmark}
              mode={commandMode}
              searchQuery={searchQuery}
              onModeChange={handleCommandModeChange}
              onSearchChange={setSearchQuery}
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
      </div>
    </>
  );
}
