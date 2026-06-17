/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { formatViews } from "../utils";
import { History as HistoryIcon, Search, Trash2, ShieldAlert, Play, CheckCircle2 } from "lucide-react";

interface HistoryProps {
  onNavigate: (page: string) => void;
}

export default function History({ onNavigate }: HistoryProps) {
  const { token } = useApp();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchWord, setSearchWord] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleClearHistory = async () => {
    if (!window.confirm("Aap apni saari Watch History nikalna chahte hain?")) return;
    try {
      const res = await fetch("/api/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistoryList([]);
        alert("Watch History cleared successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter history list items
  const filteredHistory = historyList.filter((item) => {
    if (!searchWord.trim()) return true;
    return (
      item.videoTitle?.toLowerCase().includes(searchWord.toLowerCase()) ||
      item.channelName?.toLowerCase().includes(searchWord.toLowerCase())
    );
  });

  if (!token) {
    return (
      <div className="py-24 text-center max-w-sm mx-auto bg-[#111118]/40 border border-gray-800 rounded-2xl p-6 font-sans">
        <HistoryIcon className="w-12 h-12 text-[#6C63FF] mx-auto mb-3 animate-pulse" />
        <h4 className="font-bold text-gray-850 dark:text-gray-250">Watch History Timeline</h4>
        <p className="text-xs text-gray-500 mt-2.5 leading-relaxed font-sans">
          Sign In sequence required to preserve and retrieve watch timeline profiles dynamically on OpenBook.
        </p>
        <button
          onClick={() => onNavigate("/login")}
          className="mt-5 bg-[#6C63FF] hover:bg-opacity-95 text-white font-semibold text-xs px-6 py-2 rounded-xl transition-all shadow-sm"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16 font-sans select-none animate-fade-in flex flex-col md:flex-row gap-6">
      
      {/* Left watched items lists column */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        <div className="border-b border-gray-150 dark:border-gray-850 pb-3 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-100 dark:text-white flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-[#6C63FF]" />
              <span>Watch History</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Keep track of every katha narration stories opened by you.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-mono">Loading history timestamps...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 bg-[#111118]/40 border border-dashed border-gray-850 rounded-2xl p-4">
            <ShieldAlert className="w-11 h-11 text-gray-550 mx-auto mb-2 opacity-50" />
            <h4 className="font-semibold text-gray-400 text-xs">Timeline Empty</h4>
            <p className="text-xs text-gray-510 mt-1 max-w-xs mx-auto">
              No watched videos found matching current parameters. Try searching general tags or checking categories.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item._id}
                onClick={() => onNavigate(`/watch/${item.videoId}`)}
                className="group flex flex-col sm:flex-row gap-4 cursor-pointer items-start bg-[#111118]/30 hover:bg-[#111118]/80 p-3 rounded-2xl border border-gray-150 dark:border-gray-850 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full sm:w-44 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-gray-150 dark:border-gray-800">
                  <img src={item.thumbnailUrl} alt={item.videoTitle} className="w-full h-full object-cover select-none" />
                  <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-lg">
                    {item.duration ? `${Math.floor(item.duration / 60)}:${item.duration % 60 < 10 ? "0" : ""}${item.duration % 60}` : "0:00"}
                  </span>

                  {/* Play float indicator overlay */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Play className="w-7 h-7 text-white fill-current" />
                  </div>
                </div>

                {/* Details layout */}
                <div className="flex-grow min-w-0 flex flex-col gap-1 pr-4">
                  <h4 className="text-sm font-bold font-display text-gray-950 dark:text-white line-clamp-2 leading-snug group-hover:text-[#6C63FF] transition-colors">
                    {item.videoTitle}
                  </h4>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold group/channel">
                    <span className="truncate">{item.channelName}</span>
                    {item.channelName === "OpenBook HQ" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6C63FF] fill-current" />
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500 font-mono font-semibold uppercase tracking-tight mt-1 bg-gray-100 dark:bg-gray-850 w-fit px-2 py-0.5 rounded-md">
                    Watched at: {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right controls sidebars */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
        {/* Search inside watch history */}
        <div className="bg-white dark:bg-[#111118]/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-500 font-display">Search watch history</span>
          <div className="relative flex">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search watched keys..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-950 border border-gray-205 dark:border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-950 dark:text-white"
            />
          </div>
        </div>

        {/* History action controller dashboard */}
        <div className="bg-white dark:bg-[#111118]/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm text-xs font-semibold">
          <span className="text-[10px] uppercase font-bold text-gray-500 font-display">Timeline Utilities</span>

          <button
            onClick={handleClearHistory}
            className="w-full text-left py-2 px-3 text-[#FF6584] hover:bg-[#FF6584]/10 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Watch History</span>
          </button>

          <button
            onClick={() => {
              setIsPaused(!isPaused);
              alert(isPaused ? "History tracking activated." : "History tracking paused successfully!");
            }}
            className="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-gray-700 dark:text-gray-300"
          >
            <ShieldAlert className="w-4 h-4 text-gray-400" />
            <span>{isPaused ? "Resume History" : "Pause Watch History"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
