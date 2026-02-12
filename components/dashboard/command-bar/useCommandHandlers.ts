"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { BookmarkRow } from "@/lib/supabase/queries";
import type { EnrichmentResult } from "../content/dashboard-types";
import {
  addBookmark,
  enrichCreatedBookmark,
} from "@/app/dashboard/actions/bookmarks";
import { extractLinks } from "@/app/dashboard/actions/extract";
import { extractUrlsFromText, isUrl } from "./helpers";
import { useGlobalKeydown } from "@/hooks/useGlobalKeydown";

interface UseCommandHandlersOptions {
  onAddBookmark: (bookmark: BookmarkRow) => void;
  onApplyEnrichment?: (id: string, enrichment?: EnrichmentResult) => void;
  onReplaceBookmarkId?: (stableId: string, actualId: string) => void;
  onModeChange?: (mode: "add" | "search") => void;
  onSearchChange?: (query: string) => void;
  activeGroupId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onAddStatusChange?: (status: string | null) => void;
  onAddBusyChange?: (busy: boolean) => void;
}

export function useCommandHandlers({
  onAddBookmark,
  onApplyEnrichment,
  onReplaceBookmarkId,
  onModeChange,
  onSearchChange,
  activeGroupId,
  inputRef,
  onAddStatusChange,
  onAddBusyChange,
}: UseCommandHandlersOptions) {
  const isSubmittingRef = useRef(false);

  const setAddStatus = useCallback(
    (status: string | null, busy?: boolean) => {
      onAddStatusChange?.(status);
      if (typeof busy === "boolean") {
        onAddBusyChange?.(busy);
      }
    },
    [onAddBusyChange, onAddStatusChange],
  );

  const processUrls = useCallback(
    async (urls: string[]) => {
      const executeAdd = async (url: string) => {
        const stableId = crypto.randomUUID();
        const optimistic = {
          id: stableId,
          url,
          title: url,
          favicon_url: null,
          description: null,
          group_id: activeGroupId !== "all" ? activeGroupId : null,
          user_id: "",
          created_at: new Date().toISOString(),
          order_index: Number.MIN_SAFE_INTEGER,
          status: "pending",
        } as BookmarkRow;

        onAddBookmark(optimistic);

        try {
          const bookmarkId = await addBookmark({
            url,
            id: stableId,
            group_id: activeGroupId !== "all" ? activeGroupId : undefined,
          });
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

      if (urls.length === 1) {
        const u = urls[0];
        const fullUrl = u.startsWith("http") ? u : `https://${u}`;
        const stableId = crypto.randomUUID();
        const optimistic = {
          id: stableId,
          url: fullUrl,
          title: fullUrl,
          favicon_url: null,
          description: null,
          group_id: activeGroupId !== "all" ? activeGroupId : null,
          user_id: "",
          created_at: new Date().toISOString(),
          order_index: Number.MIN_SAFE_INTEGER,
          status: "pending",
          is_enriching: true,
        } as BookmarkRow;

        onAddBookmark(optimistic);

        try {
          const bookmarkId = await addBookmark({
            url: fullUrl,
            id: stableId,
            group_id: activeGroupId !== "all" ? activeGroupId : undefined,
          });
          if (bookmarkId) {
            onReplaceBookmarkId?.(stableId, bookmarkId);
          }
          const enrichment = (await enrichCreatedBookmark(bookmarkId, fullUrl)) as
            | EnrichmentResult
            | undefined;
          onApplyEnrichment?.(bookmarkId ?? stableId, enrichment);
        } catch (error) {
          console.error("Failed to add bookmark:", error);
          toast.error(`Failed to add ${fullUrl}`);
        }
        return;
      }

      const fullUrls = urls.map((u) => (u.startsWith("http") ? u : `https://${u}`));
      await Promise.all(fullUrls.map(executeAdd));
    },
    [activeGroupId, onAddBookmark, onApplyEnrichment, onReplaceBookmarkId],
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
              setAddStatus("Extracting links from image...", true);
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = async () => {
                try {
                  const base64 = reader.result as string;
                  const base64Data = base64.split(",")[1];
                  try {
                    const urls = await extractLinks(base64Data, true);
                    if (urls.length > 0) {
                      setAddStatus("Adding links from image...", true);
                      await processUrls(urls);
                    } else {
                      toast.error("No links found in the image");
                    }
                  } catch (error) {
                    const message =
                      error instanceof Error
                        ? error.message
                        : "Failed to extract links from image";
                    toast.error(message);
                  }
                } finally {
                  setAddStatus(null, false);
                }
              };
              return;
            }
          }
        }
      }
    },
    [processUrls, setAddStatus],
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
          setAddStatus("Extracting links from image...", true);
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const base64Data = base64.split(",")[1];
              try {
                const urls = await extractLinks(base64Data, true);
                if (urls.length > 0) {
                  setAddStatus("Adding links from image...", true);
                  await processUrls(urls);
                } else {
                  toast.error("No links found in the image");
                }
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to extract links from image";
                toast.error(message);
              }
            } finally {
              setAddStatus(null, false);
            }
          };
        } catch (error) {
          console.error("Image processing failed:", error);
          toast.error("Failed to process image");
          setAddStatus(null, false);
        }
      }
    },
    [processUrls, setAddStatus],
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

      if (isSubmittingRef.current) return;
      const value = mode === "search" ? searchQuery.trim() : inputValue.trim();
      if (!value) return;

      if (mode === "search") {
        onSearchChange?.(value);
        inputRef.current?.blur();
        return;
      }

      setInputValue("");
      inputRef.current?.blur();

      isSubmittingRef.current = true;

      if (isUrl(value) && !value.includes(" ")) {
        setAddStatus("Adding link...", true);
        try {
          await processUrls([value]);
        } finally {
          setAddStatus(null, false);
          isSubmittingRef.current = false;
        }
      } else {
        setAddStatus("Extracting links from text...", true);
        try {
          const urls = extractUrlsFromText(value);
          if (urls.length > 0) {
            setAddStatus("Adding links from text...", true);
            await processUrls(urls);
          } else {
            toast.error("No links found");
          }
        } finally {
          setAddStatus(null, false);
          isSubmittingRef.current = false;
        }
      }
    },
    [inputRef, onSearchChange, processUrls, setAddStatus],
  );

  return {
    handleFileChange,
    handleSubmit,
  };
}
