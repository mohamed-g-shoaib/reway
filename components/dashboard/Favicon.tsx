"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Bookmark01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";

interface FaviconProps {
  url: string;
  domain: string;
  title: string;
  isEnriching?: boolean;
  className?: string;
}

// Validate if a URL is safe to use with NextImage
const isValidImageUrl = (src: string | null | undefined): boolean => {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (trimmed.length === 0) return false;
  // Reject malformed data URLs (e.g., "data:;base64,=" or empty data)
  if (trimmed.startsWith("data:")) {
    // Valid data URLs should have format: data:[<mediatype>][;base64],<data>
    const dataMatch = trimmed.match(/^data:([^;,]*)(;base64)?,(.+)$/);
    if (!dataMatch || !dataMatch[3] || dataMatch[3].length < 4) return false;
  }
  return true;
};

export function Favicon({
  url,
  domain,
  title,
  isEnriching,
  className,
}: FaviconProps) {
  const [imageError, setImageError] = useState(false);
  const [useGoogleFallback, setUseGoogleFallback] = useState(false);

  // Determine if we have a valid primary URL
  const hasValidUrl = isValidImageUrl(url);

  // Helper to get initials and colors
  const getInitial = () => {
    const firstChar = (domain?.[0] || title?.[0] || "?").toUpperCase();

    // Stable color based on the first character
    const colors = [
      "bg-red-500/10 text-red-500 border-red-500/20",
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "bg-pink-500/10 text-pink-500 border-pink-500/20",
    ];
    const colorIndex = firstChar.charCodeAt(0) % colors.length;
    return { char: firstChar, color: colors[colorIndex] };
  };

  const initials = getInitial();
  const googleFallbackUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
    : null;

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform overflow-hidden",
        isEnriching
          ? "animate-pulse bg-muted/30 border-muted/50"
          : imageError
            ? `${initials.color}`
            : "bg-background border-border hover:bg-muted/30",
        className,
      )}
    >
      {isEnriching ? (
        <HugeiconsIcon
          icon={Bookmark01Icon}
          size={20}
          className="text-muted-foreground/20"
        />
      ) : !imageError && (hasValidUrl || googleFallbackUrl) ? (
        <NextImage
          src={useGoogleFallback || !hasValidUrl ? googleFallbackUrl! : url}
          alt=""
          width={24}
          height={24}
          unoptimized
          className="h-6 w-6 rounded-sm object-contain"
          onError={() => {
            if (!useGoogleFallback && googleFallbackUrl) {
              setUseGoogleFallback(true);
            } else {
              setImageError(true);
            }
          }}
        />
      ) : (
        <span className="text-sm font-bold tracking-tighter">
          {initials.char}
        </span>
      )}
    </div>
  );
}
