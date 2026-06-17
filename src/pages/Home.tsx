/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import VideoCard from "../components/VideoCard";
import { CATEGORIES, formatViews } from "../utils";
import { Sparkles, ArrowRight, Zap, TrendingUp, Compass, Volume2 } from "lucide-react";
import { Video } from "../types";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { activeCategory, setActiveCategory, token, currentUser } = useApp();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const catQuery = activeCategory === "All" ? "" : `&category=${activeCategory}`;
      const res = await fetch(`/api/videos?isShort=false${catQuery}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeCategory]);

  // Seperating specific sections requested:
  // 1. Trending section (videos with highest views)
  const trendingVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);

  // 2. Shorts section
  const [shorts, setShorts] = useState<Video[]>([]);
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await fetch("/api/videos?isShort=true");
        if (res.ok) {
          const data = await res.json();
          setShorts(data.videos || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchShorts();
  }, []);

  const handleVideoSelect = (videoId: string) => {
    onNavigate(`/watch/${videoId}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans animate-fade-in">
      {/* 1. Category Filter Chips (Horizontal swipe-scroll) */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none select-none -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-150 border uppercase ${
              activeCategory === cat
                ? "bg-[#6C63FF] text-white border-[#6C63FF] shadow-sm shadow-[#6C63FF]/15"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-[#111118] dark:hover:bg-[#1A1A26] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. AI Recommendation Banner (Uniquely branded premium component) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#6C63FF] via-[#574FEB] to-[#FF6584] p-5 md:p-6 text-white shadow-lg select-none">
        {/* Background visual shapes */}
        <div className="absolute right-0 top-0 bottom-0 opacity-15 hidden md:block">
          <svg width="400" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-bold font-display backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6584] animate-spin" />
            <span>OpenBook Smart AI Feed</span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight leading-tight">
            {currentUser ? `Namaste, ${currentUser.name}! ` : "Apna naya favorite topic search karein."}
            Har story, har video bina bounds ke explore karo!
          </h2>
          
          <p className="text-xs text-white/80 leading-relaxed max-w-md">
            AI recommendations are generating summaries dynamically based on your watched playlists. No complex algorithm limits, view content freely!
          </p>

          <div className="flex gap-3 mt-1.5">
            <button
              onClick={() => onNavigate("/shorts")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#FF6584] fill-current" />
              <span>Watch Shorts</span>
            </button>
            <button
              onClick={() => onNavigate("/trending")}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Explore Trending
            </button>
          </div>
        </div>
      </div>

      {/* 3. Trending Shelves (Horizontal scroll) */}
      {activeCategory === "All" && trendingVideos.length > 0 && (
        <div className="flex flex-col gap-3 bg-[#111118]/20 dark:bg-transparent -mx-4 px-4 py-4 md:m-0 md:p-0 rounded-2xl">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-5 h-5 text-[#FF6584]" />
              <span>Trending Keynotes</span>
            </h3>
            <button
              onClick={() => onNavigate("/trending")}
              className="text-xs font-semibold text-[#6C63FF] hover:underline flex items-center gap-1"
            >
              <span>See more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {trendingVideos.slice(0, 4).map((vid) => (
              <VideoCard
                key={vid._id}
                video={vid}
                onClick={() => handleVideoSelect(vid._id)}
                onNavigateDetail={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Shorts Row (Horizontally centered cards) */}
      {shorts.length > 0 && (
        <div className="flex flex-col gap-3 mt-2 border-t border-b border-gray-100 dark:border-gray-900/40 py-5">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <Zap className="w-5 h-5 text-[#FF6584] fill-current animate-bounce" />
              <span>OpenBook Shorts Shelf</span>
            </h3>
            <button
              onClick={() => onNavigate("/shorts")}
              className="text-xs font-semibold text-[#6C63FF] hover:underline flex items-center gap-1"
            >
              <span>Swipe vertical</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {shorts.slice(0, 5).map((sh) => (
              <div
                key={sh._id}
                onClick={() => onNavigate(`/shorts?id=${sh._id}`)}
                className="group cursor-pointer flex flex-col gap-2 rounded-xl overflow-hidden relative shadow-sm hover:translate-y-[-2px] transition-transform"
              >
                <div className="aspect-[9/16] w-full bg-gray-900 rounded-xl overflow-hidden relative">
                  <img src={sh.thumbnailUrl} alt={sh.title} className="w-full h-full object-cover select-none" />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white font-mono text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {formatViews(sh.views)}
                  </span>
                  
                  {/* Hover play preview symbol on shorts items */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Zap className="w-8 h-8 text-[#FF6584] fill-current" />
                  </div>
                </div>
                <h4 className="font-sans font-semibold text-xs text-gray-900 dark:text-white leading-tight line-clamp-2 px-1 group-hover:text-[#6C63FF] transition-colors">
                  {sh.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Recommended Feed Grid (Infinite list) */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-bold text-base text-gray-900 dark:text-white px-1">
          {activeCategory === "All" ? "Recommended For You" : `${activeCategory} Videos`}
        </h3>

        {loading ? (
          <div className="py-20 text-center flex flex-col gap-3 items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-mono">Loading OpenBook channels catalog...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 bg-[#111118]/40 rounded-2xl border border-gray-150/40 dark:border-gray-850/40">
            <Compass className="w-12 h-12 text-[#6C63FF] mx-auto mb-3 opacity-60 animate-bounce" />
            <h4 className="font-bold text-gray-800 dark:text-gray-200">No videos found</h4>
            <p className="text-xs text-gray-500 mt-1">Is category me abhi tak koi public formats uploads nahi hain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onClick={() => handleVideoSelect(video._id)}
                onNavigateDetail={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
