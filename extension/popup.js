const DEFAULT_BASE_URL = "http://localhost:3000";

const selectors = {
  title: "#title",
  description: "#description",
  groupSelect: "#group-select",
  groupTrigger: "#group-trigger",
  groupLabel: "#group-label",
  groupMenu: "#group-menu",
  save: "#save",
  status: "#status",
  favicon: "#favicon",
  pageUrl: "#page-url",
  token: "#token",
  baseUrl: "#base-url",
  saveSettings: "#save-settings",
  dashboardLink: "#dashboard-link",
  settingsToggle: "#settings-toggle",
  authSection: "#auth-section",
  mainSection: "#main-section",
  linksGroupName: "#links-group-name",
  linksGroupCharCount: "#links-group-char-count",
  sessionName: "#session-name",
  sessionCharCount: "#session-char-count",
};

const elements = Object.fromEntries(
  Object.entries(selectors).map(([key, selector]) => [
    key,
    document.querySelector(selector),
  ]),
);

let selectedGroupId = "";
let hasManualGroupSelection = false;

function setGroupLabel(label) {
  elements.groupLabel.textContent = label || "No group";
}

function closeGroupMenu() {
  elements.groupSelect.classList.remove("open");
}

function openGroupMenu() {
  elements.groupSelect.classList.add("open");
}

function toggleGroupMenu() {
  if (elements.groupSelect.classList.contains("open")) {
    closeGroupMenu();
  } else {
    openGroupMenu();
  }
}

function setSelectedGroup(group, { manual = false } = {}) {
  selectedGroupId = group?.id || "";
  setGroupLabel(group?.name || "No group");
  if (manual) {
    hasManualGroupSelection = true;
  }

  const options = elements.groupMenu.querySelectorAll(".select-option");
  options.forEach((option) => {
    option.dataset.selected =
      option.dataset.id === selectedGroupId ? "true" : "false";
  });
}

function setStatus(text, tone = "") {
  if (!elements.status) return;
  elements.status.textContent = text;
  elements.status.dataset.tone = tone;
}

const MAX_NAME_LENGTH = 18;

function updateCharCount(input, counter) {
  if (!input || !counter) return;
  const length = input.value.length;
  counter.textContent = `${length}/${MAX_NAME_LENGTH}`;

  counter.classList.remove("warning", "error");
  if (length >= MAX_NAME_LENGTH) {
    counter.classList.add("error");
  } else if (length >= MAX_NAME_LENGTH - 5) {
    counter.classList.add("warning");
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab;
}

async function getSettings() {
  const { rewayToken, rewayBaseUrl, rewayGroups } =
    await chrome.storage.local.get([
      "rewayToken",
      "rewayBaseUrl",
      "rewayGroups",
    ]);

  return {
    token: rewayToken || "",
    baseUrl: rewayBaseUrl || DEFAULT_BASE_URL,
    groups: Array.isArray(rewayGroups) ? rewayGroups : [],
  };
}

async function saveSettings() {
  const token = elements.token.value.trim();
  const baseUrl = elements.baseUrl.value.trim() || DEFAULT_BASE_URL;

  if (!token) {
    setStatus("Access token is required.", "error");
    return;
  }

  // Test the connection
  try {
    const response = await fetch(`${baseUrl}/api/extension/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth failed:", response.status, errorText);
      setStatus(`Invalid token (${response.status}). Check console.`, "error");
      return;
    }
  } catch (error) {
    console.error("Connection failed:", error);
    setStatus("Failed to connect to server.", "error");
    return;
  }

  await chrome.storage.local.set({ rewayToken: token, rewayBaseUrl: baseUrl });
  setStatus("Connected successfully!");

  // Switch to main interface after successful connection
  showMainInterface();
  loadGroups();
}

function renderGroups(groups) {
  elements.groupMenu.innerHTML = "";
  const groupOptions = [{ id: "", name: "No group", icon: null }, ...groups];

  groupOptions.forEach((group) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "select-option";
    option.dataset.id = group.id || "";

    // Add group name only (no icon)
    const textSpan = document.createElement("span");
    textSpan.className = "select-option-text";
    textSpan.textContent = group.name;
    option.appendChild(textSpan);

    option.addEventListener("click", () => {
      setSelectedGroup(group, { manual: true });
      closeGroupMenu();
    });
    elements.groupMenu.appendChild(option);
  });

  if (!hasManualGroupSelection) {
    const current = groupOptions.find((group) => group.id === selectedGroupId);
    setSelectedGroup(current || groupOptions[0]);
  }
}

async function loadGroups() {
  const settings = await getSettings();
  if (!settings.token) {
    return false;
  }

  try {
    const response = await fetch(`${settings.baseUrl}/api/extension/groups`, {
      headers: { Authorization: `Bearer ${settings.token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to load groups:", response.status, errorText);
      return false;
    }

    const data = await response.json();
    const groups = data.groups || [];
    renderGroups(groups);
    await chrome.storage.local.set({ rewayGroups: groups });
    return true;
  } catch {
    return false;
  }
}

async function fetchMeta() {
  const tab = await getActiveTab();
  if (!tab) return;

  elements.pageUrl.textContent = tab.url || "";
  elements.favicon.src = tab.favIconUrl || "";
  elements.title.value = tab.title || "";

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "getMeta" });
    if (response?.description) {
      elements.description.value = response.description;
    }
  } catch {
    // Content script may not be loaded, that's OK
  }
}

