"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface LazyRenderProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export function LazyRender({
  children,
  placeholder,
  rootMargin = "200px 0px",
  threshold = 0,
  className,
}: LazyRenderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;

    const element = containerRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, shouldRender]);

  return (
    <div ref={containerRef} className={className}>
      {shouldRender ? children : placeholder}
    </div>
  );
}
