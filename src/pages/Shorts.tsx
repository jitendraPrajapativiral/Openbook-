/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../store/AppContext";
import { formatViews } from "../utils";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Home,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { Video } from "../types";

export default function Shorts() {
  const { token, currentUser } = useApp();
  const [shortsList, setShortsList] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audio / Interaction controls
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Likes caching
  const [likesState, setLikesState] = useState<{ [id: string]: { count: number; active: boolean } }>({});
  
  // Custom Comment tray states
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const fetchShorts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos?isShort=true");
      if (res.ok) {
        const data = await res.json();
        const list: Video[] = data.videos || [];
        setShortsList(list);

        // Pre-populate likes statuses
        const dict: any = {};
        list.forEach((sh) => {
          dict[sh._id] = {
            count: sh.likes?.length || 4,
            active: currentUser ? sh.likes?.includes(currentUser._id) : false,
          };
        });
        setLikesState(dict);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, [currentUser]);

  // Handle active video reload on swipe index change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch((e) => console.log(e));
      } else {
        videoRef.current.pause();
      }
    }
    // Fetch comments for currently active short item
    if (shortsList.length > 0) {
      fetchCommentsForActiveShort();
    }
  }, [currentIndex, shortsList]);

  const fetchCommentsForActiveShort = async () => {
    const active = shortsList[currentIndex];
    if (!active) return;

    try {
      const res = await fetch(`/api/videos/${active._id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentList(data.comments || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleNext = () => {
    if (currentIndex < shortsList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("Yeh aakhri Short format hai OpenBook platform par!");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch((e) => console.log(e));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    if (!token) {
      alert("Sign in required to evaluated shorts.");
      return;
    }
    const activeId = shortsList[currentIndex]?._id;
    if (!activeId) return;

    const current = likesState[activeId] || { count: 0, active: false };
    const nextState = {
      count: current.active ? current.count - 1 : current.count + 1,
      active: !current.active,
    };

    setLikesState({
      ...likesState,
      [activeId]: nextState,
    });

    // Fire actual POST endpoint on Express
    fetch(`/api/videos/${activeId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((e) => console.log(e));
  };

  const postShortsComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Please sign in or register to express opinion.");
      return;
    }
    if (!newComment.trim()) return;

    const activeId = shortsList[currentIndex]?._id;
    if (!activeId) return;

    try {
      const res = await fetch(`/api/videos/${activeId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        fetchCommentsForActiveShort(); // refresh
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#FF6584] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-mono">Launching vertical Shorts feeds...</p>
      </div>
    );
  }

  if (shortsList.length === 0) {
    return (
      <div className="text-center py-20 bg-[#111118]/40 border border-gray-800 rounded-2xl max-w-sm mx-auto mt-10">
        <Sparkles className="w-12 h-12 text-[#FF6584] mx-auto mb-2 animate-bounce" />
        <h4 className="font-bold text-gray-400">Shorts Feed Empty</h4>
        <p className="text-xs text-gray-500 mt-1">Creator upload page se "Short Format" select karke video post karein.</p>
      </div>
    );
  }

  const activeShort = shortsList[currentIndex];
  const activeObj = likesState[activeShort._id] || { count: 32, active: false };
  const isVerified = activeShort.channelName === "OpenBook HQ" || activeShort.channelName === "Chai aur Code";

  return (
    <div className="font-sans flex flex-col items-center justify-center py-2 relative select-none animate-fade-in pb-12">
      {/* Dynamic Keynotes Swipe guide banner */}
      <div className="text-center mb-4 hidden md:block">
        <p className="text-xs font-semibold text-gray-400">
          Tip: Swipe using buttons or click arrow navigations scrollbar to load next clips.
        </p>
      </div>

      <div className="flex gap-4 items-end relative max-w-lg w-full justify-center">
        {/* TikTok vertical frame viewport container */}
        <div className="relative aspect-[9/16] w-[340px] max-w-full bg-[#0A0A0F] border border-gray-150 dark:border-gray-850 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
          
          {/* Loop actual MP4 player */}
          <video
            ref={videoRef}
            src={activeShort.videoUrl}
            loop
            muted={isMuted}
            autoPlay
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer bg-black/90"
          />

          {/* Floater play toggle badge click indicators */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer pointer-events-none">
              <div className="w-14 h-14 bg-black/50 text-white rounded-full flex items-center justify-center shadow-lg">
                <Pause className="w-6 h-6 fill-current" />
              </div>
            </div>
          )}

          {/* Quick float audio switcher trigger */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 p-2.5 rounded-full text-white cursor-pointer z-10 border border-gray-800 backdrop-blur-xs transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#FF6584]" /> : <Volume2 className="w-4 h-4 text-[#6C63FF]" />}
          </button>

          {/* Overlay titles and description text drawer details at bottom vertical */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2.5 text-white pointer-events-none">
            
            {/* Publisher metadata channels row info */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <img
                src={activeShort.channelAvatar}
                alt={activeShort.channelName}
                className="w-8 h-8 rounded-xl object-cover border border-gray-700"
              />
              <div className="truncate text-xs font-semibold flex items-center gap-1">
                <span className="text-gray-100 hover:underline cursor-pointer">{activeShort.channelName}</span>
                {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#6C63FF] fill-current" />}
              </div>
            </div>

            {/* Video description title hooks */}
            <p className="text-xs text-slate-105 select-text pointer-events-auto line-clamp-3 leading-relaxed font-semibold">
              {activeShort.title} — {activeShort.description}
            </p>

            <span className="bg-[#6C63FF]/30 border border-[#6C63FF]/20 text-white font-mono text-[9px] px-2 py-0.5 rounded-md w-fit lowercase font-semibold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF6584]" />
              <span>#{activeShort.category || "Shorts"}</span>
            </span>
          </div>
        </div>

        {/* Right side interaction floating sidebar panels list (TikTok standard) */}
        <div className="flex flex-col gap-5 items-center bg-gray-50/10 dark:bg-transparent p-2.5 rounded-2xl border border-gray-200/5 dark:border-gray-800/10">
          {/* 1. Like button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full shadow-lg border cursor-pointer transition-all ${
                activeObj.active
                  ? "bg-[#FF6584] border-[#FF6584] text-white"
                  : "bg-white dark:bg-[#111118] border-gray-200 dark:border-gray-800 text-gray-550 dark:text-gray-300 hover:scale-105"
              }`}
            >
              <ThumbsUp className="w-4.5 h-4.5 fill-current" />
            </button>
            <span className="text-[10px] font-bold text-gray-400 font-mono mt-1">{activeObj.count}</span>
          </div>

          {/* 2. Comments panel tray opener button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-3 rounded-full shadow-lg border hover:scale-105 cursor-pointer transition-all ${
                showComments
                  ? "bg-[#6C63FF] border-[#6C63FF] text-white"
                  : "bg-white dark:bg-[#111118] border-gray-200 dark:border-gray-800 text-gray-550 dark:text-gray-300"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
            </button>
            <span className="text-[10px] font-bold text-gray-400 font-mono mt-1">{commentList.length}</span>
          </div>

          {/* 3. Share link triggers */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/#/watch/${activeShort._id}`);
                alert("Share link copied to clipboard!");
              }}
              className="p-3 bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 text-gray-550 dark:text-gray-300 rounded-full shadow-lg hover:scale-105 cursor-pointer transition-all"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
            <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase font-display">Share</span>
          </div>

          <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-850 my-1" />

          {/* Quick navigation selectors up/down arrows */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-30 rounded-xl cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white"
            title="Previous Short video"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === shortsList.length - 1}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-30 rounded-xl cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white"
            title="Next Short video"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide-out comments overlay drawer */}
      {showComments && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#111118] border-l border-gray-200 dark:border-gray-800 z-50 p-4 shadow-xl flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-3">
            <h4 className="font-display font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
              Short Opinions ({commentList.length})
            </h4>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-gray-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* scroll commenters list */}
          <div className="flex-1 overflow-y-auto space-y-3.5 divide-y divide-gray-100 dark:divide-gray-850 pr-1">
            {commentList.length === 0 ? (
              <p className="text-center py-10 text-xs text-gray-550 italic">Be the first to say something!</p>
            ) : (
              commentList.map((c) => (
                <div key={c._id} className="pt-3 text-[11px] gap-2.5 flex items-start">
                  <img src={c.userAvatar} alt={c.userName} className="w-6 h-6 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-850 dark:text-gray-200">{c.userName}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 leading-normal font-sans">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* comments add box footer */}
          <form onSubmit={postShortsComment} className="flex gap-2.5 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder={token ? "Openly say something..." : "Log in to post opinion..."}
              disabled={!token}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-gray-950 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="bg-[#6C63FF] hover:bg-opacity-95 text-white px-3 text-xs font-semibold rounded-xl"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
