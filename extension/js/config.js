export const DEFAULT_BASE_URL = "https://reway-app.vercel.app";
export const MAX_NAME_LENGTH = 18;

export function isDashboardUrl(url, baseUrl = DEFAULT_BASE_URL) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch {
    return false;
  }
}
