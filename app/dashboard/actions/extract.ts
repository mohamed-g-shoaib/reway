"use server";

import { google } from "@/lib/ai";
import { generateText } from "ai";

export async function extractLinks(content: string, isImage = false) {
  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      messages: [
        {
          role: "system",
          content:
            "Extract all URLs from the provided content. Return ONLY a valid JSON array of strings (the URLs). If no URLs are found, return []. Do not include any other text or markdown formatting.",
        },
        {
          role: "user",
          content: isImage
            ? [
                {
                  type: "image",
                  image: new Uint8Array(Buffer.from(content, "base64")),
                },
              ]
            : content,
        },
      ],
    });

    console.log("AI Raw Response:", text);

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const urls = JSON.parse(cleanText);
    console.log("Extracted URLs:", urls);
    return Array.isArray(urls) ? urls : [];
  } catch (error) {
    console.error("Link extraction failed:", error);
    return [];
  }
}
