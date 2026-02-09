import {
  elements,
  showSection,
  setStatus,
  switchTab,
  setLoading,
} from "./js/ui.js";
import { apiFetch, getSettings } from "./js/api.js";
import { MAX_NAME_LENGTH } from "./js/config.js";
import { fetchPageMeta } from "./js/metadata.js";
import { loadGrabbedLinks, createGroupFromLinks } from "./js/grabber.js";
import { loadTabSession, saveTabSession } from "./js/sessions.js";

let selectedGroupId = "";
let hasManualGroupSelection = false;

// UI Initialization
async function init() {
  document.querySelector(".shell").style.opacity = "1";
  const loadingView = document.getElementById("loading-view");

  await getSettings();
  const { rewayBaseUrl } = await chrome.storage.local.get("rewayBaseUrl");

  // Handle Dev Mode Toggle State
  if (rewayBaseUrl && rewayBaseUrl.includes("localhost")) {
    switchEnv("local");
    try {
      elements.localPort.value = new URL(rewayBaseUrl).port || "3000";
    } catch {
      elements.localPort.value = "3000";
    }
  } else {
    switchEnv("prod");
  }

  // Check Auth by attempting to load groups
  try {
    const data = await apiFetch("/api/extension/groups");
    const groups = data.groups || [];
    await chrome.storage.local.set({ rewayGroups: groups });
    renderGroups(groups);
    showSection("main-section");
  } catch {
    showSection("auth-section");
  } finally {
    if (loadingView) {
      loadingView.classList.add("hidden");
      setTimeout(() => {
        loadingView.style.display = "none";
        loadingView.remove();
      }, 200);
    }
  }

  // Populate UI even if auth fails
  fetchMeta();
}

// Metadata Fetching (On-Demand)
async function fetchMeta() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  elements.pageUrl.textContent = tab.url || "";
  elements.favicon.src = tab.favIconUrl || "icons/icon16.png";
  elements.title.value = tab.title || "";

  const meta = await fetchPageMeta(tab.id);
  if (meta?.description) {
    elements.description.value = meta.description;
  }
}

// Save Page Logic
async function saveBookmark() {
  setLoading(elements.saveBookmarkBtn, true, "Saving...");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const payload = {
    url: tab.url,
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    groupId: selectedGroupId || null,
  };

  try {
    const data = await apiFetch("/api/extension/bookmarks", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data?.bookmark) {
      // Broadcast to any open dashboard tabs
      const settings = await getSettings();
      const dashboardTabs = await chrome.tabs.query({
        url: `${settings.baseUrl}/*`,
      });
      dashboardTabs.forEach((t) => {
        chrome.tabs
          .sendMessage(t.id, {
            type: "broadcastBookmark",
            bookmark: data.bookmark,
          })
          .catch(() => {
            // Ignore - dashboard tab might not have listener ready
          });
      });
    }

    elements.saveBookmarkBtn.classList.add("success");
    setLoading(elements.saveBookmarkBtn, false, "✓ Saved!");
    setTimeout(() => window.close(), 800);
  } catch (err) {
    setLoading(elements.saveBookmarkBtn, false, "Save Page");

    if (err?.status === 409) {
      setStatus("This bookmark already exists in this group", "error");
      return;
    }

    setStatus("Failed to save", "error");
  }
}

// Dev Mode Helpers
let currentDevEnv = "prod";
function switchEnv(env) {
  currentDevEnv = env;
  const isProd = env === "prod";
  elements.envProd.classList.toggle("secondary", isProd);
  elements.envProd.classList.toggle("ghost", !isProd);
  elements.envLocal.classList.toggle("secondary", !isProd);
  elements.envLocal.classList.toggle("ghost", isProd);
  elements.localPortField.style.display = isProd ? "none" : "block";
}

async function handleSaveDevSettings() {
  if (currentDevEnv === "prod") {
    await chrome.storage.local.remove("rewayBaseUrl");
  } else {
    const port = elements.localPort.value.trim() || "3000";
    await chrome.storage.local.set({
      rewayBaseUrl: `http://localhost:${port}`,
    });
  }
  window.location.reload();
}

// Triple-click logo logic for Dev Mode
let logoClickCount = 0;
let logoClickTimeout;
function handleLogoClick() {
  logoClickCount++;
  clearTimeout(logoClickTimeout);
  if (logoClickCount === 3) {
    elements.devPanel.classList.toggle("open");
    logoClickCount = 0;
    return;
  }
  logoClickTimeout = setTimeout(() => (logoClickCount = 0), 1000);
}

