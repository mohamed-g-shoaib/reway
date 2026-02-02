"use client";

import { useEffect, useState } from "react";

interface UseBookmarkGridOptions {
  viewMode: "list" | "card" | "icon";
  isGridView: boolean;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

export function useBookmarkGrid({
  viewMode,
  isGridView,
  boardRef,
}: UseBookmarkGridOptions) {
  const [gridColumns, setGridColumns] = useState(1);

  useEffect(() => {
    if (!boardRef.current || !isGridView) return;

    const updateColumns = () => {
      if (viewMode === "card") {
        const isLg = window.matchMedia("(min-width: 1024px)").matches;
        const isSm = window.matchMedia("(min-width: 640px)").matches;
        setGridColumns(isLg ? 3 : isSm ? 2 : 1);
        return;
      }

      const width = boardRef.current?.clientWidth || 0;
      const gap = 12;
      const minCardWidth = 120;
      const columns = Math.max(
        1,
        Math.floor((width + gap) / (minCardWidth + gap)),
      );
      setGridColumns(columns);
    };

    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(boardRef.current);
    return () => {
      observer.disconnect();
    };
  }, [viewMode, isGridView, boardRef]);

  return gridColumns;
}
