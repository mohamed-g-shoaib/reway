import { apiFetch } from "./api.js";
import { setStatus, setLoading } from "./ui.js";

export async function loadGrabbedLinks() {
  const listContainer = document.getElementById("grabbed-links-list");
  const emptyState = document.getElementById("links-empty");
  const countEl = document.getElementById("links-count");

  let links = [];
  try {
    const response = await chrome.runtime.sendMessage({
      type: "getGrabbedLinks",
    });
    links = response?.links || [];
  } catch (err) {
    console.warn("Could not fetch grabbed links:", err);
  }

  if (countEl) countEl.textContent = `${links.length} links`;

  const groupNameInput = document.getElementById("links-group-name");
  const createBtn = document.getElementById("create-group-from-links");

  if (links.length === 0) {
    emptyState.style.display = "block";
    if (groupNameInput) groupNameInput.disabled = true;
    if (createBtn) createBtn.disabled = true;
    listContainer
      .querySelectorAll(".session-tab-item")
      .forEach((item) => item.remove());
    return;
  }

  emptyState.style.display = "none";
  if (groupNameInput) groupNameInput.disabled = false;
  if (createBtn) createBtn.disabled = false;

  listContainer
    .querySelectorAll(".session-tab-item")
    .forEach((item) => item.remove());

  links.forEach((link) => {
    const item = document.createElement("div");
    item.className = "session-tab-item";

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
    removeBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';
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

export async function createGroupFromLinks() {
  const nameInput = document.getElementById("links-group-name");
  const createBtn = document.getElementById("create-group-from-links");
  const groupName = nameInput.value.trim();

  if (!groupName) {
    setStatus(
      "Please enter a group name",
      "error",
      document.getElementById("links-status"),
    );
    return;
  }

  const { links } = await chrome.runtime.sendMessage({
    type: "getGrabbedLinks",
  });
  if (!links?.length) return;

  setLoading(createBtn, true, "Saving...");

  try {
    const groupData = await apiFetch("/api/extension/groups", {
      method: "POST",
      body: JSON.stringify({ name: groupName }),
    });

    const groupId = groupData.group.id;
    const promises = links.map((link) =>
      apiFetch("/api/extension/bookmarks", {
        method: "POST",
        body: JSON.stringify({
          url: link.url,
          title: link.title || link.url,
          groupId,
        }),
      }),
    );

    await Promise.all(promises);
    await chrome.runtime.sendMessage({ type: "clearGrabbedLinks" });

    createBtn.classList.add("success");
    setLoading(createBtn, false, "✓ Saved!");
    setTimeout(() => window.close(), 800);
  } catch (err) {
    setLoading(createBtn, false, "Save as Group");

    let message = "Failed to create group";
    if (err.status === 409) {
      message = "⚠️ Group name already exists";
    }

    setStatus(message, "error", document.getElementById("links-status"));
  }
}
