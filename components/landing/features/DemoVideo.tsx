"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon, PauseIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface DemoVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function DemoVideo({ src, poster, className }: DemoVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTouchUI, setIsTouchUI] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const video = videoRef.current as (HTMLVideoElement & {
      addEventListener: HTMLVideoElement["addEventListener"];
    }) | null;
    const handleWebkitBegin = () => setIsFullscreen(true);
    const handleWebkitEnd = () => setIsFullscreen(false);
    video?.addEventListener?.("webkitbeginfullscreen", handleWebkitBegin);
    video?.addEventListener?.("webkitendfullscreen", handleWebkitEnd);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video?.removeEventListener?.("webkitbeginfullscreen", handleWebkitBegin);
      video?.removeEventListener?.("webkitendfullscreen", handleWebkitEnd);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchUI(Boolean(mql.matches));
    update();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const handleWrapperClick = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }
    videoRef.current.pause();
    setIsPlaying(false);
  }, []);

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    // iOS Safari uses a separate fullscreen API on the <video> element.
    const anyVideo = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    if (typeof wrapper.requestFullscreen === "function") {
      wrapper.requestFullscreen().catch(() => {
        anyVideo.webkitEnterFullscreen?.();
      });
      return;
    }

    anyVideo.webkitEnterFullscreen?.();
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (!isReady && current > 0) {
        setIsReady(true);
      }
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const seekValue = parseFloat(e.target.value);
      const seekTime = (seekValue / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(seekValue);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "group relative h-full w-full overflow-hidden",
        isFullscreen ? "bg-black" : "bg-muted/20",
        className,
      )}
      onClick={handleWrapperClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        loop
        muted
        playsInline
        className={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          isReady || isPlaying ? "opacity-100" : "opacity-0",
        )}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => setIsReady(true)}
      />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40" />
      )}

      {/* Controls Overlay - Using base theme components and consistent tokens */}
      <div
        style={{ zIndex: 10 }}
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-200",
          isTouchUI
            ? isPlaying
              ? "opacity-60"
              : "opacity-100"
            : isHovered || !isPlaying
              ? "opacity-100"
              : "opacity-0",
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex size-8 items-center justify-center rounded-xl ring-1 ring-foreground/8 bg-background text-foreground transition-colors hover:bg-muted"
            type="button"
          >
            <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={14} />
          </button>

          <div className="relative flex-1 flex items-center h-4">
            {/* Background Track - Consistent with card border/muted tokens */}
            <div className="absolute w-full h-1 bg-border rounded-full overflow-hidden">
              {/* Progress Bar - Using foreground/primary without glow */}
              <div
                className="absolute top-0 left-0 h-full bg-foreground"
                style={{ width: `${progress}%` }}
              />
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
            />
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex size-8 items-center justify-center rounded-xl ring-1 ring-foreground/8 bg-background text-foreground transition-colors hover:bg-muted"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isFullscreen ? (
                <>
                  <path d="M9 9H5V5" />
                  <path d="M15 9h4V5" />
                  <path d="M9 15H5v4" />
                  <path d="M15 15h4v4" />
                </>
              ) : (
                <>
                  <path d="M9 5H5v4" />
                  <path d="M15 5h4v4" />
                  <path d="M9 19H5v-4" />
                  <path d="M15 19h4v-4" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
