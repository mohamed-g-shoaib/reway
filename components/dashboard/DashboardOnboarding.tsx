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

function openSettingsSheet() {
  window.dispatchEvent(new CustomEvent("reway:open-settings"));
}

function closeSettingsSheet() {
  window.dispatchEvent(new CustomEvent("reway:close-settings"));
}

function openThemeSelect() {
  window.dispatchEvent(new CustomEvent("reway:open-theme-select"));
}

function closeThemeSelect() {
  window.dispatchEvent(new CustomEvent("reway:close-theme-select"));
}

function waitForElement(selector: string, timeoutMs = 1500) {
  return new Promise<boolean>((resolve) => {
    const start = Date.now();
    const tick = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el && el.offsetParent !== null) {
        resolve(true);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
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

  const isMobile = isSmallScreen();

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
        description:
          "Add URLs, upload an image to extract URLs, or search from one place.",
        side: "bottom",
        align: "center",
        onNextClick: async () => {
          if (isMobile) {
            openGroupsMenu();
            await waitForElement(
              '[data-onboarding="groups-mobile-content"]',
              2000,
            );
            setTimeout(() => driverObj.moveNext(), 100);
            return;
          }
          driverObj.moveNext();
        },
      },
    },
    {
      element: isMobile
        ? ('[data-onboarding="groups-mobile-content"]' as const)
        : ('[data-onboarding="groups-desktop"]' as const),
      popover: {
        title: "Groups",
        description: isMobile
          ? "Groups help you keep related bookmarks together. Switch groups or create a new one with custom icons and colors."
          : "Groups help you keep related bookmarks together. Switch groups or use Shift + first letter of a group name to switch, or create a new one with custom icons and colors.",
        side: isMobile ? "bottom" : "right",
        align: "start",
        onNextClick: () => {
          if (isMobile) {
            closeGroupsMenu();
            setTimeout(() => driverObj.moveNext(), 150);
            return;
          }
          driverObj.moveNext();
        },
        onPrevClick: () => {
          if (isMobile) {
            closeGroupsMenu();
            setTimeout(() => driverObj.movePrevious(), 150);
            return;
          }
          driverObj.movePrevious();
        },
      },
    },
  ];

  // Add notes/todos step only for desktop
  if (!isMobile) {
    steps.push({
      element: '[data-onboarding="notes-todos-desktop"]',
      popover: {
        title: "Notes & todos",
        description:
          "Here you can add quick notes and track to-do tasks, all in one place.",
        side: "bottom",
        align: "start",
      },
    });
  }

  // Continue with common steps
  steps.push(
    {
      element:
        getFirstVisibleElement([
          '[data-onboarding="view-mode-desktop"]',
          '[data-onboarding="view-mode-mobile"]',
        ]) ?? undefined,
      popover: {
        title: "View modes",
        description:
          "Change how you want to see bookmarks: list, cards, icons, or folders.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-onboarding="drag-sort"]',
      popover: {
        title: "Your bookmarks",
        description: isMobile
          ? "This is your bookmarks list. You can hold and drag items to sort, and you can hold to open options. Click icon, url, title to open a bookmark, or click an empty area to drag and drop."
          : "This is your bookmarks list. You can drag items to sort, and you can use keyboard shortcuts too. Click icon, url, title to open a bookmark, or click an empty area to drag and drop.",
        side: isMobile ? "bottom" : "top",
        align: "center",
        onNextClick: async () => {
          openUserMenu();
          await waitForElement('[data-onboarding="user-menu-content"]', 1500);
          setTimeout(() => driverObj.moveNext(), 100);
        },
      },
    },
    {
      element: '[data-onboarding="user-menu-content"]',
      popover: {
        title: "Avatar menu",
        description:
          "From here, you can control everything, you can open 'Duplicates' to remove any duplicate bookmarks, you can import/export, open settings sheet, or logout.",
        side: "left",
        align: "center",
        onPrevClick: () => {
          closeUserMenu();
          setTimeout(() => driverObj.movePrevious(), 150);
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
      element: '[data-onboarding="extension"]',
      popover: {
        title: "Browser extension",
        description:
          "Install the extension to save bookmarks while browsing without leaving the page, and to enable opening bulk bookmarks.",
        side: "left",
        align: "center",
        onNextClick: async () => {
          closeUserMenu();
          await new Promise((resolve) => setTimeout(resolve, 200));
          openSettingsSheet();
          let settingsVisible = await waitForElement(
            '[data-onboarding="settings-controls"]',
            3000,
          );
          if (!settingsVisible) {
            openSettingsSheet();
            settingsVisible = await waitForElement(
              '[data-onboarding="settings-controls"]',
              2000,
            );
          }
          if (!settingsVisible) {
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
          driverObj.moveNext();
        },
        onPrevClick: () => {
          driverObj.movePrevious();
        },
      },
    },
    {
      element: '[data-onboarding="settings-controls"]',
      popover: {
        title: "Settings",
        description:
          "Here are your main controls: row content which shows either the date of when a bookmark was created, or shows its group name, control notes & todos visibility (Desktop), and appearance options.",
        side: "bottom",
        align: "center",
        onNextClick: async () => {
          openThemeSelect();
          await waitForElement(
            '[data-onboarding="palette-theme-options"]',
            3000,
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          driverObj.moveNext();
        },
        onPrevClick: async () => {
          closeSettingsSheet();
          await new Promise((resolve) => setTimeout(resolve, 200));
          openUserMenu();
          await waitForElement('[data-onboarding="user-menu-content"]', 1500);
          await new Promise((resolve) => setTimeout(resolve, 100));
          driverObj.movePrevious();
        },
      },
    },
    {
      element: '[data-onboarding="palette-theme-options"]',
      popover: {
        title: "Available themes",
        description:
          "Choose your preferred theme from the list of available options with dark and light mode support.",
        side: "left",
        align: "center",
        onNextClick: async () => {
          closeThemeSelect();
          await new Promise((resolve) => setTimeout(resolve, 200));
          closeSettingsSheet();
          await new Promise((resolve) => setTimeout(resolve, 300));
          driverObj.moveNext();
        },
        onPrevClick: async () => {
          closeThemeSelect();
          await new Promise((resolve) => setTimeout(resolve, 200));
          driverObj.movePrevious();
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
  );

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
