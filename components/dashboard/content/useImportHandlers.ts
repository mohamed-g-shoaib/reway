"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { normalizeUrl } from "@/lib/metadata";
import type {
  EnrichmentResult,
  ImportEntry,
  ImportGroupSummary,
} from "./dashboard-types";

interface UseImportHandlersOptions {
  bookmarks: BookmarkRow[];
  groups: GroupRow[];
  userId: string;
  normalizeGroupName: (value?: string | null) => string;
  isValidImportUrl: (url: string) => boolean;
  sortBookmarks: (items: BookmarkRow[]) => BookmarkRow[];
  sortGroups: (items: GroupRow[]) => GroupRow[];
  addBookmark: (formData: {
    url: string;
    id?: string;
    title?: string;
    group_id?: string;
  }) => Promise<string | undefined>;
  createGroup: (formData: {
    name: string;
    icon: string;
    color?: string | null;
  }) => Promise<string>;
  enrichCreatedBookmark: (id: string, url: string) => Promise<unknown>;
  checkDuplicateBookmarks: (urls: string[]) => Promise<{
    duplicates: Record<string, { id: string; title: string; url: string }>;
  }>;
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  setGroups: React.Dispatch<React.SetStateAction<GroupRow[]>>;
}

export function useImportHandlers({
  bookmarks,
  groups,
  userId,
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
}: UseImportHandlersOptions) {
  const [importPreview, setImportPreview] = useState<{
    groups: ImportGroupSummary[];
    entries: ImportEntry[];
  } | null>(null);
  const [importProgress, setImportProgress] = useState({
    processed: 0,
    total: 0,
    status: "idle" as "idle" | "importing" | "done" | "error",
  });

  const parseBookmarkHtml = useCallback(
    (content: string) => {
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
              let nestedDl = child.nextElementSibling;

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
    },
    [isValidImportUrl, normalizeGroupName],
  );

  const handleImportFileSelected = useCallback(
    async (file: File) => {
      const content = await file.text();
      const rawEntries = parseBookmarkHtml(content);
      if (rawEntries.length === 0) {
        toast.error("No bookmarks found in file");
        return;
      }

      const normalizedByUrl = new Map<string, string>();
      rawEntries.forEach((entry) => {
        try {
          normalizedByUrl.set(entry.url, normalizeUrl(entry.url));
        } catch {
          normalizedByUrl.set(entry.url, entry.url);
        }
      });

      const urls = rawEntries.map((entry) => normalizedByUrl.get(entry.url) || entry.url);
      let duplicateMap: Record<
        string,
        { id: string; title: string; url: string }
      > = {};

      try {
        const result = await checkDuplicateBookmarks(urls);
        duplicateMap = result.duplicates;
      } catch (error) {
        console.error("Failed to check for duplicates:", error);
      }

      const entries: ImportEntry[] = rawEntries.map((entry) => {
        const normalized = normalizedByUrl.get(entry.url) || entry.url;
        const existingBookmark = duplicateMap[normalized];
        return {
          ...entry,
          isDuplicate: !!existingBookmark,
          existingBookmark,
          action: existingBookmark ? "skip" : "add",
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

      setImportPreview({ groups: groupSummaries, entries });
    },
    [checkDuplicateBookmarks, normalizeGroupName, parseBookmarkHtml],
  );

  const handleConfirmImport = useCallback(
    async (selectedGroups: string[]) => {
      if (!importPreview) return;
      const allowed = new Set(
        selectedGroups.map((name) => normalizeGroupName(name)),
      );
      const entries = importPreview.entries
        .map((entry) => ({
          ...entry,
          groupName: normalizeGroupName(entry.groupName),
        }))
        .filter(
          (entry) => allowed.has(entry.groupName) && entry.action !== "skip",
        );
      if (entries.length === 0) {
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
            user_id: userId,
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
        user_id: userId,
        created_at: new Date().toISOString(),
        order_index: item.orderIndex,
        folder_order_index: null,
        status: "pending",
      }));

      setBookmarks((prev) => sortBookmarks([...optimisticRows, ...prev]));

      let processed = 0;
      const handlePendingEntry = async ({
        entry,
        groupId,
        optimisticId,
        orderIndex,
      }: (typeof pendingEntries)[number]) => {
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
      };

      const CONCURRENCY = 5;
      for (let i = 0; i < pendingEntries.length; i += CONCURRENCY) {
        const chunk = pendingEntries.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(handlePendingEntry));
      }

      setImportProgress({ processed, total: entries.length, status: "done" });
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
      userId,
      setBookmarks,
      setGroups,
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

  return {
    importPreview,
    importProgress,
    handleImportFileSelected,
    handleConfirmImport,
    handleClearImport,
    handleUpdateImportAction,
  };
}
