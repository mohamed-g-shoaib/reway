const DEFAULT_BASE_URL = "https://reway.vercel.app";

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

// ============================================
// Link Grab Storage Manager
// ============================================

function getGrabbedStorageArea() {
  return chrome.storage.session || chrome.storage.local;
}

async function getGrabbedLinks() {
  const storage = getGrabbedStorageArea();
  const { grabbedLinks } = await storage.get(["grabbedLinks"]);
  return Array.isArray(grabbedLinks) ? grabbedLinks : [];
}

async function addGrabbedLink(
  url,
  title,
  source = "manual",
  favIconUrl = null,
) {
  const links = await getGrabbedLinks();

  // Check for duplicates
  const exists = links.some((link) => link.url === url);
  if (exists) {
    return { success: false, reason: "duplicate" };
  }

  // Fetch metadata for manual links
  let fetchedTitle = title;
  let fetchedFavIcon = favIconUrl;

  if (source === "manual" && !title) {
    try {
      const metadata = await fetchPageMetadata(url);
      fetchedTitle = metadata.title || new URL(url).hostname;
      fetchedFavIcon = metadata.favicon || null;
    } catch (error) {
      console.warn("Failed to fetch metadata:", error);
      fetchedTitle = new URL(url).hostname;
    }
  }

  const newLink = {
    url,
    title: fetchedTitle || url,
    source,
    favIconUrl: fetchedFavIcon,
    timestamp: new Date().toISOString(),
  };

  links.unshift(newLink); // Add to beginning
  const storage = getGrabbedStorageArea();
  await storage.set({ grabbedLinks: links });

  // Update badge
  await updateGrabbedLinksBadge(links.length);

  return { success: true, link: newLink };
}

async function removeGrabbedLink(url) {
  const links = await getGrabbedLinks();
  const filtered = links.filter((link) => link.url !== url);
  const storage = getGrabbedStorageArea();
  await storage.set({ grabbedLinks: filtered });
  await updateGrabbedLinksBadge(filtered.length);
  return { success: true, count: filtered.length };
}

async function clearGrabbedLinks() {
  const storage = getGrabbedStorageArea();
  await storage.set({ grabbedLinks: [] });
  await updateGrabbedLinksBadge(0);
  return { success: true };
}

async function captureCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.url) {
    return { success: false, reason: "no-tab" };
  }

  return addGrabbedLink(
    tab.url,
    tab.title || tab.url,
    "current-tab",
    tab.favIconUrl,
  );
}

async function updateGrabbedLinksBadge() {
  // Badge disabled - no visual indicator needed
  // if (count > 0) {
  //   await chrome.action.setBadgeText({ text: String(count) });
  //   await chrome.action.setBadgeBackgroundColor({ color: "#18181b" });
  // } else {
  //   await chrome.action.setBadgeText({ text: "" });
  // }
}

// Fetch page metadata (title and favicon)
async function fetchPageMetadata(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch page");
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract favicon (try multiple common patterns)
    let favicon = null;
    const faviconPatterns = [
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
    ];

    for (const pattern of faviconPatterns) {
      const match = html.match(pattern);
      if (match) {
        favicon = new URL(match[1], url).href;
        break;
      }
    }

    // Fallback to default favicon location
    if (!favicon) {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    }

    return { title, favicon };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return { title: null, favicon: null };
  }
}

