/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import VideoCard from "../components/VideoCard";
import { Search as SearchIcon, SlidersHorizontal, CheckCircle2, Compass, AlertCircle, Sparkles } from "lucide-react";
import { Video } from "../types";

interface SearchProps {
  onNavigate: (page: string) => void;
}

export default function Search({ onNavigate }: SearchProps) {
  const { searchQuery, setSearchQuery, token } = useApp();
  const [results, setResults] = useState<{ channels: any[]; videos: Video[] }>({ channels: [], videos: [] });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter Select states
  const [filterDate, setFilterDate] = useState("all"); // all, hour, day, week, month, year
  const [filterType, setFilterType] = useState("all"); // all, video, channel
  const [filterDuration, setFilterDuration] = useState("all"); // all, short, medium, long
  const [filterSort, setFilterSort] = useState("relevance"); // relevance, date, views, rating

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const qVal = encodeURIComponent(searchQuery);
      const res = await fetch(
        `/api/search?q=${qVal}&type=${filterType}&sort=${filterSort}&duration=${filterDuration}&date=${filterDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults({
          channels: data.channels || [],
          videos: data.videos || [],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, filterDate, filterType, filterDuration, filterSort]);

  // Handle Channel subscriptions status
  const handleChannelSubscribe = async (e: React.MouseEvent, channelId: string, isSubscribedNow: boolean) => {
    e.stopPropagation();
    if (!token) {
      alert("Registration or Sign In sequence required to subscribe to channels.");
      return;
    }

    try {
      const method = isSubscribedNow ? "DELETE" : "POST";
      const res = await fetch(`/api/channels/${channelId}/subscribe`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchSearchResults(); // reload items view
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans select-none animate-fade-in">
      {/* Search description bar & Filters toggler */}
      <div className="flex justify-between items-center bg-white dark:bg-[#111118]/80 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 gap-4">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase font-display block">Results Search Feed</span>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
            Searched for: <strong className="text-[#6C63FF]">"{searchQuery || "All Videos"}"</strong>
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer transition-colors ${
            showFilters
              ? "bg-[#6C63FF]/10 border-[#6C63FF]/30 text-[#6C63FF]"
              : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Collapsible search filtration menu panel */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 animate-fade-in text-xs font-semibold">
          {/* 1. Date filters */}
          <div className="flex flex-col gap-2">
            <h5 className="text-gray-400 uppercase text-[10px] tracking-wider mb-1 font-display">Upload Date</h5>
            {[
              { val: "all", label: "Anytime" },
              { val: "hour", label: "Last hour" },
              { val: "day", label: "Today" },
              { val: "week", label: "This week" },
              { val: "month", label: "This month" },
              { val: "year", label: "This year" },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setFilterDate(d.val)}
                className={`text-left py-1 hover:text-[#6C63FF] transition-colors cursor-pointer ${
                  filterDate === d.val ? "text-[#6C63FF] font-bold" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* 2. Type filters */}
          <div className="flex flex-col gap-2">
            <h5 className="text-gray-400 uppercase text-[10px] tracking-wider mb-1 font-display">Product Type</h5>
            {[
              { val: "all", label: "All Formats" },
              { val: "video", label: "Videos" },
              { val: "channel", label: "Channels" },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setFilterType(t.val)}
                className={`text-left py-1 hover:text-[#6C63FF] transition-colors cursor-pointer ${
                  filterType === t.val ? "text-[#6C63FF] font-bold" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 3. Duration ranges */}
          <div className="flex flex-col gap-2">
            <h5 className="text-gray-400 uppercase text-[10px] tracking-wider mb-1 font-display">Duration</h5>
            {[
              { val: "all", label: "Any length" },
              { val: "short", label: "Short (< 4 minutes)" },
              { val: "medium", label: "Medium (4 - 20 mins)" },
              { val: "long", label: "Long (> 20 minutes)" },
            ].map((dur) => (
              <button
                key={dur.val}
                onClick={() => setFilterDuration(dur.val)}
                className={`text-left py-1 hover:text-[#6C63FF] transition-colors cursor-pointer ${
                  filterDuration === dur.val ? "text-[#6C63FF] font-bold" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          {/* 4. Sort controls */}
          <div className="flex flex-col gap-2">
            <h5 className="text-gray-400 uppercase text-[10px] tracking-wider mb-1 font-display">Sort By</h5>
            {[
              { val: "relevance", label: "Relevance" },
              { val: "date", label: "Upload Date" },
              { val: "views", label: "View Count" },
              { val: "rating", label: "Creator Rating" },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setFilterSort(s.val)}
                className={`text-left py-1 hover:text-[#6C63FF] transition-colors cursor-pointer ${
                  filterSort === s.val ? "text-[#6C63FF] font-bold" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Results Display */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-mono">Filtering OpenBook index catalog...</span>
        </div>
      ) : results.channels.length === 0 && results.videos.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 dark:bg-[#111118]/50 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-xl mx-auto w-full">
          <AlertCircle className="w-12 h-12 text-[#FF6584] mx-auto mb-3" />
          <h4 className="font-bold text-gray-800 dark:text-gray-200 font-display">Koyi items nahi mile!</h4>
          <p className="text-xs text-gray-510 mt-1.5 px-6 leading-relaxed">
            Humne search filter maps apply kiya, lekin matching channels ya videos listed nahi hain. Ek bar search term simplify karein ya filters clean karein.
          </p>
          <button
            onClick={() => {
              setFilterDate("all");
              setFilterType("all");
              setFilterDuration("all");
              setFilterSort("relevance");
              setSearchQuery("");
            }}
            className="mt-5 bg-[#6C63FF] hover:bg-opacity-90 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Clear Filters & Reload
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Matched Channel Result Cards */}
          {results.channels.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display border-b border-gray-100 dark:border-gray-850 pb-2">
                Channels
              </h4>
              <div className="space-y-3.5">
                {results.channels.map((chan) => (
                  <div
                    key={chan._id}
                    onClick={() => onNavigate(`/channel/${chan._id}`)}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 sm:p-5 hover:border-[#6C63FF]/30 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-gray-200/80 dark:border-gray-800 bg-gray-100 group-hover:scale-105 transition-transform">
                        <img src={chan.avatar} alt={chan.channelName} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <h4 className="font-display font-semibold text-sm text-gray-900 dark:text-white hover:text-[#6C63FF]">
                            {chan.channelName}
                          </h4>
                          {(chan.channelName === "OpenBook HQ" || chan.channelName === "Chai aur Code") && (
                            <CheckCircle2 className="w-4 h-4 text-[#6C63FF] fill-current shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {chan.subscriberCount} subscriber levels
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 leading-snug">
                          {chan.channelDescription}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleChannelSubscribe(e, chan._id, false)}
                      className="bg-[#6C63FF] hover:bg-[#574FEB] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer w-full sm:w-auto text-center"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Video Result Grid */}
          {results.videos.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display border-b border-gray-100 dark:border-gray-850 pb-2">
                Videos Matching Search
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-1">
                {results.videos.map((vid) => (
                  <VideoCard
                    key={vid._id}
                    video={vid}
                    onClick={() => onNavigate(`/watch/${vid._id}`)}
                    onNavigateDetail={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
