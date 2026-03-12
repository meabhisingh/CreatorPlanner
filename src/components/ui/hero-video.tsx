"use client";

import { Play, Pause } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const PromoVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-secondary/20 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={togglePlay}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        loop
        playsInline
      ></video>

      {/* Overlay & Controls */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out cursor-pointer",
          isPlaying ? "bg-black/0" : "bg-black/40 backdrop-blur-[2px]",
          isPlaying && !isHovering ? "opacity-0" : "opacity-100 bg-black/40"
        )}
      >
        <div 
          className={cn(
            "relative flex items-center justify-center rounded-full transition-transform duration-300",
            isPlaying && !isHovering ? "scale-90" : "scale-100"
          )}
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl scale-150 animate-pulse" />
          
          {/* Glass Button */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(82,82,224,0.3)] transition-all hover:bg-white/20 hover:scale-105">
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white fill-white ml-0.5" />
            ) : (
              <Play className="h-8 w-8 text-white fill-white ml-2" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
