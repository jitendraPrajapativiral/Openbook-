/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tv,
  RotateCcw,
  SkipForward,
  FastForward,
} from "lucide-react";
import { AIChapter } from "../types";

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
  chapters?: AIChapter[];
  onVideoEnd?: () => void;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export default function VideoPlayer({
  src,
  thumbnail,
  chapters = [],
  onVideoEnd,
  isTheaterMode = false,
  onToggleTheater,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState("Auto");
  const [qualityLevels, setQualityLevels] = useState<string[]>(["Auto", "1080p", "720p", "360p"]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Initialize Video / HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(false);
    setCurrentTime(0);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // If source is a live HLS stream
    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels.map((lvl, index) => `${lvl.height}p`);
        setQualityLevels(["Auto", ...levels]);
      });
    } else {
      // Direct raw video file support
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  // Handle Play Pause
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.log("Video fail", e));
    }
  };

  // Update Progress states
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  // Seeking progress control
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const clickTime = parseFloat(e.target.value);
    video.currentTime = clickTime;
    setCurrentTime(clickTime);
  };

  // Volume operations
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    video.volume = vol;
    setIsMuted(vol === 0);
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  // Fullscreen support
  const handleToggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => console.log(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys if the user is typing in forms/comments
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          handleTogglePlay();
          break;
        case "f":
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          handleToggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "arrowright":
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 5);
          break;
        case "arrowup":
          e.preventDefault();
          const moreVol = Math.min(1, volume + 0.05);
          setVolume(moreVol);
          video.volume = moreVol;
          setIsMuted(false);
          break;
        case "arrowdown":
          e.preventDefault();
          const lessVol = Math.max(0, volume - 0.05);
          setVolume(lessVol);
          video.volume = lessVol;
          if (lessVol === 0) setIsMuted(true);
          break;
        default:
          // Check for numbers 1 to 9 for progress jump
          const num = parseInt(e.key);
          if (num >= 1 && num <= 9) {
            e.preventDefault();
            const pctVal = num / 10;
            video.currentTime = duration * pctVal;
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration, volume, isMuted]);

  // Controlling mouse movement to display dashboard
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Formatting helper
  const formatedTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle Quality Selection
  const selectQuality = (ql: string) => {
    setCurrentQuality(ql);
    setShowQualityMenu(false);
    if (hlsRef.current) {
      if (ql === "Auto") {
        hlsRef.current.currentLevel = -1;
      } else {
        const hVal = parseInt(ql);
        const fitLvl = hlsRef.current.levels.findIndex((lvl) => lvl.height === hVal);
        if (fitLvl !== -1) {
          hlsRef.current.currentLevel = fitLvl;
        }
      }
    }
  };

  const selectSpeed = (r: number) => {
    setPlaybackRate(r);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = r;
    }
  };

  // Fast forward seek triggers
  const handleStepSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  // Dynamic double tap seek mock trigger (highly responsive mobile layout)
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const delay = 300;
    if (now - lastTapRef.current < delay) {
      // Double tap! Check left or right tap coordinate
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > rect.width / 2) {
        handleStepSeek(10); // seek right 10s
      } else {
        handleStepSeek(-10); // seek left 10s
      }
    }
    lastTapRef.current = now;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleDoubleTap}
      className={`relative rounded-2xl overflow-hidden bg-black aspect-video select-none shadow-xl border border-gray-100 dark:border-gray-900 focus:outline-none transition-all duration-200 ${
        isTheaterMode && !isFullscreen ? "w-full max-h-[75vh]" : ""
      }`}
    >
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onVideoEnd}
        onClick={(e) => {
          e.stopPropagation();
          handleTogglePlay();
        }}
        poster={thumbnail}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Floating Center Actions Overlay */}
      {(!isPlaying || showControls) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 bg-[#6C63FF]/90 hover:bg-[#6C63FF] text-white rounded-full flex items-center justify-center cursor-pointer pointer-events-auto transform hover:scale-105 active:scale-95 shadow-lg shadow-[#6C63FF]/30 transition-all duration-150"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
        </div>
      )}

      {/* Controller control bar - Slide animation */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/75 to-transparent flex flex-col gap-3 transition-transform duration-300 z-10 font-mono ${
          showControls || !isPlaying ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()} // stop tap interactions closing or pausing
      >
        {/* Dynamic Progress indicator with clickable Chapter Indicators */}
        <div className="relative group/progress flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#6C63FF] focus:outline-none group-hover/progress:h-2.5 transition-all"
          />

          {/* Render timeline chapters */}
          {duration > 0 &&
            chapters.map((chap, idx) => {
              // Convert chap.time "1:15" or similar to seconds
              const parts = chap.time.split(":");
              const chapSecs =
                parts.length === 3
                  ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
                  : parseInt(parts[0]) * 60 + parseInt(parts[1]);

              const leftPct = (chapSecs / duration) * 100;
              if (leftPct > 100) return null;

              return (
                <div
                  key={idx}
                  style={{ left: `${leftPct}%` }}
                  className="absolute w-1 h-3 bg-white border-l border-r border-[#0A0A0F]/60 -translate-y-1/2 pointer-events-none group-hover/progress:h-4 transition-all"
                  title={chap.title}
                />
              );
            })}
        </div>

        {/* Buttons and menu triggers */}
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-4">
            {/* Play trigger button */}
            <button
              onClick={handleTogglePlay}
              className="hover:text-[#6C63FF] cursor-pointer transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Step triggers */}
            <button
              onClick={() => handleStepSeek(-10)}
              className="text-gray-300 hover:text-white cursor-pointer"
              title="Seek backwards 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStepSeek(10)}
              className="text-gray-300 hover:text-white cursor-pointer"
              title="Forward 10s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume controller panel */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={handleToggleMute}
                className="hover:text-[#6C63FF] cursor-pointer transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-200 h-1 accent-[#6C63FF] rounded cursor-pointer pointer-events-auto"
              />
            </div>

            {/* Reading Timer label */}
            <div className="text-xs select-none">
              <span>{formatedTime(currentTime)}</span>
              <span className="mx-1 text-gray-500">/</span>
              <span className="text-gray-300">{formatedTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Play Speed selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                className="text-xs font-semibold hover:text-[#6C63FF] px-2 py-1 rounded border border-gray-700 bg-gray-900/60 transition-colors cursor-pointer"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 w-28 bg-[#111118]/95 border border-gray-800 rounded-xl overflow-hidden py-1 shadow-xl z-20 font-sans text-xs">
                  {[0.5, 1, 1.25, 1.5, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => selectSpeed(r)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-gray-800 cursor-pointer ${
                        playbackRate === r ? "text-[#6C63FF] font-bold" : "text-gray-300"
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality switcher buttons */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className="flex items-center gap-1 hover:text-[#6C63FF] font-semibold text-xs border border-gray-700 bg-gray-900/60 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{currentQuality === "Auto" ? "Auto" : currentQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-10 right-0 w-32 bg-[#111118]/95 border border-gray-800 rounded-xl overflow-hidden py-1 shadow-xl z-20 font-sans text-xs">
                  <p className="px-3 py-1 text-[10px] text-gray-500 uppercase font-semibold">Quality</p>
                  {qualityLevels.map((ql) => (
                    <button
                      key={ql}
                      onClick={() => selectQuality(ql)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-800 cursor-pointer ${
                        currentQuality === ql ? "text-[#6C63FF] font-bold" : "text-gray-300"
                      }`}
                    >
                      {ql}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theater Mode switch */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className="hover:text-[#6C63FF] transition-colors cursor-pointer hidden sm:block"
                title={isTheaterMode ? "Normal mode" : "Theater mode"}
              >
                <Tv className={`w-5 h-5 ${isTheaterMode ? "text-[#6C63FF]" : ""}`} />
              </button>
            )}

            {/* Maximize operations */}
            <button
              onClick={handleToggleFullscreen}
              className="hover:text-[#6C63FF] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
