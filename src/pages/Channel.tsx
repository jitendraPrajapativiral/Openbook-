/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import VideoCard from "../components/VideoCard";
import { CheckCircle2, Video as VideoIcon, Compass, User, Users, Calendar, MapPin, Sparkles } from "lucide-react";
import { Video } from "../types";

interface ChannelProps {
  channelId: string;
  onNavigate: (page: string) => void;
}

export default function Channel({ channelId, onNavigate }: ChannelProps) {
  const { token, currentUser } = useApp();
  const [profile, setProfile] = useState<any | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"videos" | "playlists" | "community" | "about">("videos");
  const [sortBy, setSortBy] = useState<"latest" | "views" | "oldest">("latest");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Community posts states
  const [communityText, setCommunityText] = useState("");
  const [communityPosts, setCommunityPosts] = useState<any[]>([
    {
      id: "post_1",
      author: "OpenBook HQ",
      avatar: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80",
      content: "Namaskar OpenBook family! 📖 Hum jald hi Creator Grants and analytics live karne wale hain. Platform ka use karke khulke apni katha-vacha uploads karein! Stay tuned!",
      likes: 42,
      date: "2 days ago",
    },
  ]);

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      // Fetch channel owner metadata
      const res = await fetch(`/api/users/${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSubscriberCount(data.subscriberCount || 0);

        // Fetch subscription status
        if (token) {
          const sRes = await fetch(`/api/subscriptions/status/${channelId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (sRes.ok) {
            const sData = await sRes.json();
            setIsSubscribed(sData.subscribed);
          }
        }
      }

      // Fetch owned videos list
      const vRes = await fetch(`/api/videos?userId=${channelId}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVideos(vData.videos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchProfileDetails();
    }
  }, [channelId, token, currentUser]);

  const handleSubscribeToggle = async () => {
    if (!token) {
      alert("Registration or login required to subscribe!");
      return;
    }
    if (currentUser?._id === channelId) {
      alert("Aap apne channel ko subscribe nahi kar sakte!");
      return;
    }

    try {
      const method = isSubscribed ? "DELETE" : "POST";
      const res = await fetch(`/api/channels/${channelId}/subscribe`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsSubscribed(!isSubscribed);
        setSubscriberCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sort Videos
  const sortedVideos = [...videos].sort((a, b) => {
    if (sortBy === "views") {
      return b.views - a.views;
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handlePostCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityText.trim()) return;

    const newPost = {
      id: `post_${Date.now()}`,
      author: profile?.name || "My Channel",
      avatar: profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      content: communityText,
      likes: 0,
      date: "Just now",
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setCommunityText("");
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-mono">Retrieving Channel dashboard metrics...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 bg-[#111118]/40 border border-gray-800 rounded-2xl max-w-lg mx-auto">
        <h4 className="font-bold text-gray-400">Channel Profile Not Found</h4>
        <p className="text-xs text-gray-500 mt-2">Could not retrieve channel statistics on local database.</p>
        <button
          onClick={() => onNavigate("/")}
          className="mt-4 bg-[#6C63FF] font-semibold text-xs px-5 py-2 rounded-xl text-white cursor-pointer"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const isVerified = profile.name === "OpenBook HQ" || profile.name === "Chai aur Code";

  return (
    <div className="flex flex-col pb-12 font-sans select-none animate-fade-in">
      {/* 1. Cover Graphic container */}
      <div className="h-28 sm:h-44 w-full bg-gradient-to-r from-[#6C63FF]/30 via-[#FF6584]/20 to-[#6C63FF]/10 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-850">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black" />
        {/* Floating Tagline badge inside banner */}
        <div className="absolute right-4 bottom-4 bg-[#0A0A0F]/80 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-gray-800 text-[10px] sm:text-xs text-white uppercase tracking-wider font-bold shadow-sm font-display">
          Tagline: "{profile.tagline || "Khulke Dekho"}"
        </div>
      </div>

      {/* 2. Avatar profile header section */}
      <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left justify-between gap-5 mt-5 px-3">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shrink-0 border-4 border-white dark:border-[#0A0A0F] shadow-md -mt-8 sm:-mt-12 bg-white relative z-10 transition-transform hover:scale-103">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold font-display text-gray-950 dark:text-white leading-tight">
                {profile.name}
              </h2>
              {isVerified && <CheckCircle2 className="w-5 h-5 text-[#6C63FF] fill-current" />}
            </div>

            <p className="text-xs text-gray-500 font-mono mt-1">
              <span>{profile.email}</span>
              <span className="mx-2">•</span>
              <strong className="text-gray-900 dark:text-gray-300 font-bold">{subscriberCount} subscribers</strong>
              <span className="mx-2">•</span>
              <span>{videos.length} public uploads</span>
            </p>

            <p className="text-xs text-gray-450 dark:text-gray-400 mt-2 line-clamp-2 max-w-xl leading-relaxed">
              {profile.channelDescription || "Humare channel ke videos ko enjoy karein aur khulke support karein!"}
            </p>
          </div>
        </div>

        {/* Subscribe Trigger button */}
        <div className="flex items-center gap-2.5 shrink-0 self-center md:self-start mt-2">
          {currentUser && currentUser._id === channelId ? (
            <button
              onClick={() => onNavigate("/studio")}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Go to Studio
            </button>
          ) : (
            <button
              onClick={handleSubscribeToggle}
              className={`font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm ${
                isSubscribed
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200"
                  : "bg-[#6C63FF] hover:bg-[#574FEB] text-white shadow-[#6C63FF]/20"
              }`}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      {/* 3. Navigation profile tabs header */}
      <div className="flex border-b border-gray-150 dark:border-gray-800 mt-6 select-none overflow-x-auto scrollbar-none">
        {[
          { id: "videos", label: "My Videos" },
          { id: "community", label: "Community Postings" },
          { id: "about", label: "About Creator" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 font-display uppercase tracking-wider cursor-pointer ${
              activeTab === tab.id
                ? "border-[#6C63FF] text-[#6C63FF]"
                : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content panel */}
      <div className="mt-6">
        {activeTab === "videos" && (
          <div className="flex flex-col gap-5">
            {/* Sort toolbar */}
            <div className="flex justify-between items-center bg-gray-50 dark:bg-[#111118]/30 border border-gray-150 dark:border-gray-850 rounded-2xl p-3.5 px-4">
              <span className="text-xs text-gray-500 font-medium font-sans">
                Browse videos ({videos.length} items found)
              </span>

              <div className="flex items-center gap-1.5">
                {[
                  { id: "latest", label: "Latest" },
                  { id: "views", label: "Most Viewed" },
                  { id: "oldest", label: "Oldest" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`text-[10px] md:text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      sortBy === s.id
                        ? "bg-[#6C63FF] text-white"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {sortedVideos.length === 0 ? (
              <div className="text-center py-20 bg-gray-100/30 dark:bg-transparent rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
                <VideoIcon className="w-12 h-12 text-[#6C63FF]/60 mx-auto mb-2 animate-pulse" />
                <h4 className="font-bold text-gray-400">No uploads found</h4>
                <p className="text-xs text-gray-500 mt-1">Is content creator ne abhi tak koi public videos share nahi kiye hain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedVideos.map((vid) => (
                  <VideoCard
                    key={vid._id}
                    video={vid}
                    onClick={() => onNavigate(`/watch/${vid._id}`)}
                    onNavigateDetail={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "community" && (
          <div className="flex flex-col gap-5 max-w-2xl mx-auto">
            {/* Create community post if am owner */}
            {currentUser && currentUser._id === channelId && (
              <form onSubmit={handlePostCommunity} className="bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6584] animate-spin" />
                  <span className="text-xs font-semibold text-gray-500">Post a community update to your subscribers</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={400}
                  placeholder="Ask a question or share exclusive news/updates... (Hinglish/English)"
                  value={communityText}
                  onChange={(e) => setCommunityText(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1C1C26] text-xs p-3.5 rounded-xl border border-gray-250 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white resize-none"
                />
                <button
                  type="submit"
                  disabled={!communityText.trim()}
                  className="bg-[#6C63FF] hover:bg-opacity-95 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer self-end px-5 disabled:opacity-40"
                >
                  Post Update
                </button>
              </form>
            )}

            {/* Render post items */}
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-[#111118]/80 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 sm:p-5 shadow-xs flex gap-4">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border bg-gray-100">
                    <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white leading-none">{post.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{post.date}</span>
                    </div>

                    <p className="text-xs sm:text-xs text-gray-700 dark:text-gray-300 mt-2.5 leading-relaxed bg-gray-50/10 dark:bg-transparent rounded-xl">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-[11px] text-gray-500 font-semibold cursor-pointer">
                      <span className="hover:text-[#FF6584]">❤️ Like update ({post.likes || 0})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-white dark:bg-[#111118]/80 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 max-w-xl mx-auto flex flex-col gap-6 text-xs text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
            <div>
              <h4 className="font-display font-semibold text-gray-900 dark:text-white text-sm mb-2 uppercase tracking-wider">
                About the Channel
              </h4>
              <p className="tracking-wide">
                {profile.channelDescription ||
                  "A passionate creator sharing stories with the OpenBook community. Support us by liking, commenting, and staying subscribed!"}
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex flex-col gap-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans font-semibold">Tagline statement:</span>
                <span className="text-[#6C63FF] font-bold">"{profile.tagline || "Har Kahani Khulke Dekho"}"</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans font-semibold">Subscriber Levels:</span>
                <span className="text-gray-900 dark:text-white font-bold">{subscriberCount} level accounts</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/65 pt-2.5">
                <span className="text-gray-400 font-sans font-semibold">Channel verification:</span>
                <span className="text-emerald-500 font-bold">{isVerified ? "Verified Official Account" : "Registered Creator"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
