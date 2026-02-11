## Extension audit kickoff: flow map + immediate high-risk flags

I’ve read your 4 extension skill docs and mapped the extension entry points in this repo. Below is the **flow-aware architecture map** (what calls what, what data crosses boundaries), followed by **the first critical issues** I can already see from this map.

---

# 1) Extension flow map (end-to-end)

## A) Manifest / permissions / execution surfaces

- **Manifest**: [extension/manifest.json](cci:7://file:///d:/Developer/reway/extension/manifest.json:0:0-0:0)
  - **MV3** with `background.service_worker = background.js` (module)
  - **Permissions**:
    - `tabs`, `activeTab`, `scripting`, `storage`
  - **host_permissions**:
    - `https://reway-app.vercel.app/*`
    - `http://localhost:3000/*`
    - `http://localhost:3001/*`
  - **content_scripts**:
    - [content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0) on your own site:
      - `https://reway-app.vercel.app/*`, `http://localhost:3000/*`, `http://localhost:3001/*`
    - [twitter-content-script.js](cci:7://file:///d:/Developer/reway/extension/twitter-content-script.js:0:0-0:0) on:
      - `https://x.com/*`, `https://twitter.com/*`

## B) Popup UI → API → Dashboard broadcast

- **Popup UI**:
  - `extension/popup.html` loads [popup.js](cci:7://file:///d:/Developer/reway/extension/popup.js:0:0-0:0) as a module.
  - Tabs inside popup:
    - Save Page
    - Save Links
    - Tab Session

- **Popup runtime entry**: [extension/popup.js](cci:7://file:///d:/Developer/reway/extension/popup.js:0:0-0:0)
  - [init()](cci:1://file:///d:/Developer/reway/extension/popup.js:16:0-57:1):
    - reads settings from `chrome.storage.local` (dev base URL override)
    - “Auth check” by calling [apiFetch("/api/extension/groups")](cci:1://file:///d:/Developer/reway/extension/js/api.js:14:0-35:1)
      - success → stores `rewayGroups` → renders groups → show main section
      - failure → show auth section and login button
    - always calls [fetchMeta()](cci:1://file:///d:/Developer/reway/extension/popup.js:59:0-72:1)

  - **Metadata**:
    - [fetchMeta()](cci:1://file:///d:/Developer/reway/extension/popup.js:59:0-72:1) gets the active tab and then calls:
      - [fetchPageMeta(tab.id)](cci:1://file:///d:/Developer/reway/extension/js/metadata.js:27:0-41:1) from [extension/js/metadata.js](cci:7://file:///d:/Developer/reway/extension/js/metadata.js:0:0-0:0)
      - which uses `chrome.scripting.executeScript({ func: extractMetadata })`

  - **Saving bookmark**:
    - [saveBookmark()](cci:1://file:///d:/Developer/reway/extension/popup.js:74:0-117:1) → [apiFetch("/api/extension/bookmarks", {POST})](cci:1://file:///d:/Developer/reway/extension/js/api.js:14:0-35:1)
    - on success:
      - finds any open dashboard tabs `chrome.tabs.query({ url: baseUrl/* })`
      - broadcasts `bookmark` to those tabs using `chrome.tabs.sendMessage(... type: "broadcastBookmark")`
        - dashboard page listens via [extension/content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0) and forwards to the page via `window.postMessage({ type: "reway_broadcast_bookmark" ... })`

## C) Link grab flow (popup ↔ background worker)

- **Popup** (`grabber.js`):
  - reads “grabbed links” via:
    - `chrome.runtime.sendMessage({ type: "getGrabbedLinks" })`
  - writes via:
    - `chrome.runtime.sendMessage({ type: "removeGrabbedLink" | "clearGrabbedLinks" | "addGrabbedLink" })`

- **Background** ([background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)):
  - stores grabbed links in `chrome.storage.session || chrome.storage.local`
  - updates badge count via `chrome.action.setBadgeText(...)`

- **Create group from links**:
  - `createGroupFromLinks()`:
    - POST `/api/extension/groups` to create group
    - POST `/api/extension/bookmarks` for each link

## D) Tab session flow (popup → chrome.windows/tabs → API)

- **Session** (`sessions.js`)
  - reads current window tabs via `chrome.windows.getCurrent({ populate: true })`
  - filters out:
    - `chrome://`
    - `chrome-extension://`
    - dashboard URLs (via [isDashboardUrl()](cci:1://file:///d:/Developer/reway/extension/js/config.js:3:0-11:1))
  - allows selecting tabs and then:
    - creates a group via POST `/api/extension/groups`
    - creates bookmarks via POST `/api/extension/bookmarks`

## E) “Open group” flow (web app → extension → background → tabs)

- **Website page** sends `window.postMessage({ type: "reway_open_group", urls, groupId })`
- **Extension content script** ([content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0)) listens for that `window` message:
  - forwards it to background with `chrome.runtime.sendMessage({ type: "openGroup", groupId, urls })`
- **Background** ([background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)) handles `"openGroup"`:
  - If `urls` provided → opens them directly via `chrome.tabs.create`
  - Else fetches bookmarks from `/api/extension/bookmarks?groupId=...` and opens them

## F) Twitter/X auto-capture flow

- **twitter-content-script.js** runs on x.com/twitter.com
  - listens to click events, detects bookmark action, extracts tweet data
  - sends `chrome.runtime.sendMessage({ type: "twitterBookmark", ...payload })`
- **background.js** handles `"twitterBookmark"`:
  - fetches groups (no shared [apiFetch](cci:1://file:///d:/Developer/reway/extension/js/api.js:14:0-35:1) here; uses raw `fetch`)
  - ensures group “X Bookmarks” exists (stores its id in `chrome.storage.local`)
  - POSTs bookmark to `/api/extension/bookmarks`

---

# 2) Immediate violations / risks (from the docs)

## A) **CRITICAL: `<all_urls>` host permission**

- **File**: [extension/manifest.json](cci:7://file:///d:/Developer/reway/extension/manifest.json:0:0-0:0)
- **Why it matters**
  - Violates least-privilege guidance (both your extension skill docs and Chrome Web Store expectations).
  - Makes review harder; store rejection risk; user trust hit.
    **Likely fix**

- Remove `<all_urls>` from `host_permissions`.
- Add explicit host permissions only for:
  - `https://reway-app.vercel.app/*`
  - `http://localhost:3000/*` (dev-only while you iterate)
  - `http://localhost:3001/*` (dev-only while you iterate)
- For metadata extraction you **do not need** `<all_urls>` because you rely on `activeTab` + `chrome.scripting.executeScript()`.

**Status**: Fixed

- Removed `<all_urls>` and tightened `host_permissions` to explicit Reway + dev localhost origins:
  - [extension/manifest.json](cci:7://file:///d:/Developer/reway/extension/manifest.json:0:0-0:0)

## B) **CRITICAL: Unsafe tab opening without URL validation**

- **Files**:
  - [extension/content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0) (accepts window messages from page)
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0) (`openGroup` opens URLs directly)
- **Why it matters**
  - Any compromised page on your own domain (or an XSS) could request opening arbitrary URLs.
- **Fix direction**
  - Validate message origin more strictly:
    - only accept messages when `location.hostname` matches your `baseUrl` hostname
  - Validate URLs are `http:`/`https:` only before opening
  - Cap maximum number of URLs opened per request

**Status**: Fixed

- Added sender-origin validation (must match configured `baseUrl` origin), URL normalization, protocol restriction (`http:`/`https:` only), and a hard cap (25) on tab openings:
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)
  - [extension/content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0)

## C) **CRITICAL: Background fetches arbitrary URLs for metadata**

Previously, the background service worker fetched arbitrary URLs to derive metadata.

- **Why it matters**
  - With `<all_urls>` this becomes a general-purpose cross-origin fetcher.
  - Even without `<all_urls>`, it’s still risky / heavy for service worker lifecycle.
- **Fix direction**
  - Prefer:
    - metadata extraction via `scripting.executeScript` in the active tab (like you already do in popup)
    - or only fetch favicon via safe derivation (e.g., `new URL(url).origin + '/favicon.ico'`) without fetching full HTML
  - Add strict URL allowlist + timeout + size cap if you must fetch.

**Status**: Fixed

- Removed background cross-origin HTML fetching and replaced it with safe derivation (hostname + `origin/favicon.ico`) for manual links:
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)

## D) **HIGH: Inconsistent API calling / error handling**

- **Files**:
  - [extension/js/api.js](cci:7://file:///d:/Developer/reway/extension/js/api.js:0:0-0:0) ([apiFetch](cci:1://file:///d:/Developer/reway/extension/js/api.js:14:0-35:1))
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0) (Twitter flow uses raw `fetch` without clearing groups / consistent error paths)
- **Fix direction**
  - Consolidate background API calls to a shared helper with:
    - consistent JSON parsing
    - consistent 401 handling
    - timeouts
    - structured error responses to caller

**Status**: Partially fixed

- `openGroup` is now validated/normalized.
- Twitter flow still uses raw `fetch` and should be consolidated onto a shared helper with consistent 401 handling and timeouts:
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)

## E) **MEDIUM: Content script posts messages with `targetOrigin="*"`**

- **File**: [extension/content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0)
- **Why it matters**
  - On your own domain this is probably fine, but still a best-practice violation.
- **Fix direction**
  - Post to `window.location.origin` instead of `"*"` when possible.

**Status**: Fixed

- Restricted `window.postMessage` to `window.location.origin` and enforced same-origin event filtering:
  - [extension/content-script.js](cci:7://file:///d:/Developer/reway/extension/content-script.js:0:0-0:0)

---

## H) **LOW: Reduce exposed message surfaces**

**Why it matters**

- Fewer listeners means less accidental reachability and simpler threat modeling.

**Status**: Fixed

- Removed the `chrome.runtime.onMessageExternal` handler (not needed for your current in-page check flow).
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)

---

## I) **LOW: Dev-only test page should still follow safe messaging + DOM patterns**

**Status**: Fixed

- Removed `innerHTML` and replaced `postMessage("*"...)` with `postMessage(..., window.location.origin)`:
  - [extension/test.html](cci:7://file:///d:/Developer/reway/extension/test.html:0:0-0:0)

---

# Additional findings (implementation-level)

## F) **CRITICAL: Popup XSS via DOM injection**

- **Files**:
  - [extension/js/sessions.js](cci:7://file:///d:/Developer/reway/extension/js/sessions.js:0:0-0:0) (tab titles/URLs are untrusted)
  - [extension/js/grabber.js](cci:7://file:///d:/Developer/reway/extension/js/grabber.js:0:0-0:0)

**Why it matters**

- Tab titles and some URLs can contain attacker-controlled characters. Using `innerHTML` in extension UIs is a direct XSS footgun.

**Status**: Fixed

- Replaced `innerHTML` usage with safe DOM construction (`textContent`, element attributes) and created the remove icon via SVG DOM APIs:
  - [extension/js/sessions.js](cci:7://file:///d:/Developer/reway/extension/js/sessions.js:0:0-0:0)
  - [extension/js/grabber.js](cci:7://file:///d:/Developer/reway/extension/js/grabber.js:0:0-0:0)

---

## G) **CRITICAL: API calls must include credentials for cookie-based auth**

- **Files**:
  - [extension/js/api.js](cci:7://file:///d:/Developer/reway/extension/js/api.js:0:0-0:0)
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)

**Why it matters**

- If `/api/extension/*` uses cookie-based auth (typical for Next.js/Supabase), extension `fetch()` requests must set `credentials: "include"` or auth will silently fail.

**Status**: Fixed

- Added `credentials: "include"` to extension API requests:
  - [extension/js/api.js](cci:7://file:///d:/Developer/reway/extension/js/api.js:0:0-0:0)
  - [extension/background.js](cci:7://file:///d:/Developer/reway/extension/background.js:0:0-0:0)
