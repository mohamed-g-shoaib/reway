"use client";

import { useEffect } from "react";
import { migrateLocalStorageToCookies, setPreferenceCookie } from "@/lib/cookies";
import {
  type DashboardPaletteTheme,
  getPaletteThemeClassName,
} from "@/lib/themes";

export function useDashboardPreferences({
  viewModeAll,
  viewModeGroups,
  rowContent,
  showNotesTodos,
  layoutDensity,
  commandMode,
  paletteTheme,
  folderHeaderTint,
}: {
  viewModeAll: "list" | "card" | "icon" | "folders";
  viewModeGroups: "list" | "card" | "icon" | "folders";
  rowContent: "date" | "group";
  showNotesTodos: boolean;
  layoutDensity: "compact" | "extended";
  commandMode: "add" | "search";
  paletteTheme: DashboardPaletteTheme;
  folderHeaderTint: "off" | "low" | "medium" | "high";
}) {
  useEffect(() => {
    migrateLocalStorageToCookies();
  }, []);

  useEffect(() => {
    setPreferenceCookie("viewMode.all", viewModeAll);
  }, [viewModeAll]);

  useEffect(() => {
    setPreferenceCookie("viewMode.groups", viewModeGroups);
  }, [viewModeGroups]);

  useEffect(() => {
    setPreferenceCookie("rowContent", rowContent);
  }, [rowContent]);

  useEffect(() => {
    setPreferenceCookie("showNotesTodos", showNotesTodos ? "true" : "false");
  }, [showNotesTodos]);

  useEffect(() => {
    setPreferenceCookie("layoutDensity", layoutDensity);
  }, [layoutDensity]);

  useEffect(() => {
    setPreferenceCookie("commandMode", commandMode);
  }, [commandMode]);

  useEffect(() => {
    setPreferenceCookie("paletteTheme", paletteTheme);
  }, [paletteTheme]);

  useEffect(() => {
    setPreferenceCookie("folderHeaderTint", folderHeaderTint);
  }, [folderHeaderTint]);

  useEffect(() => {
    const root = document.body;
    const dashboardRoot = document.querySelector("[data-dashboard-root]");
    const classToApply = getPaletteThemeClassName(paletteTheme);
    const knownClasses = [
      "theme-amber-minimal",
      "theme-amethyst-haze",
      "theme-claude",
      "theme-modern-minimal",
      "theme-notebook",
      "theme-supabase",
      "theme-t3-chat",
      "theme-perplexity",
    ];

    root.classList.remove(...knownClasses);
    if (dashboardRoot instanceof HTMLElement) {
      dashboardRoot.classList.remove(...knownClasses);
    }

    if (classToApply) {
      root.classList.add(classToApply);
      if (dashboardRoot instanceof HTMLElement) {
        dashboardRoot.classList.add(classToApply);
      }
    }

    return () => {
      root.classList.remove(...knownClasses);
      if (dashboardRoot instanceof HTMLElement) {
        dashboardRoot.classList.remove(...knownClasses);
      }
    };
  }, [paletteTheme]);
}
