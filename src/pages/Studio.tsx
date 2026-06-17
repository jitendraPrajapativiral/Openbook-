/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { formatViews } from "../utils";
import {
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  PlaySquare,
  Trash2,
  Calendar,
  Sparkles,
  LayoutDashboard,
  Eye,
  Settings,
} from "lucide-react";
import { Video } from "../types";

export default function Studio() {
  const { token, currentUser } = useApp();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytical Metrics aggregates
  const [totalViews, setTotalViews] = useState(0);
  const [channelSubs, setChannelSubs] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [revenue, setRevenue] = useState(0);

  // Graph state interaction
  const [selectedDay, setSelectedDay] = useState<{ day: number; views: number } | null>(null);

  // Mock graph data coordinates (30 days of analytics)
  const graphAnalytics = [
    { day: 1, views: 230 }, { day: 3, views: 310 }, { day: 5, views: 420 },
    { day: 7, views: 350 }, { day: 9, views: 490 }, { day: 11, views: 610 },
    { day: 13, views: 520 }, { day: 15, views: 730 }, { day: 17, views: 820 },
    { day: 19, views: 950 }, { day: 21, views: 890 }, { day: 23, views: 1120 },
    { day: 25, views: 1240 }, { day: 27, views: 1450 }, { day: 29, views: 1840 },
  ];

  const fetchChannelData = async () => {
    if (!token || !currentUser) return;
    setLoading(true);

    try {
      // 1. Fetch channel owner details
      const uRes = await fetch(`/api/users/${currentUser._id}`);
      if (uRes.ok) {
        const uData = await uRes.json();
        setChannelSubs(uData.subscriberCount || 0);
      }

      // 2. Fetch owned videos list
      const vRes = await fetch(`/api/videos?userId=${currentUser._id}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        const list: Video[] = vData.videos || [];
        setVideos(list);

        // Summarize KPI metrics from videos array
        const viewsCount = list.reduce((sum, item) => sum + (item.views || 0), 0);
        setTotalViews(viewsCount);

        // Simulated hours and dollar parameters
        setTotalHours(Math.floor(viewsCount * 0.08) + 12);
        setRevenue(parseFloat((viewsCount * 0.0025).toFixed(2)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [token, currentUser]);

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Zaroor delete karna chahte hain? Video local storage and feeds se nikal jayega.")) return;

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Video deleted successfully!");
        fetchChannelData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create SVG path coords automatically based on graphAnalytics list
  const maxViews = Math.max(...graphAnalytics.map((g) => g.views));
  const svgWidth = 600;
  const svgHeight = 180;
  const points = graphAnalytics.map((g, index) => {
    const x = (index / (graphAnalytics.length - 1)) * svgWidth;
    const y = svgHeight - (g.views / maxViews) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  // Closed polygon path for shaded Area effect
  const areaPath = `0,${svgHeight} ${points} ${svgWidth},${svgHeight}`;

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-mono">Loading OpenBook analytics logs...</p>
      </div>
    );
  }

  return (
    <div className="pb-16 font-sans select-none animate-fade-in flex flex-col gap-6">
      <div className="border-b border-gray-150 dark:border-gray-850 pb-3 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-gray-950 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#6C63FF]" />
            <span>OpenBook Creator Studio</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, {currentUser?.name}! Apna channel health track karein.</p>
        </div>

        <span className="bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/25 font-bold font-mono text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Partner</span>
        </span>
      </div>

      {/* 1. KPIs cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex gap-3 shadow-2xs">
          <div className="w-10 h-10 bg-[#6C63FF]/15 text-[#6C63FF] rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Views</span>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5 block">
              {formatViews(totalViews)}
            </span>
          </div>
        </div>

        {/* Total Subscribers */}
        <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex gap-3 shadow-2xs">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subscribers</span>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5 block">
              {channelSubs}
            </span>
          </div>
        </div>

        {/* Watch Hours */}
        <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex gap-3 shadow-2xs">
          <div className="w-10 h-10 bg-[#FF6584]/15 text-[#FF6584] rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Watch hours</span>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5 block">
              {totalHours} hrs
            </span>
          </div>
        </div>

        {/* Estimated revenue */}
        <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex gap-3 shadow-2xs">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Profit</span>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5 block">
              ${revenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Last 30 Day Analytical Graph (Bespoke pristine interactive SVG Area Chart) */}
      <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Viewership Trends (Last 30 Days)</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Tap on coordinates nodes to trace peaks</p>
          </div>

          {selectedDay && (
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[10px] px-2.5 py-1 rounded-lg">
              Day {selectedDay.day}: <strong>{selectedDay.views} views</strong>
            </span>
          )}
        </div>

        {/* Chart stage */}
        <div className="w-full h-44 overflow-hidden relative mt-2">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            {/* Horizontal helper lines */}
            <line x1="0" y1="30" x2={svgWidth} y2="30" stroke="#252533" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="0" y1="90" x2={svgWidth} y2="90" stroke="#252533" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="0" y1="150" x2={svgWidth} y2="150" stroke="#252533" strokeDasharray="3,3" strokeWidth="0.5" />

            {/* Closed shaded gradient path */}
            <polygon points={areaPath} fill="url(#blueGrad)" className="opacity-15" />

            {/* Bright Line path */}
            <polyline fill="none" stroke="#6C63FF" strokeWidth="2.5" points={points} strokeLinecap="round" />

            {/* Nodes dots with interaction */}
            {graphAnalytics.map((g, index) => {
              const x = (index / (graphAnalytics.length - 1)) * svgWidth;
              const y = svgHeight - (g.views / maxViews) * (svgHeight - 20) - 10;

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4.5"
                  className="fill-[#FF6584] hover:fill-[#6C63FF] hover:r-6 cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setSelectedDay(g)}
                  onClick={() => setSelectedDay(g)}
                />
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#0A0A0F" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 3. Owned videos list tables */}
      <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex border-b border-gray-100 dark:border-gray-850 pb-3 justify-between items-center flex-wrap gap-2">
          <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Uploaded Content Catalog</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{videos.length} videos published</span>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <PlaySquare className="w-12 h-12 text-[#6C63FF]/60 mb-2 animate-bounce" />
            <h4 className="font-bold text-gray-400 text-xs">No uploaded videos</h4>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
              Mulaqat katha videos uploading dashboard se post karein tabhi yahan list view generate hoga!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-650 dark:text-gray-350 min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 text-gray-400 font-display font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Video Information</th>
                  <th className="py-3 px-2">Duration</th>
                  <th className="py-3 px-2">Views</th>
                  <th className="py-3 px-2">Publication Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                {videos.map((vid) => (
                  <tr key={vid._id} className="hover:bg-[#1C1C26]/30 transition-colors">
                    <td className="py-3.5 px-2 flex gap-3 max-w-xs">
                      {/* thumbnail */}
                      <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-gray-150 dark:border-gray-800">
                        <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate" title={vid.title}>
                          {vid.title}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase mt-0.5 font-mono">{vid.category || "General"}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 font-mono">
                      {Math.floor(vid.duration / 60)}:{vid.duration % 60 < 10 ? "0" : ""}{vid.duration % 60}
                    </td>

                    <td className="py-3.5 px-2 font-mono font-bold text-gray-800 dark:text-gray-200">
                      {vid.views}
                    </td>

                    <td className="py-3.5 px-2 text-gray-400 font-mono">
                      {new Date(vid.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={(e) => handleDeleteVideo(vid._id, e)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                        title="Delete video forever"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