// Listen for messages from web pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "checkExtension") {
    sendResponse({ installed: true, extensionId: chrome.runtime.id });
    return;
  }

  // ============================================
  // Link Grab Message Handlers
  // ============================================

  if (message?.type === "getGrabbedLinks") {
    (async () => {
      const links = await getGrabbedLinks();
      sendResponse({ success: true, links });
    })();
    return true;
  }

  if (message?.type === "addGrabbedLink") {
    (async () => {
      const result = await addGrabbedLink(
        message.url,
        message.title,
        message.source,
      );
      sendResponse(result);
    })();
    return true;
  }

  if (message?.type === "removeGrabbedLink") {
    (async () => {
      const result = await removeGrabbedLink(message.url);
      sendResponse(result);
    })();
    return true;
  }

  if (message?.type === "clearGrabbedLinks") {
    (async () => {
      const result = await clearGrabbedLinks();
      sendResponse(result);
    })();
    return true;
  }

  if (message?.type === "captureCurrentTab") {
    (async () => {
      const result = await captureCurrentTab();
      sendResponse(result);
    })();
    return true;
  }

  // Twitter bookmark handler
  if (message?.type === "twitterBookmark") {
    console.log("Received Twitter bookmark message:", message);

    (async () => {
      try {
        const settings = await getSettings();
        console.log("Settings retrieved:", {
          hasToken: !!settings.token,
          baseUrl: settings.baseUrl,
        });

        if (!settings.token) {
          console.error("Not authenticated - no token");
          sendResponse({ success: false, error: "Not authenticated" });
          return;
        }

        // Check if "X Bookmarks" group exists, create if not
        console.log("Fetching groups...");
        const groupsResponse = await fetch(
          `${settings.baseUrl}/api/extension/groups`,
          {
            headers: { Authorization: `Bearer ${settings.token}` },
          },
        );

        if (!groupsResponse.ok) {
          console.error("Failed to fetch groups:", groupsResponse.status);
          throw new Error("Failed to fetch groups");
        }

        const groupsData = await groupsResponse.json();
        console.log("Groups fetched:", groupsData);

        const { xBookmarksGroupId } = await chrome.storage.local.get([
          "xBookmarksGroupId",
        ]);

        let xBookmarksGroup = xBookmarksGroupId
          ? groupsData.groups?.find((g) => g.id === xBookmarksGroupId)
          : null;

        if (!xBookmarksGroup) {
          xBookmarksGroup = groupsData.groups?.find(
            (g) => g.name === "X Bookmarks",
          );
          if (xBookmarksGroup) {
            await chrome.storage.local.set({
              xBookmarksGroupId: xBookmarksGroup.id,
            });
          }
        }

        console.log("X Bookmarks group exists:", !!xBookmarksGroup);

        // Create group if it doesn't exist
        if (!xBookmarksGroup) {
          console.log("Creating X Bookmarks group...");
          const createGroupResponse = await fetch(
            `${settings.baseUrl}/api/extension/groups`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.token}`,
              },
              body: JSON.stringify({ name: "X Bookmarks", icon: "twitter" }),
            },
          );

          if (!createGroupResponse.ok) {
            console.error(
              "Failed to create X Bookmarks group:",
              createGroupResponse.status,
            );
            throw new Error("Failed to create X Bookmarks group");
          }

          const createGroupData = await createGroupResponse.json();
          console.log("X Bookmarks group created:", createGroupData);
          xBookmarksGroup = createGroupData.group;
          await chrome.storage.local.set({
            xBookmarksGroupId: xBookmarksGroup.id,
          });
        }

        // Create bookmark
        const bookmarkTitle =
          message.title?.trim() || message.description?.trim() || message.url;
        const bookmarkDescription = message.description?.trim() || "";
        const bookmarkFavicon = message.faviconUrl?.trim() || null;

        console.log("Creating bookmark with:", {
          url: message.url,
          title: bookmarkTitle.substring(0, 100),
          groupId: xBookmarksGroup.id,
        });

        const bookmarkResponse = await fetch(
          `${settings.baseUrl}/api/extension/bookmarks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${settings.token}`,
            },
            body: JSON.stringify({
              url: message.url,
              title: bookmarkTitle,
              description: bookmarkDescription,
              faviconUrl: bookmarkFavicon,
              groupId: xBookmarksGroup.id,
            }),
          },
        );

        if (!bookmarkResponse.ok) {
          console.error(
            "Failed to create bookmark:",
            bookmarkResponse.status,
            await bookmarkResponse.text(),
          );
          throw new Error("Failed to create bookmark");
        }

        const bookmarkData = await bookmarkResponse.json();
        console.log("Bookmark created successfully:", bookmarkData);

        sendResponse({ success: true });
      } catch (error) {
        console.error("Twitter bookmark failed:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (message?.type === "openGroup") {
    (async () => {
      try {
        const directUrls = Array.isArray(message.urls)
          ? message.urls.filter(Boolean)
          : [];

        if (directUrls.length > 0) {
          await Promise.all(
            directUrls.map((url) => chrome.tabs.create({ url, active: false })),
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
