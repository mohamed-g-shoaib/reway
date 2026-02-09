/**
 * Injected script for metadata retrieval.
 * We use this via chrome.scripting.executeScript for better privacy than permanent content scripts.
 */
function extractMetadata() {
  function getDescription() {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription?.content) return metaDescription.content.trim();

    const ogDescription = document.querySelector(
      'meta[property="og:description"]',
    );
    if (ogDescription?.content) return ogDescription.content.trim();

    const firstParagraph = document.querySelector("p");
    if (firstParagraph?.textContent) {
      return firstParagraph.textContent.trim().slice(0, 280);
    }
    return "";
  }

  return {
    title: document.title || "",
    description: getDescription(),
  };
}

export async function fetchPageMeta(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractMetadata,
    });

    if (results && results[0]?.result) {
      return results[0].result;
    }
  } catch (error) {
    console.warn("Metadata extraction failed:", error);
  }
  return null;
}