// Group UI helpers
function renderGroups(groups) {
  elements.groupMenu.replaceChildren();
  const options = [{ id: "", name: "No group" }, ...groups];

  options.forEach((group, index) => {
    const btn = document.createElement("button");
    btn.className = "select-option";
    btn.textContent = group.name;
    btn.setAttribute("role", "option");
    btn.setAttribute("tabindex", "-1");
    btn.dataset.index = index;

    btn.addEventListener("click", () => {
      selectedGroupId = group.id;
      elements.groupLabel.textContent = group.name;
      const container = elements.groupTrigger.closest(".select");
      container?.classList.remove("open");
      elements.groupTrigger.setAttribute("aria-expanded", "false");
      hasManualGroupSelection = true;

      document
        .querySelectorAll(".select-option")
        .forEach((opt) => opt.classList.remove("active"));
      btn.classList.add("active");
    });
    elements.groupMenu.appendChild(btn);
  });

  if (!hasManualGroupSelection) {
    elements.groupLabel.textContent = options[0].name;
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", init);

elements.saveBookmarkBtn?.addEventListener("click", saveBookmark);
elements.groupTrigger?.addEventListener("click", () => {
  const container = elements.groupTrigger.closest(".select");
  if (!container) return;
  const isOpen = container.classList.toggle("open");
  elements.groupTrigger.setAttribute("aria-expanded", isOpen);
  if (isOpen) {
    const activeOpt =
      elements.groupMenu.querySelector(".select-option.active") ||
      elements.groupMenu.querySelector(".select-option");
    activeOpt?.focus();
  }
});

document.addEventListener("click", (e) => {
  const container = elements.groupTrigger?.closest(".select");
  if (!container) return;
  if (!container.classList.contains("open")) return;
  if (container.contains(e.target)) return;
  container.classList.remove("open");
  elements.groupTrigger?.setAttribute("aria-expanded", "false");
});

elements.groupTrigger?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    elements.groupTrigger.click();
  }
});

// Keyboard Navigation for Dropdown
elements.groupTrigger.parentElement?.addEventListener("keydown", (e) => {
  const container = elements.groupTrigger.closest(".select");
  if (!container) return;
  const isOpen = container.classList.contains("open");
  const options = Array.from(
    elements.groupMenu.querySelectorAll(".select-option"),
  );
  const currentIndex = options.indexOf(document.activeElement);

  if (e.key === "Escape") {
    container.classList.remove("open");
    elements.groupTrigger.setAttribute("aria-expanded", "false");
    elements.groupTrigger.focus();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isOpen) {
      container.classList.add("open");
      elements.groupTrigger.setAttribute("aria-expanded", "true");
      options[0]?.focus();
    } else {
      const nextIndex = (currentIndex + 1) % options.length;
      options[nextIndex]?.focus();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (isOpen) {
      const prevIndex = (currentIndex - 1 + options.length) % options.length;
      options[prevIndex]?.focus();
    }
  }
});

if (elements.loginButton) {
  elements.loginButton.addEventListener("click", async () => {
    const { baseUrl } = await getSettings();
    chrome.tabs.create({ url: `${baseUrl}/login` });
  });
}

elements.logo?.addEventListener("click", handleLogoClick);
elements.envProd?.addEventListener("click", () => switchEnv("prod"));
elements.envLocal?.addEventListener("click", () => switchEnv("local"));
elements.saveDevSettings?.addEventListener("click", handleSaveDevSettings);

// Save Actions Listeners
document
  .getElementById("create-group-from-links")
  ?.addEventListener("click", createGroupFromLinks);
document
  .getElementById("save-session")
  ?.addEventListener("click", saveTabSession);

// Manual Link Adding with Duplicate Check
const addManualLinkBtn = document.getElementById("add-manual-link");
const manualLinkInput = document.getElementById("links-manual-url");

if (addManualLinkBtn && manualLinkInput) {
  const handleAddLink = async () => {
    const value = manualLinkInput.value.trim();
    if (!value) return;

    addManualLinkBtn.disabled = true;

    // Optimistic URL parsing
    let urlToAdd = value;
    if (!/^https?:\/\//i.test(urlToAdd)) {
      urlToAdd = `https://${urlToAdd}`;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: "addGrabbedLink",
        url: urlToAdd,
        source: "manual",
      });

      if (
        response &&
        response.success === false &&
        response.reason === "duplicate"
      ) {
        setStatus(
          "⚠️ Link already added",
          "error",
          document.getElementById("manual-link-status"),
        );
        setTimeout(() => {
          setStatus("", "", document.getElementById("manual-link-status"));
        }, 3000);
      } else {
        manualLinkInput.value = "";
        loadGrabbedLinks();
      }
    } catch (err) {
      console.error("Failed to add link", err);
    } finally {
      addManualLinkBtn.disabled = false;
      manualLinkInput.focus();
    }
  };

  addManualLinkBtn.addEventListener("click", handleAddLink);
  manualLinkInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAddLink();
  });
}

// Tab Navigation Listener
document.querySelectorAll(".tab-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;
    switchTab(tabId);
    if (tabId === "links") loadGrabbedLinks();
    if (tabId === "session") loadTabSession();
  });
});

// Character count helpers
const updateChars = (input, countEl) => {
  const len = input.value.length;
  countEl.textContent = `${len}/${MAX_NAME_LENGTH}`;
  countEl.classList.toggle("error", len >= MAX_NAME_LENGTH);
};

elements.linksGroupName?.addEventListener("input", () =>
  updateChars(
    elements.linksGroupName,
    document.getElementById("links-group-char-count"),
  ),
);
elements.sessionName?.addEventListener("input", () =>
  updateChars(
    elements.sessionName,
    document.getElementById("session-char-count"),
  ),
);

// Close menus on outside click
document.addEventListener("click", (e) => {
  if (!elements.groupTrigger.parentElement.contains(e.target)) {
    elements.groupTrigger.parentElement.classList.remove("open");
  }
});
