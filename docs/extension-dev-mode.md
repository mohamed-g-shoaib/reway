# Pro Extension Setup: Hybrid Local & Production Development

This guide explains how to build a "Developer Mode" into your browser extension. This allows you to toggle between `localhost` and `production` instantly, without modifying code or shipping separate builds.

---

## 🏗️ The Problem: Hardcoded API URLs

Most developers hardcode `const API_BASE = "https://api.myapp.com"`. This forces you to:

1.  Manually change the code every time you want to test locally.
2.  Risk accidentally shipping "localhost" back to the Chrome Web Store.

## 🚀 The Solution: Dynamic Base URL with Hidden UI

We store the `API_BASE` in `chrome.storage.local`. If it's empty, we default to production. If we are in "Dev Mode," we override it with localhost.

---

## 🛠️ Implementation (LLM-Friendly)

### 1. The "Hidden" UI (popup.html)

Add a hidden settings panel at the bottom of your popup.

```html
<!-- hidden-settings.html -->
<div id="dev-settings" class="hidden-panel">
  <input type="text" id="custom-url" placeholder="http://localhost:3000/api" />
  <button id="save-settings">Set API</button>
  <button id="reset-settings">Reset to Prod</button>
</div>
```

### 2. The Triple-Click Logic (popup.js)

This is the "Pro Tip": User's won't see this, but developers can unlock it.

```javascript
let clickCount = 0;
const logo = document.getElementById("logo");

logo.addEventListener("click", () => {
  clickCount++;
  if (clickCount === 3) {
    document.getElementById("dev-settings").classList.toggle("visible");
    clickCount = 0; // reset
  }
  // Auto-reset click count after 1 second of inactivity
  setTimeout(() => {
    clickCount = 0;
  }, 1000);
});
```

### 3. Dynamic API Fetching

Wrap your API base in a helper function that checks storage first.

```javascript
const PROD_API = "https://mindcave.vercel.app/api";

async function getApiBase() {
  const result = await chrome.storage.local.get("dev_api_override");
  return result.dev_api_override || PROD_API;
}

// usage:
async function fetchData() {
  const BASE = await getApiBase();
  const res = await fetch(`${BASE}/categories`);
  // ...
}
```

---

## 💡 How Authentication Stays Synced

The magic of the "Seamless Auth" mentioned in the previous guide still works here:

1.  **If API = localhost**: The browser checks its cookie jar for `localhost`. If you are logged into your local dev server, those cookies are sent.
2.  **If API = production**: The browser checks its cookie jar for `mindcave.vercel.app`. Your production session cookies are sent.
3.  **Independence**: You can be logged into local as `Dev_User` and production as `Real_User` simultaneously. Switching the URL in the extension instantly switches which "Identity" the extension uses.

---

## 🤖 Guide for LLMs (To help your friend's agent)

If you are an AI assistant implementing this:

1.  **Storage Permission**: Ensure `"storage"` is in `manifest.json`.
2.  **Async Load**: Since `chrome.storage.local.get` is asynchronous, you MUST call it at the very start of your `popup.js` `init()` function before any other API calls.
3.  **UI Feedback**: When the user clicks "Save Settings," reload the popup (`window.location.reload()`) to ensure the entire app starts fresh with the new URL.
4.  **CORS**: Remind the developer that `localhost` fetch requests from extensions still require the local server to allow requests from `chrome-extension://<ID>`.

---

## 🎯 Summary

By using this approach, the **extension becomes environment-agnostic**. It follows the URL. If the URL is localhost, it uses local sessions. If it's production, it uses production sessions. Simple, clean, and impossible to "break" for regular users.
