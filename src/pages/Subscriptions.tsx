/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import VideoCard from "../components/VideoCard";
import { Users, Compass, Calendar, AlertCircle } from "lucide-react";
import { Video } from "../types";

interface SubscriptionsProps {
  onNavigate: (page: string) => void;
}

export default function Subscriptions({ onNavigate }: SubscriptionsProps) {
  const { token, currentUser } = useApp();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribedVideos = async () => {
    if (!token) return;
    setLoading(true);

    try {
      // Fetch all public video catalogues
      const res = await fetch("/api/videos?isShort=false");
      if (res.ok) {
        const data = await res.json();
        // Categorize into timeline slots (seeded subscribers creator filters)
        // Creator list seeded user ids: coder_chai, user_gaming, openbook_hq etc.
        const subscribedUserIds = ["user_coder", "user_gamer", "openbook_hq"];
        const filtered = (data.videos || []).filter((vid: Video) =>
          subscribedUserIds.includes(vid.userId) || vid.channelName === "OpenBook HQ"
        );
        setVideos(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedVideos();
  }, [token]);

  if (!token) {
    return (
      <div className="py-24 text-center max-w-sm mx-auto bg-[#111118]/40 border border-gray-800 rounded-2xl p-6 font-sans">
        <Users className="w-12 h-12 text-[#6C63FF] mx-auto mb-3 animate-pulse" />
        <h4 className="font-bold text-gray-850 dark:text-gray-250">Subscriptions Feed</h4>
        <p className="text-xs text-gray-500 mt-2.5 leading-relaxed font-sans">
          Mulaqat karein apno se! Subscribe to official channels after signing in, and track direct feeds of newly published stories here.
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

  // Divide chronological lists
  const todayVideos = videos.slice(0, 2);
  const olderVideos = videos.slice(2);

  return (
    <div className="pb-16 font-sans select-none animate-fade-in flex flex-col gap-6">
      <div className="border-b border-gray-150 dark:border-gray-850 pb-3 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold font-display text-gray-950 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6C63FF]" />
            <span>Latest From Subscriptions</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Chronological updates from creators you subscribe on OpenBook.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-mono">Tracing creators databases schedules...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-[#111118]/50 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <h4 className="font-bold text-gray-800 dark:text-gray-200">No newly released videos</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Jin channels ko aapne subscribe kiya hai, unhone abhi tak koi public formats uploads nahi kiye hain. Home par explore karein.
          </p>
          <button
            onClick={() => onNavigate("/")}
            className="mt-4 bg-[#6C63FF] text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors shrink-0"
          >
            Explore Home Feed
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Today Block */}
          {todayVideos.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display font-medium text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-1.5">
                <span>Today</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {todayVideos.map((vid) => (
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

          {/* Earlier Block */}
          {olderVideos.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display font-medium text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-1.5">
                <span>This Week / Earlier</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {olderVideos.map((vid) => (
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
