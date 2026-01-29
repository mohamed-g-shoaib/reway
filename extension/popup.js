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
  } catch (error) {
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
  } catch (error) {
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

  setStatus("Saving...");

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
      } catch (error) {
        console.warn("Dashboard broadcast skipped:", error);
      }
    }

    setStatus("Saved to Reway!");
    // Close extension popup after save
    setTimeout(() => {
      window.close();
    }, 1000);
  } catch (error) {
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

init();
