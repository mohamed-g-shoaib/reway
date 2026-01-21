"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Bookmark as BookmarkIcon } from "lucide-react";

interface FaviconProps {
  url: string;
  domain: string;
  title: string;
  isEnriching?: boolean;
}

export function Favicon({ url, domain, title, isEnriching }: FaviconProps) {
  const [imageError, setImageError] = useState(false);
  const [useGoogleFallback, setUseGoogleFallback] = useState(false);

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
  const googleFallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all overflow-hidden ${
        isEnriching
          ? "animate-pulse bg-muted/30 border-muted/50"
          : imageError
            ? `${initials.color} shadow-sm`
            : "bg-background border-border shadow-sm hover:shadow-md"
      }`}
    >
      {isEnriching ? (
        <BookmarkIcon className="h-5 w-5 text-muted-foreground/20" />
      ) : !imageError ? (
        <NextImage
          src={useGoogleFallback ? googleFallbackUrl : url || googleFallbackUrl}
          alt=""
          width={24}
          height={24}
          unoptimized
          className="h-6 w-6 rounded-sm object-contain"
          onError={() => {
            if (!useGoogleFallback) {
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