async function saveBookmark() {
  const settings = await getSettings();
  if (!settings.token) {
    setStatus("Add an access token first.", "error");
    return;
  }

  const tab = await getActiveTab();
  if (!tab?.url) return;

  const saveBtn = document.getElementById("save");
  const statusEl = document.getElementById("status");

  // Show loading state
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  statusEl.textContent = "";

  const payload = {
    url: tab.url,
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    groupId: selectedGroupId || null,
  };

  try {
    const response = await fetch(
      `${settings.baseUrl}/api/extension/bookmarks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save bookmark";
      setStatus("Failed to save. Check your token.", "error");
      return;
    }

    const data = await response.json();
    if (data?.bookmark) {
      try {
        const tabs = await chrome.tabs.query({
          url: `${settings.baseUrl}/*`,
        });
        await Promise.allSettled(
          tabs.map((tab) =>
            tab.id
              ? chrome.tabs.sendMessage(tab.id, {
                  type: "broadcastBookmark",
                  bookmark: data.bookmark,
                })
              : Promise.resolve(),
          ),
        );
      } catch {
        console.warn("Dashboard broadcast skipped:");
      }
    }

    // Show success state on button
    saveBtn.classList.add("success");
    saveBtn.textContent = "✓ Saved!";
    statusEl.textContent = "";

    // Close extension popup after brief success display
    setTimeout(() => {
      window.close();
    }, 800);
  } catch (error) {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save bookmark";
    setStatus("Network error. Check connection.", "error");
  }
}

function showAuthInterface() {
  elements.authSection.style.display = "block";
  elements.mainSection.style.display = "none";
}

function showMainInterface() {
  elements.authSection.style.display = "none";
  elements.mainSection.style.display = "block";
}

async function init() {
  const settings = await getSettings();
  elements.token.value = settings.token;
  elements.baseUrl.value = settings.baseUrl;
  elements.dashboardLink.href = `${settings.baseUrl}/dashboard`;

  if (settings.groups.length > 0) {
    renderGroups(settings.groups);
  }

  // Check if user has valid token
  if (settings.token) {
    showMainInterface();
    fetchMeta();
    loadGroups();
  } else {
    showAuthInterface();
  }

  // Show UI after initialization
  document.querySelector(".shell").style.opacity = "1";
}

// Event listeners
if (elements.saveSettings) {
  elements.saveSettings.addEventListener("click", saveSettings);
}

if (elements.save) {
  elements.save.addEventListener("click", saveBookmark);
}

if (elements.groupTrigger) {
  elements.groupTrigger.addEventListener("click", toggleGroupMenu);
}

document.addEventListener("click", (event) => {
  if (!elements.groupSelect.contains(event.target)) {
    closeGroupMenu();
  }
});

if (elements.token) {
  elements.token.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveSettings();
    }
  });
}

if (elements.linksGroupName && elements.linksGroupCharCount) {
  elements.linksGroupName.addEventListener("input", () => {
    updateCharCount(elements.linksGroupName, elements.linksGroupCharCount);
  });
}

if (elements.sessionName && elements.sessionCharCount) {
  elements.sessionName.addEventListener("input", () => {
    updateCharCount(elements.sessionName, elements.sessionCharCount);
  });
}

// ============================================
// Tab Navigation
// ============================================
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.dataset.tab;

    // Update active states
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(`tab-${targetTab}`).classList.add("active");

    // Initialize tab-specific content
    if (targetTab === "links") {
      loadGrabbedLinks();
    } else if (targetTab === "session") {
      loadTabSession();
    }
  });
});

// ============================================
// Save Links Tab
// ============================================
const createGroupFromLinksBtn = document.getElementById(
  "create-group-from-links",
);
const addManualLinkBtn = document.getElementById("add-manual-link");
const manualLinkInput = document.getElementById("links-manual-url");

if (createGroupFromLinksBtn) {
  createGroupFromLinksBtn.addEventListener("click", createGroupFromLinks);
}

if (addManualLinkBtn && manualLinkInput) {
  addManualLinkBtn.addEventListener("click", async () => {
    const value = manualLinkInput.value.trim();
    if (!value) return;

    // Clear previous error state
    manualLinkInput.classList.remove("error");
    manualLinkInput.placeholder = "https://example.com";

    let parsedUrl = value;
    if (!/^https?:\/\//i.test(parsedUrl)) {
      parsedUrl = `https://${parsedUrl}`;
    }

    try {
      const url = new URL(parsedUrl);

      // Show loading state
      addManualLinkBtn.disabled = true;
      manualLinkInput.disabled = true;

      const response = await chrome.runtime.sendMessage({
        type: "addGrabbedLink",
        url: url.toString(),
        title: null, // Let background fetch metadata
        source: "manual",
      });

      // Re-enable inputs
      addManualLinkBtn.disabled = false;
      manualLinkInput.disabled = false;

      if (
        response &&
        response.success === false &&
        response.reason === "duplicate"
      ) {
        // Show duplicate error
        manualLinkInput.classList.add("error");
        manualLinkInput.placeholder = "⚠️ Link already added";
        manualLinkInput.value = "";

        // Clear error after 3 seconds
        setTimeout(() => {
          manualLinkInput.classList.remove("error");
          manualLinkInput.placeholder = "https://example.com";
        }, 3000);
        return;
      }

      manualLinkInput.value = "";
      loadGrabbedLinks();
    } catch {
      // Re-enable inputs
      addManualLinkBtn.disabled = false;
      manualLinkInput.disabled = false;

      // Show invalid URL error
      manualLinkInput.classList.add("error");
      manualLinkInput.placeholder = "⚠️ Please enter a valid URL";
      manualLinkInput.value = "";

      // Clear error after 3 seconds
      setTimeout(() => {
        manualLinkInput.classList.remove("error");
        manualLinkInput.placeholder = "https://example.com";
      }, 3000);
    }
  });

  manualLinkInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addManualLinkBtn.click();
    }
  });
}

async function loadGrabbedLinks() {
  const listContainer = document.getElementById("grabbed-links-list");
  const emptyState = document.getElementById("links-empty");
  const countEl = document.getElementById("links-count");

  const response = await chrome.runtime.sendMessage({
    type: "getGrabbedLinks",
  });

  const links = response?.links || [];

  if (countEl) {
    countEl.textContent = `${links.length} links`;
  }

  const groupNameInput = document.getElementById("links-group-name");
  const createBtn = document.getElementById("create-group-from-links");

  if (links.length === 0) {
    emptyState.style.display = "block";
    // Disable input and button in empty state
    if (groupNameInput) groupNameInput.disabled = true;
    if (createBtn) createBtn.disabled = true;
    // Remove only link items, not empty state
    const items = listContainer.querySelectorAll(".session-tab-item");
    items.forEach((item) => item.remove());
    return;
  }

  emptyState.style.display = "none";
  // Enable input and button when links exist
  if (groupNameInput) groupNameInput.disabled = false;
  if (createBtn) createBtn.disabled = false;

  // Remove only link items, not empty state
  const items = listContainer.querySelectorAll(".session-tab-item");
  items.forEach((item) => item.remove());

  links.forEach((link) => {
    const item = document.createElement("div");
    item.className = "session-tab-item";
    item.dataset.url = link.url;

    const favicon = document.createElement("img");
    favicon.className = "session-tab-favicon";
    favicon.src = link.favIconUrl || "icons/icon16.png";
    favicon.onerror = () => {
      favicon.src = "icons/icon16.png";
    };

    const title = document.createElement("div");
    title.className = "session-tab-title";
    title.textContent = link.url;

    const removeBtn = document.createElement("button");
    removeBtn.className = "session-tab-remove";
    removeBtn.type = "button";
    removeBtn.setAttribute("aria-label", "Remove link");
    removeBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    removeBtn.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({
        type: "removeGrabbedLink",
        url: link.url,
      });
      loadGrabbedLinks();
    });

    item.appendChild(favicon);
    item.appendChild(title);
    item.appendChild(removeBtn);
    listContainer.appendChild(item);
  });
}

async function createGroupFromLinks() {
  const nameInput = document.getElementById("links-group-name");
  const createBtn = document.getElementById("create-group-from-links");
  const statusEl = document.getElementById("links-status");
  const groupName = nameInput.value.trim();

  // Clear previous status
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.dataset.tone = "";
  }

  // Check authentication
  const settings = await getSettings();
  if (!settings.token) {
    if (statusEl) {
      statusEl.textContent = "Add an access token first.";
      statusEl.dataset.tone = "error";
    }
    return;
  }

  if (!groupName) {
    if (statusEl) {
      statusEl.textContent = "Please enter a group name";
      statusEl.dataset.tone = "error";
    }
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: "getGrabbedLinks",
  });

  const links = response?.links || [];

  if (links.length === 0) {
    if (statusEl) {
      statusEl.textContent = "No links to create group from";
      statusEl.dataset.tone = "error";
    }
    return;
  }

  const selectedLinks = links.map((link) => ({
    url: link.url,
    title: link.title || link.url,
  }));

  // Show loading state
  createBtn.disabled = true;
  createBtn.textContent = "Saving...";
  if (statusEl) statusEl.textContent = "";

  try {
    // Create group
    const groupResponse = await fetch(
      `${settings.baseUrl}/api/extension/groups`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.token}`,
        },
        body: JSON.stringify({ name: groupName }),
      },
    );

    if (!groupResponse.ok) {
      throw new Error("Failed to create group");
    }

    const groupData = await groupResponse.json();
    const groupId = groupData.group.id;

    // Create bookmarks in batch
    const bookmarkPromises = selectedLinks.map((link) =>
      fetch(`${settings.baseUrl}/api/extension/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.token}`,
        },
        body: JSON.stringify({
          url: link.url,
          title: link.title,
          groupId,
        }),
      }),
    );

    await Promise.all(bookmarkPromises);

    // Clear saved links
    await chrome.runtime.sendMessage({ type: "clearGrabbedLinks" });

    // Show success state on button
    createBtn.classList.add("success");
    createBtn.textContent = "✓ Saved!";
    if (statusEl) statusEl.textContent = "";

    // Clear input
    nameInput.value = "";
    updateCharCount(elements.linksGroupName, elements.linksGroupCharCount);
    loadGrabbedLinks();

    // Close popup after brief success display
    setTimeout(() => {
      window.close();
    }, 800);
  } catch (error) {
    createBtn.disabled = false;
    createBtn.textContent = "Save as Group";
    console.error("Failed to create group:", error);
    if (statusEl) {
      statusEl.textContent = "Failed to create group. Check your connection.";
      statusEl.dataset.tone = "error";
    }
  }
}

// ============================================
// Tab Session Tab
// ============================================
const saveSessionBtn = document.getElementById("save-session");

if (saveSessionBtn) {
  saveSessionBtn.addEventListener("click", saveTabSession);
}

async function loadTabSession() {
  const tabCountEl = document.getElementById("tab-count");
  const sessionPreview = document.getElementById("session-preview");
  const emptyState = document.getElementById("session-empty");

  try {
    // Get tabs only from the window that owns the popup
    const currentWindow = await chrome.windows.getCurrent({ populate: true });
    const tabs = currentWindow?.tabs || [];

    // Filter out extension, system tabs, and dashboard URLs
    const validTabs = tabs.filter(
      (tab) =>
        tab.url &&
        !tab.url.startsWith("chrome://") &&
        !tab.url.startsWith("chrome-extension://") &&
        !tab.url.startsWith("edge://") &&
        !tab.url.startsWith("about:") &&
        !isDashboardUrl(tab.url),
    );

    tabCountEl.textContent = `${validTabs.length} tabs`;

    // Remove existing tab items
    const items = sessionPreview.querySelectorAll(".session-tab-item");
    items.forEach((item) => item.remove());

    const sessionNameInput = document.getElementById("session-name");
    const saveBtn = document.getElementById("save-session");

    if (validTabs.length === 0) {
      emptyState.style.display = "block";
      // Disable input and button in empty state
      if (sessionNameInput) sessionNameInput.disabled = true;
      if (saveBtn) saveBtn.disabled = true;
      return;
    }

    emptyState.style.display = "none";
    // Enable input and button when tabs exist
    if (sessionNameInput) sessionNameInput.disabled = false;
    if (saveBtn) saveBtn.disabled = false;

    validTabs.forEach((tab) => {
      const item = document.createElement("div");
      item.className = "session-tab-item";
      item.dataset.tabId = tab.id;
      item.dataset.url = tab.url;
      item.dataset.title = tab.title || tab.url;

      const favicon = document.createElement("img");
      favicon.className = "session-tab-favicon";
      favicon.src = tab.favIconUrl || "icons/icon16.png";
      favicon.onerror = () => {
        favicon.src = "icons/icon16.png";
      };

      const title = document.createElement("div");
      title.className = "session-tab-title";
      title.textContent = tab.title || tab.url;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "session-tab-checkbox";
      checkbox.checked = true; // All selected by default

      item.appendChild(favicon);
      item.appendChild(title);
      item.appendChild(checkbox);
      sessionPreview.appendChild(item);
    });
  } catch (error) {
    console.error("Failed to load tabs:", error);
    tabCountEl.textContent = "Error loading tabs";
  }
}

function isDashboardUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Check for reway.vercel.app/dashboard
    if (hostname === "reway.vercel.app" && pathname.startsWith("/dashboard")) {
      return true;
    }

    // Check for localhost:*/dashboard (any port)
    if (
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      pathname.startsWith("/dashboard")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function saveTabSession() {
  const sessionNameInput = document.getElementById("session-name");
  const saveSessionBtn = document.getElementById("save-session");
  const statusEl = document.getElementById("session-status");
  const sessionPreview = document.getElementById("session-preview");

  // Clear previous status
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.dataset.tone = "";
  }

  // Check authentication
  const settings = await getSettings();
  if (!settings.token) {
    statusEl.textContent = "Add an access token first.";
    statusEl.dataset.tone = "error";
    return;
  }

  const sessionName = sessionNameInput.value.trim();

  if (!sessionName) {
    statusEl.textContent = "Please enter a session name";
    statusEl.dataset.tone = "error";
    return;
  }

  // Get selected tabs
  const tabItems = sessionPreview.querySelectorAll(".session-tab-item");
  const selectedTabs = Array.from(tabItems)
    .filter((item) => item.querySelector(".session-tab-checkbox").checked)
    .map((item) => ({
      url: item.dataset.url,
      title: item.dataset.title,
    }));

  if (selectedTabs.length === 0) {
    statusEl.textContent = "Please select at least one tab";
    statusEl.dataset.tone = "error";
    return;
  }

  // Show loading state
  saveSessionBtn.disabled = true;
  saveSessionBtn.textContent = "Saving...";
  statusEl.textContent = "";

  try {
    // Create group
    const groupResponse = await fetch(
      `${settings.baseUrl}/api/extension/groups`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.token}`,
        },
        body: JSON.stringify({ name: sessionName }),
      },
    );

    if (!groupResponse.ok) {
      throw new Error("Failed to create group");
    }

    const groupData = await groupResponse.json();
    const groupId = groupData.group.id;

    // Create bookmarks in batch
    const bookmarkPromises = selectedTabs.map((tab) =>
      fetch(`${settings.baseUrl}/api/extension/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.token}`,
        },
        body: JSON.stringify({
          url: tab.url,
          title: tab.title,
          groupId,
        }),
      }),
    );

    await Promise.all(bookmarkPromises);

    // Show success state on button
    saveSessionBtn.classList.add("success");
    saveSessionBtn.textContent = "✓ Saved!";
    statusEl.textContent = "";

    // Clear input
    sessionNameInput.value = "";
    updateCharCount(elements.sessionName, elements.sessionCharCount);

    // Close popup after brief success display
    setTimeout(() => {
      window.close();
    }, 800);
  } catch (error) {
    console.error("Failed to save session:", error);
    statusEl.textContent = "Failed to save session. Check your connection.";
    statusEl.dataset.tone = "error";

    // Reset button state on error
    saveSessionBtn.disabled = false;
    saveSessionBtn.textContent = "Save Session";
  }
}

init();
