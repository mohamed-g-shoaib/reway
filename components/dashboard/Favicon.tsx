"use client";

import { useState } from "react";
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

const isProviderFallbackUrl = (src: string): boolean => {
  try {
    const parsed = new URL(src);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host.includes("gstatic.com") && path.includes("/faviconv2")) {
      return true;
    }

    if (host.includes("google.com") && path.includes("/s2/favicons")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

// Validate if a URL is safe to use with NextImage
const isValidImageUrl = (src: string | null | undefined): boolean => {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (trimmed.length === 0) return false;
  if (isProviderFallbackUrl(trimmed)) return false;
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
  const hasValidUrl = isValidImageUrl(url);
  const initialFallbackLevel: "primary" | "origin" | "letter" = hasValidUrl
    ? "primary"
    : "origin";

  return (
    <FaviconInner
      key={`${url}::${domain}`}
      url={url}
      domain={domain}
      title={title}
      isEnriching={isEnriching}
      className={className}
      initialFallbackLevel={initialFallbackLevel}
    />
  );
}

function FaviconInner({
  url,
  domain,
  title,
  isEnriching,
  className,
  initialFallbackLevel,
}: FaviconProps & {
  initialFallbackLevel: "primary" | "origin" | "letter";
}) {
  // Track which fallback level we're at: primary -> origin -> letter
  const [fallbackLevel, setFallbackLevel] = useState<
    "primary" | "origin" | "letter"
  >(initialFallbackLevel);

  // Determine if we have a valid primary URL
  const hasValidUrl = isValidImageUrl(url);

  // Helper to get initials and colors
  const getInitial = () => {
    const firstChar = (domain?.[0] || title?.[0] || "?").toUpperCase();
    return {
      char: firstChar,
      color: "bg-muted/30 text-muted-foreground border-border",
    };
  };

  const initials = getInitial();
  const originFallbackUrl = domain ? `https://${domain}/favicon.ico` : null;

  // Determine which image URL to show based on current fallback level
  const getCurrentImageUrl = () => {
    switch (fallbackLevel) {
      case "primary":
        return hasValidUrl ? url : null;
      case "origin":
        return originFallbackUrl;
      case "letter":
        return null;
    }
  };

  const currentImageUrl = getCurrentImageUrl();
  const shouldShowImage =
    fallbackLevel !== "letter" &&
    currentImageUrl != null &&
    currentImageUrl.length > 0;

  const handleImageError = () => {
    const isSameAsOrigin =
      !!currentImageUrl &&
      !!originFallbackUrl &&
      currentImageUrl === originFallbackUrl;

    switch (fallbackLevel) {
      case "primary":
        // Primary failed, try origin
        if (originFallbackUrl && !isSameAsOrigin) {
          setFallbackLevel("origin");
        } else {
          setFallbackLevel("letter");
        }
        break;
      case "origin":
        // Origin failed, show letter
        setFallbackLevel("letter");
        break;
      default:
        // Safety fallback
        setFallbackLevel("letter");
    }
  };

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform overflow-hidden",
        isEnriching
          ? "animate-pulse bg-muted/30 border-muted/50"
          : fallbackLevel === "letter"
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
      ) : shouldShowImage && currentImageUrl ? (
        <img
          key={currentImageUrl}
          src={currentImageUrl}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 rounded-sm object-contain"
          onError={handleImageError}
        />
      ) : (
        <span className="text-sm font-bold text-foreground">
          {initials.char}
        </span>
      )}
    </div>
  );
}
