/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { formatViews, timeAgo, formatDuration } from "../utils";
import { CheckCircle2, MoreVertical, Play, Share2, Ban, EyeOff, FolderPlus } from "lucide-react";
import { Video } from "../types";

interface VideoCardProps {
  key?: any;
  video: Video;
  onClick: () => void;
  onNavigateDetail?: (page: string) => void;
}

export default function VideoCard({ video, onClick, onNavigateDetail }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setIsHovered(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => console.log("Hover video play blocked:", err));
      }
    }, 400); // 400ms delay to prevent aggressive triggers
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateDetail) {
      onNavigateDetail(`/channel/${video.userId}`);
    }
  };

  // Check if verified creator (seeded ones or threshold)
  const isVerified = video.channelName === "OpenBook HQ" || video.channelName === "Chai aur Code";

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer flex flex-col gap-2.5 relative bg-transparent rounded-2xl overflow-hidden transition-all duration-200"
    >
      {/* Dynamic Thumbnail & Loop Preview Wrapper */}
      <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-950 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-[1.02] border border-gray-100 dark:border-gray-900/60">
        {!isHovered ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        ) : (
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            alt-url={video.thumbnailUrl}
            className="w-full h-full object-cover brightness-95"
          />
        )}

        {/* Pulse Live Badge / standard duration bubble */}
        {video.category === "Gaming" && video.views < 3000 ? (
          <span className="absolute bottom-2 left-2 bg-[#FF6584] text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            LIVE
          </span>
        ) : (
          <span className="absolute bottom-2.5 right-2.5 bg-[#0A0A0F]/85 text-white font-mono text-xs px-2 py-0.5 rounded-lg border border-gray-800 backdrop-blur-xs select-none">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Floating Play indicator in Hover mode */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center animate-fade-in pointer-events-none">
            <div className="w-10 h-10 bg-[#6C63FF]/90 text-white rounded-full flex items-center justify-center shadow-lg transform scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Video metadata row */}
      <div className="flex gap-3 px-1">
        {/* Creator avatar */}
        <div
          onClick={handleChannelClick}
          className="w-9 h-9 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity"
        >
          <img
            src={video.channelAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
            alt={video.channelName}
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* Labels info */}
        <div className="flex-1 min-w-0 pr-1 relative">
          <div className="flex justify-between items-start gap-1">
            <h4 className="font-sans font-semibold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2 pr-4 font-display group-hover:text-[#6C63FF] transition-colors">
              {video.title}
            </h4>
            
            {/* Options launcher */}
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 absolute right-0 top-0 z-10"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-1 flex flex-col gap-0.5">
            {/* Publisher element */}
            <div
              onClick={handleChannelClick}
              className="group/channel flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white cursor-pointer inline-flex w-fit transition-colors"
            >
              <span className="truncate">{video.channelName}</span>
              {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#6C63FF] fill-current" />}
            </div>

            {/* Views and uploads date indicator */}
            <p className="text-xs text-gray-400 dark:text-gray-505 font-medium">
              <span>{formatViews(video.views)}</span>
              <span className="mx-1.5">•</span>
              <span>{timeAgo(video.createdAt)}</span>
            </p>
          </div>

          {/* Context Popover menus */}
          {showOptions && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-30 py-1 font-sans text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                  alert("Saved to library playlists!");
                }}
                className="w-full text-left px-3 py-2 text-gray-750 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-gray-400" />
                <span>Save to Playlist</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                  alert("We will show fewer videos like this.");
                }}
                className="w-full text-left px-3 py-2 text-gray-750 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                <span>Not interested</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                  alert("Report filed. Thank you!");
                }}
                className="w-full text-left px-3 py-2 text-[#FF6584] hover:bg-[#FF6584]/10 flex items-center gap-2 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Report video</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
