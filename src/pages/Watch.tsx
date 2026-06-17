/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import VideoPlayer from "../components/VideoPlayer";
import CommentSection from "../components/CommentSection";
import { formatViews, timeAgo, formatSubscribers } from "../utils";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  FolderPlus,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Tv,
} from "lucide-react";
import { Video } from "../types";

interface WatchProps {
  videoId: string;
  onNavigate: (page: string) => void;
}

export default function Watch({ videoId, onNavigate }: WatchProps) {
  const { token, currentUser } = useApp();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Liking/subscribing values
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);

  // AI summarizer state
  const [gettingSummary, setGettingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  // Theater state
  const [theaterMode, setTheaterMode] = useState(false);

  const fetchVideoDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        setVideo(data.video);
        setAiSummary(data.video?.aiSummary || "");
        setLikesCount(data.video?.likes?.length || 0);
        setIsLiked(currentUser ? data.video?.likes?.includes(currentUser._id) : false);
        setIsDisliked(currentUser ? data.video?.dislikes?.includes(currentUser._id) : false);

        // Fetch creator's channel subscription metric
        if (data.video) {
          const uRes = await fetch(`/api/users/${data.video.userId}`);
          if (uRes.ok) {
            const uData = await uRes.json();
            setSubCount(uData.subscriberCount || 0);
          }

          if (token) {
            const sRes = await fetch(`/api/subscriptions/status/${data.video.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (sRes.ok) {
              const sData = await sRes.json();
              setIsSubscribed(sData.subscribed);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/related`);
      if (res.ok) {
        const data = await res.json();
        setRelated(data.videos || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // View increase trigger on video load
  const triggerView = async () => {
    try {
      await fetch(`/api/videos/${videoId}/view`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      console.log("View update failed", e);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
      fetchRelatedVideos();
      triggerView();
    }
    // Scroll page to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [videoId, currentUser]);

  const handleLike = async () => {
    if (!token) {
      alert("Sign in sequence required to evaluate videos.");
      return;
    }
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes?.length || 0);
        setIsLiked(data.likes?.includes(currentUser?._id));
        setIsDisliked(data.dislikes?.includes(currentUser?._id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDislike = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/videos/${videoId}/dislike`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes?.length || 0);
        setIsLiked(data.likes?.includes(currentUser?._id));
        setIsDisliked(data.dislikes?.includes(currentUser?._id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!token) {
      alert("Registration or Sign In required to subscribe to creators!");
      return;
    }
    if (video?.userId === currentUser?._id) {
      alert("Aap apne channel ko subscribe nahi kar sakte!");
      return;
    }

    try {
      const method = isSubscribed ? "DELETE" : "POST";
      const res = await fetch(`/api/channels/${video?.userId}/subscribe`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsSubscribed(!isSubscribed);
        setSubCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate Summary powered by Gemini
  const handleGenerateSummary = async () => {
    if (!video) return;
    setGettingSummary(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: video.title, description: video.description }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGettingSummary(false);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(true);
    setTimeout(() => {
      setShowShareModal(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-mono">Opening video stream player...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-24 px-4 font-sans bg-[#111118]/40 border border-gray-800 rounded-2xl max-w-lg mx-auto mt-10">
        <h3 className="text-lg font-bold text-gray-500">Video Not Found</h3>
        <p className="text-xs text-gray-400 mt-2">Apologies, standard source files or database items were deleted.</p>
        <button
          onClick={() => onNavigate("/")}
          className="mt-4 bg-[#6C63FF] text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const isVerified = video.channelName === "OpenBook HQ" || video.channelName === "Chai aur Code";

  return (
    <div className="flex flex-col gap-6 pb-16 font-sans select-none animate-fade-in relative z-20">
      {/* Dynamic Theater Mode sizing wrapping row */}
      <div className={`flex flex-col lg:flex-row gap-6 ${theaterMode ? "flex-wrap lg:px-0" : ""}`}>
        
        {/* Left main video viewing segment */}
        <div className={`flex-1 min-w-0 ${theaterMode ? "w-full lg:w-full lg:max-w-none shrink-0" : ""}`}>
          <VideoPlayer
            src={video.videoUrl}
            thumbnail={video.thumbnailUrl}
            chapters={video.aiChapters}
            isTheaterMode={theaterMode}
            onToggleTheater={() => setTheaterMode(!theaterMode)}
          />

          {/* Title Header */}
          <h1 className="text-lg md:text-xl font-bold font-display text-gray-900 dark:text-white mt-4 leading-snug">
            {video.title}
          </h1>

          {/* Controls toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-805 pb-4 mt-3">
            {/* Publisher panel */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => onNavigate(`/channel/${video.userId}`)}
                className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 shrink-0 cursor-pointer"
              >
                <img src={video.channelAvatar} alt={video.channelName} className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0">
                <div
                  onClick={() => onNavigate(`/channel/${video.userId}`)}
                  className="flex items-center gap-1 font-semibold text-sm text-gray-900 dark:text-white hover:text-[#6C63FF] cursor-pointer transition-colors"
                >
                  <span>{video.channelName}</span>
                  {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#6C63FF] fill-current" />}
                </div>
                <p className="text-xs text-gray-500 truncate">{formatSubscribers(subCount)}</p>
              </div>

              {/* Subscribe controller */}
              <button
                onClick={handleSubscribeToggle}
                className={`ml-3 px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSubscribed
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200"
                    : "bg-[#6C63FF] hover:bg-[#574FEB] text-white shadow-sm shadow-[#6C63FF]/25"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Actions toolbar */}
            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
              {/* Liking evaluations */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200/40 dark:border-gray-700/60 font-mono text-xs font-bold">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    isLiked ? "text-[#FF6584] bg-[#FF6584]/5" : "text-gray-650 dark:text-gray-300"
                  }`}
                  title="Like"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{likesCount}</span>
                </button>

                <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700" />

                <button
                  onClick={handleDislike}
                  className={`px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    isDisliked ? "text-[#FF6584]" : "text-gray-650 dark:text-gray-300"
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>

              {/* Click triggers copy links */}
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-750 dark:text-gray-200 cursor-pointer transition-colors relative"
              >
                <Share2 className="w-4 h-4 text-gray-400" />
                <span>Share</span>

                {showShareModal && (
                  <span className="absolute bottom-11 left-1/2 -translate-x-1/2 w-48 bg-emerald-600 text-white font-sans text-[11px] font-bold p-1 px-2.5 rounded-lg text-center animate-bounce shadow-md">
                    Link Copied to Clipboard!
                  </span>
                )}
              </button>

              <button
                onClick={() => alert("Added to playlist collections.")}
                className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-750 dark:text-gray-200 cursor-pointer transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-gray-300" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* OpenBook AI Summary Generation banner block */}
          <div className="bg-[#6C63FF]/5 border border-[#6C63FF]/15 rounded-2xl p-4 mt-6 flex flex-col gap-3 relative overflow-hidden">
            {/* Visual shine */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#6C63FF]/5 pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#6C63FF]/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6584] animate-pulse" />
                <span className="font-display font-medium text-sm text-[#6C63FF] tracking-tight">OpenBook AI: Highlights Summary</span>
              </div>

              {!aiSummary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={gettingSummary}
                  className="bg-[#6C63FF] hover:bg-[#574FEB] disabled:bg-gray-650 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 shadow-xs shadow-[#6C63FF]/20"
                >
                  {gettingSummary ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Generate instant Hinglish summary</span>
                </button>
              )}
            </div>

            {aiSummary ? (
              <p className="text-xs text-gray-750 dark:text-gray-300 leading-relaxed bg-[#6C63FF]/5 p-3 rounded-xl tracking-wide">
                {aiSummary}
              </p>
            ) : (
              <p className="text-xs text-gray-450 dark:text-gray-400 italic">
                Aap is video ka Hinglish smart summary extract kar sakte hain clicking helper tool above.
              </p>
            )}
          </div>

          {/* Custom collapsible transcript chapters lists */}
          {video.aiChapters && video.aiChapters.length > 0 && (
            <div className="mt-5 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/20 dark:bg-transparent">
              <h4 className="font-display font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                Auto Generated Chapters 📘
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {video.aiChapters.map((ch, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      // Trigger player seek indirectly via ref by finding video element under container
                      const htmlVideo = document.querySelector("video");
                      if (htmlVideo) {
                        const parts = ch.time.split(":");
                        const sVal =
                          parts.length === 3
                            ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
                            : parseInt(parts[0]) * 60 + parseInt(parts[1]);
                        htmlVideo.currentTime = sVal;
                        htmlVideo.play().catch((e) => console.log(e));
                      }
                    }}
                    className="flex justify-between items-center bg-gray-50 hover:bg-[#6C63FF]/10 dark:bg-[#111118]/80 dark:hover:bg-[#191925] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer transition-colors text-xs"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{ch.title}</span>
                    <span className="font-mono font-bold text-xs text-[#6C63FF] px-1.5 py-0.5 rounded bg-[#6C63FF]/10 ml-2">
                      {ch.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Block */}
          <div className="mt-6 bg-[#111118]/50 border border-gray-100 dark:border-gray-850 rounded-2xl p-4">
            <div className="flex gap-4 text-xs font-semibold text-gray-500 mb-2">
              <span className="font-mono">{formatViews(video.views)}</span>
              <span>•</span>
              <span className="font-mono">{new Date(video.createdAt).toLocaleDateString()}</span>
              {video.category && (
                <>
                  <span>•</span>
                  <span className="text-[#6C63FF] uppercase">{video.category}</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-305 leading-relaxed font-sans whitespace-pre-wrap">
              {video.description}
            </p>
          </div>

          {/* CommentSection custom component */}
          <CommentSection videoId={video._id} videoOwnerId={video.userId} />
        </div>

        {/* Dynamic Theater Mode shifting sidebar stack layout (right or below) */}
        <div
          className={`shrink-0 ${
            theaterMode
              ? "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
              : "w-full lg:w-80 flex flex-col gap-4 mt-6 lg:mt-0"
          }`}
        >
          <div className={`col-span-full ${theaterMode ? "pb-2 border-b border-gray-800" : ""}`}>
            <h3 className="font-display font-medium text-xs text-gray-400 uppercase tracking-wider font-semibold">
              More Stories For You
            </h3>
          </div>

          {related.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No related suggestions cataloged.</p>
          ) : (
            related.map((rel) => (
              <div
                key={rel._id}
                onClick={() => onNavigate(`/watch/${rel._id}`)}
                className={`group flex ${
                  theaterMode ? "flex-col" : "flex-row"
                } gap-3 cursor-pointer items-start bg-transparent hover:bg-gray-100/50 dark:hover:bg-[#111118]/30 p-2 rounded-xl transition-colors`}
              >
                {/* Thumbnail */}
                <div
                  className={`relative ${
                    theaterMode ? "w-full aspect-video" : "w-32 aspect-video shrink-0"
                  } rounded-lg overflow-hidden bg-gray-900 border border-gray-150 dark:border-gray-850`}
                >
                  <img src={rel.thumbnailUrl} alt={rel.title} className="w-full h-full object-cover select-none" />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-white font-mono text-[9px] px-1 py-0.2 rounded">
                    {rel.duration ? `${Math.floor(rel.duration / 60)}:${rel.duration % 60 < 10 ? "0" : ""}${rel.duration % 60}` : "0:00"}
                  </span>
                </div>

                {/* Detail */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold font-sans text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#6C63FF] transition-colors">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors truncate">
                    {rel.channelName}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium tracking-tight">
                    <span>{formatViews(rel.views)}</span>
                    <span className="mx-1">•</span>
                    <span>{timeAgo(rel.createdAt)}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
