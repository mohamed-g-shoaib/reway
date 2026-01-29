const DEFAULT_BASE_URL = "http://localhost:3000";

const selectors = {
  title: "#title",
  description: "#description",
  group: "#group",
  save: "#save",
  status: "#status",
  favicon: "#favicon",
  pageUrl: "#page-url",
  token: "#token",
  baseUrl: "#base-url",
  saveSettings: "#save-settings",
  dashboardLink: "#dashboard-link",
  openGroup: "#open-group",
};

const elements = Object.fromEntries(
  Object.entries(selectors).map(([key, selector]) => [
    key,
    document.querySelector(selector),
  ]),
);

function setStatus(text, tone = "") {
  if (!elements.status) return;
  elements.status.textContent = text;
  elements.status.dataset.tone = tone;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

async function getSettings() {
  const { rewayToken, rewayBaseUrl } = await chrome.storage.local.get([
    "rewayToken",
    "rewayBaseUrl",
  ]);

  return {
    token: rewayToken || "",
    baseUrl: rewayBaseUrl || DEFAULT_BASE_URL,
  };
}

async function saveSettings() {
  const token = elements.token.value.trim();
  const baseUrl = elements.baseUrl.value.trim() || DEFAULT_BASE_URL;
  await chrome.storage.local.set({ rewayToken: token, rewayBaseUrl: baseUrl });
  setStatus("Settings saved.");
}

async function loadGroups() {
  const settings = await getSettings();
  if (!settings.token) {
    elements.group.innerHTML = "<option value=\"\">No token</option>";
    return;
  }

  const response = await fetch(`${settings.baseUrl}/api/extension/groups`, {
    headers: { Authorization: `Bearer ${settings.token}` },
  });

  if (!response.ok) {
    elements.group.innerHTML = "<option value=\"\">Failed to load</option>";
    return;
  }

  const data = await response.json();
  const groups = data.groups || [];
  const options = [
    '<option value="">No group</option>',
    '<option value="all">All bookmarks</option>',
    ...groups.map(
      (group) =>
        `<option value="${group.id}">${group.name}</option>`,
    ),
  ];
  elements.group.innerHTML = options.join("");
}

async function fetchMeta() {
  const tab = await getActiveTab();
  if (!tab) return;

  elements.pageUrl.textContent = tab.url || "";
  elements.favicon.src = tab.favIconUrl || "";
  elements.title.value = tab.title || "";

  const response = await chrome.tabs.sendMessage(tab.id, { type: "getMeta" });
  if (response?.description) {
    elements.description.value = response.description;
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
    groupId: elements.group.value || null,
  };

  const response = await fetch(`${settings.baseUrl}/api/extension/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    setStatus("Failed to save. Check token.", "error");
    return;
  }

  setStatus("Saved to Reway.");
}

async function openGroup() {
  const groupId = elements.group.value || null;
  const response = await chrome.runtime.sendMessage({
    type: "openGroup",
    groupId,
  });

  if (!response?.ok) {
    setStatus(response?.error || "Failed to open group", "error");
    return;
  }

  setStatus(`Opened ${response.count || 0} tabs.`);
}

async function init() {
  const settings = await getSettings();
  elements.token.value = settings.token;
  elements.baseUrl.value = settings.baseUrl;
  elements.dashboardLink.href = `${settings.baseUrl}/dashboard`;

  await fetchMeta();
  await loadGroups();
}

if (elements.saveSettings) {
  elements.saveSettings.addEventListener("click", saveSettings);
}

if (elements.save) {
  elements.save.addEventListener("click", saveBookmark);
}

if (elements.openGroup) {
  elements.openGroup.addEventListener("click", openGroup);
}

init();
