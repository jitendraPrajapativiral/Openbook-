/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { useApp } from "../store/AppContext";
import {
  Home,
  Compass,
  Zap,
  PlaySquare,
  History,
  ThumbsUp,
  FolderHeart,
  Music,
  Gamepad2,
  Newspaper,
  Trophy,
  Users,
  Film,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { currentUser, token } = useApp();
  const [subscribedCreators, setSubscribedCreators] = useState<any[]>([]);

  // Fetch the subscribed creators list
  useEffect(() => {
    if (token) {
      // Load general channels list and filter based on subs
      const fetchSubs = async () => {
        try {
          const res = await fetch("/api/search?q=", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            // let's fetch creators
            const mockSubscribedCreators = [
              { _id: "user_coder", name: "Chai aur Code", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
              { _id: "user_gamer", name: "Dynamo Gamer", avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80" }
            ];
            setSubscribedCreators(mockSubscribedCreators);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSubs();
    }
  }, [token]);

  const navItems = [
    { label: "Home", page: "/", icon: Home },
    { label: "Trending", page: "/trending", icon: Compass },
    { label: "Shorts", page: "/shorts", icon: Zap },
    { label: "Subscriptions", page: "/subscriptions", icon: Users, authRequired: true },
  ];

  const libraryItems = [
    { label: "History", page: "/history", icon: History, authRequired: true },
    { label: "Liked", page: "/liked", icon: ThumbsUp, authRequired: true },
    { label: "Playlists", page: "/playlists", icon: PlaySquare, authRequired: true },
  ];

  const categoryItems = [
    { label: "Music", page: "/?category=Music", icon: Music },
    { label: "Gaming", page: "/?category=Gaming", icon: Gamepad2 },
    { label: "News", page: "/?category=News", icon: Newspaper },
    { label: "Sports", page: "/?category=Sports", icon: Trophy },
  ];

  const clickNavigate = (page: string) => {
    onNavigate(page);
  };

  const isActive = (page: string) => {
    if (page === "/" && currentPage === "/") return true;
    if (page !== "/" && currentPage.startsWith(page)) return true;
    return false;
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-[#111118] border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto hidden md:block z-45 transition-colors duration-200">
      {/* Primary Links */}
      <div className="space-y-1 pb-4 border-b border-gray-200 dark:border-gray-800">
        {navItems.map((item) => {
          if (item.authRequired && !token) return null;
          const Icon = item.icon;
          const active = isActive(item.page);

          return (
            <button
              key={item.label}
              onClick={() => clickNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-[#6C63FF]/10 text-[#6C63FF]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-[#6C63FF]" : "text-gray-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Library segment */}
      <div className="py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-display">
          Library
        </h3>
        <div className="space-y-1">
          {libraryItems.map((item) => {
            if (item.authRequired && !token) return null;
            const Icon = item.icon;
            const active = isActive(item.page);

            return (
              <button
                key={item.label}
                onClick={() => clickNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#6C63FF]/10 text-[#6C63FF]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-[#6C63FF]" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories segment */}
      <div className="py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-display">
          Explore
        </h3>
        <div className="space-y-1">
          {categoryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.page);

            return (
              <button
                key={item.label}
                onClick={() => clickNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#6C63FF]/10 text-[#6C63FF]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-[#6C63FF]" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Subscriptions segments */}
      {token && subscribedCreators.length > 0 && (
        <div className="py-4">
          <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 font-display">
            Subscriptions
          </h3>
          <div className="space-y-1">
            {subscribedCreators.map((creator) => (
              <button
                key={creator._id}
                onClick={() => clickNavigate(`/channel/${creator._id}`)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors text-left"
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {creator.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer tagline and copyright */}
      <div className="pt-8 px-3 text-[10px] text-gray-400 dark:text-gray-500 space-y-1 font-sans">
        <p className="font-semibold text-gray-600 dark:text-gray-400 font-display">📖 OpenBook</p>
        <p>Har video, har kahani — khulke dekho</p>
        <p className="pt-2">© 2026 OpenBook Project.</p>
      </div>
    </aside>
  );
}
