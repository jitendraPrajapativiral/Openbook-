/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Search, Bell, Moon, Sun, Upload, LogOut, User, Video, LayoutDashboard, Check } from "lucide-react";

interface HeaderProps {
  onSearchSubmit?: (query: string) => void;
  onNavigate?: (page: string) => void;
}

export default function Header({ onSearchSubmit, onNavigate }: HeaderProps) {
  const {
    token,
    currentUser,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotifications,
    markNotificationsRead,
    logout,
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    } else if (onNavigate) {
      onNavigate(`search?q=${encodeURIComponent(localSearch)}`);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
    if (!showNotifications && unreadNotifications > 0) {
      markNotificationsRead();
    }
  };

  const menuNavigation = (page: string) => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    if (onNavigate) onNavigate(page);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#111118] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-50 transition-colors duration-200">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => menuNavigation("/")}>
        <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] rounded-xl shadow-md text-white">
          <span className="text-xl font-bold">📖</span>
        </div>
        <div className="flex items-baseline font-display font-bold text-xl tracking-tight">
          <span className="text-gray-900 dark:text-white">Open</span>
          <span className="text-[#6C63FF]">Book</span>
        </div>
      </div>

      {/* Middle Search Module */}
      <form onSubmit={handleSearchClick} className="flex items-center w-full max-w-xl mx-4">
        <div className="relative w-full flex">
          <input
            type="text"
            placeholder="Search videos, creators, tags..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200/80 focus:bg-white dark:bg-[#1C1C26] dark:hover:bg-[#252533] dark:focus:bg-[#1C1C26] text-gray-900 dark:text-white pl-4 pr-12 py-2 rounded-l-2xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#6C63FF] dark:focus:border-[#6C63FF] text-sm font-medium transition-all duration-150"
          />
          <button
            type="submit"
            className="bg-gray-200 dark:bg-[#252533] hover:bg-gray-300 dark:hover:bg-[#2F2F44] border-y border-r border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 px-6 rounded-r-2xl cursor-pointer flex items-center justify-center transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 relative">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {token && (
          <>
            {/* Upload Launcher link */}
            <button
              onClick={() => menuNavigation("/upload")}
              className="hidden sm:flex items-center gap-2 bg-[#6C63FF]/10 text-[#6C63FF] hover:bg-[#6C63FF]/20 px-3.5 py-1.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>

            {/* Notification bell and badge */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 cursor-pointer relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF6584] text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification drop menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#6C63FF] font-medium hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-500">
                        No new updates found. Subscribe to channels for automatic uploads!
                      </div>
                    ) : (
                      notifications.map((not) => (
                        <div
                          key={not._id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (not.videoId && onNavigate) onNavigate(`/watch/${not.videoId}`);
                          }}
                          className={`p-3 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-start transition-colors ${
                            !not.read ? "bg-[#6C63FF]/5" : ""
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-[#6C63FF] shrink-0 mt-1.5" />
                          <div className="flex-1">
                            <p className="text-gray-800 dark:text-gray-200 leading-snug">{not.message}</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              {new Date(not.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* User avatar menu */}
        {token && currentUser ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 cursor-pointer hover:ring-2 hover:ring-[#6C63FF] transition-all"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden text-sm">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                </div>
                <div className="p-1.5 divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="py-1">
                    <button
                      onClick={() => menuNavigation(`/channel/${currentUser._id}`)}
                      className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Channel</span>
                    </button>
                    <button
                      onClick={() => menuNavigation("/studio")}
                      className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Creator Studio</span>
                    </button>
                    <button
                      onClick={() => menuNavigation("/upload")}
                      className="w-full text-left px-3 py-2 sm:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span>Upload Video</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-[#FF6584] hover:bg-[#FF6584]/10 rounded-xl cursor-pointer flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => menuNavigation("/login")}
            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#574FEB] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-[#6C63FF]/20"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
