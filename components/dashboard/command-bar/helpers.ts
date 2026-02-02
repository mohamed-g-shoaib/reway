export const normalizeUrl = (url: string) => {
  let normalized = url.trim();
  if (!normalized.startsWith("http")) {
    normalized = `https://${normalized}`;
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.pathname === "/") {
      return parsed.origin;
    }
    return parsed.href.replace(/\/$/, "");
  } catch {
    return normalized;
  }
};

export const isUrl = (value: string) => {
  try {
    new URL(value.startsWith("http") ? value : `https://${value}`);
    return value.includes(".");
  } catch {
    return false;
  }
};
