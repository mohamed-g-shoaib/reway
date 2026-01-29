const DEFAULT_BASE_URL = "http://localhost:3000";

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

// Listen for messages from web pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "checkExtension") {
    sendResponse({ installed: true, extensionId: chrome.runtime.id });
    return;
  }

  if (message?.type === "openGroup") {
    (async () => {
      try {
        const directUrls = Array.isArray(message.urls)
          ? message.urls.filter(Boolean)
          : [];

        if (directUrls.length > 0) {
          await Promise.all(
            directUrls.map((url) =>
              chrome.tabs.create({ url, active: false }),
            ),
          );
          sendResponse({ ok: true, count: directUrls.length });
          return;
        }

        const settings = await getSettings();
        if (!settings.token) {
          throw new Error("No access token configured");
        }

        const url = new URL(`${settings.baseUrl}/api/extension/bookmarks`);
        if (message.groupId) {
          url.searchParams.set("groupId", message.groupId);
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${settings.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const data = await response.json();
        const bookmarks = data.bookmarks || [];

        await Promise.all(
          bookmarks
            .map((bookmark) => bookmark.url)
            .filter(Boolean)
            .map((url) => chrome.tabs.create({ url, active: false })),
        );

        sendResponse({ ok: true, count: bookmarks.length });
      } catch (error) {
        console.error("Open group failed:", error);
        sendResponse({ ok: false, error: error?.message || "Failed" });
      }
    })();
    return true;
  }
});

// Respond to external messages from web pages
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (message?.type === "checkExtension") {
      sendResponse({ installed: true, extensionId: chrome.runtime.id });
    }
  },
);
