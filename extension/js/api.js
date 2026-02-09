export const DEFAULT_BASE_URL = "https://reway.vercel.app";

export async function getSettings() {
  const { rewayBaseUrl, rewayGroups } = await chrome.storage.local.get([
    "rewayBaseUrl",
    "rewayGroups",
  ]);

  return {
    baseUrl: rewayBaseUrl || DEFAULT_BASE_URL,
    groups: Array.isArray(rewayGroups) ? rewayGroups : [],
  };
}

export async function apiFetch(endpoint, options = {}) {
  const { baseUrl } = await getSettings();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear groups if auth fails
      await chrome.storage.local.remove("rewayGroups");
    }
    throw response;
  }

  return response.json();
}
