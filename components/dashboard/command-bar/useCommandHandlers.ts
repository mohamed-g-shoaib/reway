"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";
import type { EnrichmentResult } from "../content/dashboard-types";
import {
  addBookmark,
  checkDuplicateBookmarks,
  enrichCreatedBookmark,
} from "@/app/dashboard/actions/bookmarks";
import { extractLinks } from "@/app/dashboard/actions/extract";
import { isUrl, normalizeUrl } from "./helpers";
import { useGlobalKeydown } from "@/hooks/useGlobalKeydown";

interface UseCommandHandlersOptions {
  onAddBookmark: (bookmark: BookmarkRow) => void;
  onApplyEnrichment?: (id: string, enrichment?: EnrichmentResult) => void;
  onReplaceBookmarkId?: (stableId: string, actualId: string) => void;
  onModeChange?: (mode: "add" | "search") => void;
  onSearchChange?: (query: string) => void;
  onDuplicatesDetected?: (duplicates: { url: string; title: string }[]) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useCommandHandlers({
  onAddBookmark,
  onApplyEnrichment,
  onReplaceBookmarkId,
  onModeChange,
  onSearchChange,
  onDuplicatesDetected,
  inputRef,
}: UseCommandHandlersOptions) {
  const processUrls = useCallback(
    async (urls: string[]) => {
      let duplicateMap: Record<
        string,
        { id: string; title: string; url: string }
      > = {};
      try {
        const checkUrls = [...urls];
        urls.forEach((u) => {
          if (!u.startsWith("http")) checkUrls.push(`https://${u}`);
        });
        const result = await checkDuplicateBookmarks(checkUrls);
        duplicateMap = result.duplicates;
      } catch (error) {
        console.error("Failed to check for duplicates:", error);
      }

      const uniqueUrls: string[] = [];
      const duplicateEntries: {
        url: string;
        existing: { id: string; title: string; url: string };
      }[] = [];

      urls.forEach((u) => {
        const fullUrl = u.startsWith("http") ? u : `https://${u}`;
        const normalizedFullUrl = normalizeUrl(fullUrl);
        const existing = duplicateMap[normalizedFullUrl];
        if (existing) {
          duplicateEntries.push({
            url: fullUrl,
            existing,
          });
        } else {
          uniqueUrls.push(fullUrl);
        }
      });

      const executeAdd = async (url: string) => {
        const stableId = crypto.randomUUID();
        const optimistic = {
          id: stableId,
          url,
          title: url,
          favicon_url: null,
          description: null,
          group_id: null,
          user_id: "",
          created_at: new Date().toISOString(),
          order_index: Number.MIN_SAFE_INTEGER,
          status: "pending",
        } as BookmarkRow;

        onAddBookmark(optimistic);

        try {
          const bookmarkId = await addBookmark({ url, id: stableId });
          if (bookmarkId) {
            onReplaceBookmarkId?.(stableId, bookmarkId);
          }
          const enrichment = (await enrichCreatedBookmark(bookmarkId, url)) as
            | EnrichmentResult
            | undefined;
          onApplyEnrichment?.(bookmarkId ?? stableId, enrichment);
        } catch (error) {
          console.error("Failed to add bookmark:", error);
          toast.error(`Failed to add ${url}`);
        }
      };

      await Promise.all(uniqueUrls.map(executeAdd));

      if (duplicateEntries.length > 0) {
        if (onDuplicatesDetected) {
          onDuplicatesDetected(
            duplicateEntries.map((entry) => ({
              url: entry.url,
              title: entry.existing.title,
            })),
          );
        } else {
          duplicateEntries.forEach(({ url, existing }) => {
            toast.info(`Already bookmarked: ${existing.title}`, {
              description: "This URL already exists in your bookmarks.",
              action: {
                label: "Add Anyway",
                onClick: () => executeAdd(url),
              },
              duration: 10000,
            });
          });
        }
      }
    },
    [onAddBookmark, onDuplicatesDetected],
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = async () => {
                const base64 = reader.result as string;
                const base64Data = base64.split(",")[1];
                const urls = await extractLinks(base64Data, true);
                if (urls.length > 0) {
                  await processUrls(urls);
                }
              };
              return;
            }
          }
        }
      }
    },
    [processUrls],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onModeChange?.("search");
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onModeChange?.("add");
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    },
    [inputRef, onModeChange],
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  useGlobalKeydown(handleKeyDown);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(",")[1];
            const urls = await extractLinks(base64Data, true);
            if (urls.length > 0) {
              await processUrls(urls);
            }
          };
        } catch (error) {
          console.error("Image processing failed:", error);
        }
      }
    },
    [processUrls],
  );

  const handleSubmit = useCallback(
    async (
      e: React.FormEvent,
      mode: "add" | "search",
      inputValue: string,
      searchQuery: string,
      setInputValue: (value: string) => void,
    ) => {
      e.preventDefault();
      const value = mode === "search" ? searchQuery.trim() : inputValue.trim();
      if (!value) return;

      if (mode === "search") {
        onSearchChange?.(value);
        inputRef.current?.blur();
        return;
      }

      setInputValue("");
      inputRef.current?.blur();

      if (isUrl(value) && !value.includes(" ")) {
        await processUrls([value]);
      } else {
        try {
          const urls = await extractLinks(value);
          if (urls.length > 0) {
            await processUrls(urls);
          } else {
            console.log("No links found by AI or just searching.");
          }
        } catch (error) {
          console.error("AI extraction failed:", error);
        }
      }
    },
    [inputRef, onSearchChange, processUrls],
  );

  return {
    handleFileChange,
    handleSubmit,
  };
}
