"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  PauseIcon,
  MaximizeScreenIcon,
  MinimizeScreenIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface DemoVideoProps {
  src: string;
  poster?: string;
  className?: string;
  hideControls?: boolean;
  onProgressUpdate?: (progress: number) => void;
  onEnded?: () => void;
  loop?: boolean;
  isHovered?: boolean;
}

export function DemoVideo({
  src,
  poster,
  className,
  hideControls,
  onProgressUpdate,
  onEnded,
  loop = true,
  isHovered: isHoveredExternally,
}: DemoVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHoveredInternally, setIsHoveredInternally] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTouchUI, setIsTouchUI] = useState(false);
  const [showMobileFullscreen, setShowMobileFullscreen] = useState(false);

  const isHovered = isHoveredExternally ?? isHoveredInternally;

  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressUpdate]);

  useEffect(() => {
    let rafId: number;

    const updateProgress = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        const duration = video.duration;
        const current = video.currentTime;
        if (duration > 0) {
          const newProgress = (current / duration) * 100;
          // Only trigger React state update if we need to show internal controls
          if (!hideControls) {
            setProgress(newProgress);
          }
          onProgressUpdateRef.current?.(newProgress);
        }
      }
      rafId = requestAnimationFrame(updateProgress);
    };

    rafId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(rafId);
  }, [hideControls]);

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

    const video = videoRef.current as
      | (HTMLVideoElement & {
          addEventListener: HTMLVideoElement["addEventListener"];
        })
      | null;
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

    if (isTouchUI) {
      setShowMobileFullscreen(true);
      setTimeout(() => setShowMobileFullscreen(false), 2000);
    }

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }
    videoRef.current.pause();
    setIsPlaying(false);
  }, [isTouchUI]);

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
      if (!isReady && current > 0) {
        setIsReady(true);
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
        "group relative h-full w-full overflow-hidden cursor-pointer",
        isFullscreen ? "bg-black" : "bg-muted/20",
        className,
      )}
      onClick={handleWrapperClick}
      onMouseEnter={() => setIsHoveredInternally(true)}
      onMouseLeave={() => setIsHoveredInternally(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        loop={loop}
        muted
        playsInline
        className={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          isReady || isPlaying ? "opacity-100" : "opacity-0",
        )}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onLoadedData={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => setIsReady(true)}
      />

      {/* Floating Fullscreen Toggle - Always visible (transparent), highlights on interaction */}
      {hideControls && (
        <button
          onClick={toggleFullscreen}
          className={cn(
            "absolute right-2 top-2 sm:right-4 sm:top-4 z-20 flex h-7 sm:h-9 items-center justify-center rounded-xl sm:rounded-2xl ring-1 ring-foreground/20 bg-background/10 px-1.5 sm:px-2.5 text-foreground/40 leading-none transition-all duration-300 backdrop-blur-md cursor-pointer",
            "hover:bg-background/80 hover:text-foreground hover:ring-foreground/30",
            (isHovered || showMobileFullscreen) &&
              "opacity-100 text-foreground/90 bg-background/60 ring-foreground/40",
          )}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          type="button"
        >
          <span
            className={cn(
              "flex items-center overflow-hidden text-[8px] sm:text-[9px] font-bold uppercase tracking-widest leading-none transition-all duration-500 ease-out",
              isTouchUI || isHovered
                ? "max-w-24 opacity-100 mr-1.5"
                : "max-w-0 opacity-0 mr-0",
            )}
          >
            {isFullscreen ? "Exit" : "Fullscreen"}
          </span>
          <div className="flex items-center justify-center">
            <HugeiconsIcon icon={isFullscreen ? MinimizeScreenIcon : MaximizeScreenIcon} size={16} />
          </div>
        </button>
      )}

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40" />
      )}

      {!hideControls && (
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
              className="flex size-8 items-center justify-center rounded-xl ring-1 ring-foreground/8 bg-background text-foreground transition-colors hover:bg-muted cursor-pointer"
              type="button"
            >
              <HugeiconsIcon
                icon={isPlaying ? PauseIcon : PlayIcon}
                size={14}
              />
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
              className="flex size-8 items-center justify-center rounded-xl ring-1 ring-foreground/8 bg-background text-foreground transition-colors hover:bg-muted cursor-pointer"
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
      )}
    </div>
  );
}
