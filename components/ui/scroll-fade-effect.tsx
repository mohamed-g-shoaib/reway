"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ScrollFadeEffectProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

export function ScrollFadeEffect({
  className,
  orientation = "vertical",
  ...props
}: ScrollFadeEffectProps) {
  return (
    <div
      data-orientation={orientation}
      className={cn(
        "data-[orientation=horizontal]:overflow-x-auto data-[orientation=vertical]:overflow-y-auto",
        "data-[orientation=horizontal]:scroll-fade-effect-x data-[orientation=vertical]:scroll-fade-effect-y",
        "scrollbar-none", // Hide scrollbar for a cleaner feel in the search bar
        className,
      )}
      {...props}
    />
  );
}
