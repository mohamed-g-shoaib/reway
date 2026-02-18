export const DEFAULT_BASE_URL = "https://reway-app.vercel.app";
export const MAX_NAME_LENGTH = 18;

export function isDashboardUrl(url, baseUrl = DEFAULT_BASE_URL) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    if (urlObj.hostname !== baseObj.hostname) return false;
    return urlObj.pathname === "/dashboard" || urlObj.pathname.startsWith("/dashboard/");
  } catch {
    return false;
  }
}
