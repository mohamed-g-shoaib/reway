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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
      className={cn(
        "group relative h-full w-full overflow-hidden bg-muted/20",
        className,
      )}
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
          "h-full w-full object-cover transition-opacity duration-300",
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
        className={cn(
          "absolute inset-0 flex flex-col justify-end bg-linear-to-t from-background/80 via-transparent to-transparent p-4 transition-opacity duration-200",
          isHovered || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex size-8 items-center justify-center rounded-xl ring-1 ring-foreground/8 bg-background text-foreground transition-colors hover:bg-muted"
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
        </div>
      </div>

      <div
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={togglePlay}
      />
    </div>
  );
}
