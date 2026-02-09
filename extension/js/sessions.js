import { apiFetch } from "./api.js";
import { setStatus, setLoading } from "./ui.js";
import { isDashboardUrl } from "./config.js";

export async function loadTabSession() {
  const tabCountEl = document.getElementById("tab-count");
  const sessionPreview = document.getElementById("session-preview");
  const emptyState = document.getElementById("session-empty");
  const sessionNameInput = document.getElementById("session-name");
  const saveBtn = document.getElementById("save-session");

  try {
    const currentWindow = await chrome.windows.getCurrent({ populate: true });
    const tabs = currentWindow?.tabs || [];
    const { rewayBaseUrl } = await chrome.storage.local.get("rewayBaseUrl");

    const validTabs = tabs.filter(
      (tab) =>
        tab.url &&
        !tab.url.startsWith("chrome://") &&
        !tab.url.startsWith("chrome-extension://") &&
        !isDashboardUrl(tab.url, rewayBaseUrl),
    );

    tabCountEl.textContent = `${validTabs.length} tabs`;
    sessionPreview
      .querySelectorAll(".session-tab-item")
      .forEach((item) => item.remove());

    if (validTabs.length === 0) {
      emptyState.style.display = "block";
      sessionNameInput.disabled = true;
      saveBtn.disabled = true;
      return;
    }

    emptyState.style.display = "none";
    sessionNameInput.disabled = false;
    saveBtn.disabled = false;

    validTabs.forEach((tab) => {
      const item = document.createElement("div");
      item.className = "session-tab-item";
      item.innerHTML = `
        <input type="checkbox" class="session-tab-checkbox" data-id="${tab.id}" checked>
        <img class="session-tab-favicon" src="${tab.favIconUrl || "icons/icon16.png"}" onerror="this.src='icons/icon16.png'">
        <div class="session-tab-title">${tab.title || tab.url}</div>
      `;
      sessionPreview.appendChild(item);
    });
  } catch (error) {
    console.error("Failed to load session:", error);
  }
}

export async function saveTabSession() {
  const nameInput = document.getElementById("session-name");
  const saveBtn = document.getElementById("save-session");
  const sessionName = nameInput.value.trim();

  if (!sessionName) {
    setStatus(
      "Please enter a session name",
      "error",
      document.getElementById("session-status"),
    );
    return;
  }

  setLoading(saveBtn, true, "Saving...");

  try {
    const currentWindow = await chrome.windows.getCurrent({ populate: true });
    const { rewayBaseUrl } = await chrome.storage.local.get("rewayBaseUrl");
    const validTabs = currentWindow.tabs.filter(
      (tab) =>
        tab.url &&
        !tab.url.startsWith("chrome-") &&
        !isDashboardUrl(tab.url, rewayBaseUrl),
    );

    const checkedTabIds = Array.from(
      document.querySelectorAll(".session-tab-checkbox:checked"),
    ).map((cb) => parseInt(cb.dataset.id));

    const selectedTabs = validTabs.filter((tab) =>
      checkedTabIds.includes(tab.id),
    );

    if (selectedTabs.length === 0) {
      setLoading(saveBtn, false, "Save Session");
      setStatus(
        "No tabs selected",
        "error",
        document.getElementById("session-status"),
      );
      return;
    }

    const groupData = await apiFetch("/api/extension/groups", {
      method: "POST",
      body: JSON.stringify({ name: sessionName }),
    });

    const groupId = groupData.group.id;
    await Promise.all(
      selectedTabs.map((tab) =>
        apiFetch("/api/extension/bookmarks", {
          method: "POST",
          body: JSON.stringify({
            url: tab.url,
            title: tab.title || tab.url,
            groupId,
          }),
        }),
      ),
    );

    saveBtn.classList.add("success");
    setLoading(saveBtn, false, "✓ Saved!");
    setTimeout(() => window.close(), 800);
  } catch (err) {
    setLoading(saveBtn, false, "Save Session");

    let message = "Failed to save session";
    if (err.status === 409) {
      message = "⚠️ Session name already exists";
    }

    setStatus(message, "error", document.getElementById("session-status"));
  }
}
