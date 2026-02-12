"use client";

import { useEffect } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const KEY = "reway.dashboard.onboarding.v1";

function safeGet() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function safeSet(value: string) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // ignore
  }
}

function openUserMenu() {
  window.dispatchEvent(new CustomEvent("reway:open-user-menu"));
}

function closeUserMenu() {
  window.dispatchEvent(new CustomEvent("reway:close-user-menu"));
}

function openGroupsMenu() {
  window.dispatchEvent(new CustomEvent("reway:open-groups-menu"));
}

function closeGroupsMenu() {
  window.dispatchEvent(new CustomEvent("reway:close-groups-menu"));
}

function getFirstVisibleElement(selectors: string[]) {
  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) continue;
    if (el.offsetParent !== null) return el;
  }
  return null;
}

function isSmallScreen() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function createTour() {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.82,
    smoothScroll: true,
    doneBtnText: "Done",
    nextBtnText: "Next",
    prevBtnText: "Back",
    onDestroyed: () => {
      safeSet("done");
    },
  });

  const steps: DriveStep[] = [
    {
      popover: {
        title: "Welcome to Reway",
        description:
          "Let’s quickly walk through the dashboard so you can save and organize bookmarks faster.",
      },
    },
    {
      element: '[data-onboarding="command-bar"]',
      popover: {
        title: "Add & search",
        description: "Add URLs, upload an image, or search from one place.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-onboarding="add-bookmarks"]',
      popover: {
        title: "Add bookmarks",
        description:
          "Switch to Add mode, paste a link, then press Enter to save it.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-onboarding="search-bookmarks"]',
      popover: {
        title: "Search bookmarks",
        description:
          "Switch to Search mode and type to filter bookmarks instantly.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: isSmallScreen()
        ? '[data-onboarding="groups-mobile"]'
        : ('[data-onboarding="groups-desktop"]' as const),
      popover: {
        title: "Groups",
        description: "Groups help you keep related bookmarks together.",
        side: isSmallScreen() ? "bottom" : "right",
        align: "start",
        onNextClick: () => {
          if (isSmallScreen()) {
            openGroupsMenu();
            setTimeout(() => driverObj.moveNext(), 300);
            return;
          }
          driverObj.moveNext();
        },
      },
    },
    {
      element: isSmallScreen()
        ? '[data-onboarding="create-group-mobile"]'
        : ('[data-onboarding="create-group-desktop"]' as const),
      popover: {
        title: "Create groups",
        description:
          "Create a new group for projects, topics, or workflows, then start saving into it.",
        side: "bottom",
        align: "start",
        onNextClick: () => {
          if (isSmallScreen()) {
            closeGroupsMenu();
            setTimeout(() => driverObj.moveNext(), 150);
            return;
          }
          driverObj.moveNext();
        },
      },
    },
    {
      element:
        getFirstVisibleElement([
          '[data-onboarding="view-mode-desktop"]',
          '[data-onboarding="view-mode-mobile"]',
        ]) ?? undefined,
      popover: {
        title: "View modes",
        description: "Switch how you browse: list, cards, icons, or folders.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-onboarding="drag-sort"]',
      popover: {
        title: "Drag to sort",
        description:
          "You can drag bookmarks to reorder them. Tip: keyboard sorting is also supported.",
        side: isSmallScreen() ? "bottom" : "top",
        align: "center",
      },
    },
    {
      element: '[data-onboarding="user-menu"]',
      popover: {
        title: "Avatar menu",
        description:
          "Open this menu to change preferences, import/export, and download the extension.",
        side: "bottom",
        align: "end",
        onNextClick: () => {
          openUserMenu();
          setTimeout(() => driverObj.moveNext(), 150);
        },
      },
    },
    {
      element: '[data-onboarding="import-export"]',
      popover: {
        title: "Import & export",
        description: "Bring bookmarks in or export your data anytime.",
        side: "left",
        align: "center",
      },
    },
    {
      element: '[data-onboarding="row-content"]',
      popover: {
        title: "Row content",
        description:
          "Choose whether rows show the bookmark’s date or its group.",
        side: "left",
        align: "center",
      },
    },
    {
      element: '[data-onboarding="extension"]',
      popover: {
        title: "Browser extension",
        description:
          "Install the extension to save bookmarks while browsing without leaving the page.",
        side: "left",
        align: "center",
        onNextClick: () => {
          closeUserMenu();
          setTimeout(() => driverObj.moveNext(), 150);
        },
      },
    },
    {
      popover: {
        title: "You’re all set",
        description:
          "You can restart this tour anytime from your avatar menu: Start Onboarding.",
      },
    },
  ];

  driverObj.setSteps(steps);

  return driverObj;
}

export function DashboardOnboarding() {
  useEffect(() => {
    const run = (force?: boolean) => {
      if (!force && safeGet() === "done") return;
      const tour = createTour();
      tour.drive();
    };

    const handleStart = () => run(true);
    window.addEventListener("reway:start-onboarding", handleStart);

    run(false);

    return () => {
      window.removeEventListener("reway:start-onboarding", handleStart);
    };
  }, []);

  return null;
}
