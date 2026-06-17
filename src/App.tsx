/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./store/AppContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

// Pages
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import Channel from "./pages/Channel";
import Upload from "./pages/Upload";
import Studio from "./pages/Studio";
import Auth from "./pages/Auth";
import Shorts from "./pages/Shorts";
import Subscriptions from "./pages/Subscriptions";
import History from "./pages/History";

// Responsive mobile bottom icons
import { Home as HomeIcon, Zap, Users, History as HistoryIcon, LayoutDashboard } from "lucide-react";

function RootLayout() {
  const { theme, token } = useApp();
  const [currentPage, setCurrentPage] = useState("/");

  // Synchronize dynamic Hash Router configurations
  useEffect(() => {
    const handleHashChange = () => {
      // default fallbacks routing
      const hash = window.location.hash || "#/";
      const cleanPath = hash.substring(1) || "/";
      setCurrentPage(cleanPath);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // initial invoke

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  // Parsing details from cleanPath
  // e.g., /watch/video_123 or /search?q=value
  const renderActivePage = () => {
    const path = currentPage;

    if (path.startsWith("/watch/")) {
      const videoId = path.split("/watch/")[1]?.split("?")[0] || "";
      return <Watch videoId={videoId} onNavigate={navigateTo} />;
    }

    if (path.startsWith("/channel/")) {
      const channelId = path.split("/channel/")[1]?.split("?")[0] || "";
      return <Channel channelId={channelId} onNavigate={navigateTo} />;
    }

    if (path.startsWith("/search")) {
      return <Search onNavigate={navigateTo} />;
    }

    if (path === "/upload") {
      return <Upload onNavigate={navigateTo} />;
    }

    if (path === "/studio") {
      return <Studio />;
    }

    if (path === "/login" || path === "/register") {
      return <Auth onNavigate={navigateTo} />;
    }

    if (path.startsWith("/shorts")) {
      return <Shorts />;
    }

    if (path === "/subscriptions") {
      return <Subscriptions onNavigate={navigateTo} />;
    }

    if (path === "/history") {
      return <History onNavigate={navigateTo} />;
    }

    // Default Home
    return <Home onNavigate={navigateTo} />;
  };

  const isHashActive = (pattern: string) => {
    if (pattern === "/" && currentPage === "/") return true;
    if (pattern !== "/" && currentPage.startsWith(pattern)) return true;
    return false;
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      {/* Dynamic Navigation Header */}
      <Header onNavigate={navigateTo} />

      {/* Main Viewport Content mapping */}
      <div className="flex pt-16 min-h-[calc(100vh-64px)] relative">
        {/* Desk top fixed navigation sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={navigateTo} />

        {/* Dynamic scroll content container */}
        <main className="flex-1 min-w-0 px-4 md:px-6 py-5 md:pl-70 pb-20 md:pb-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Bottom Navigator for responsive mobile screens */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-[#111118]/95 border-t border-gray-200 dark:border-gray-800 md:hidden flex justify-around items-center z-48 backdrop-blur-md select-none">
        <button
          onClick={() => navigateTo("/")}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer ${
            isHashActive("/") ? "text-[#6C63FF]" : "text-gray-400 hover:text-white"
          }`}
        >
          <HomeIcon className="w-4.5 h-4.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => navigateTo("/shorts")}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer ${
            isHashActive("/shorts") ? "text-[#FF6584]" : "text-gray-400 hover:text-white"
          }`}
        >
          <Zap className="w-4.5 h-4.5 fill-current" />
          <span>Shorts</span>
        </button>

        {token && (
          <button
            onClick={() => navigateTo("/subscriptions")}
            className={`flex flex-col items-center gap-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer ${
              isHashActive("/subscriptions") ? "text-[#6C63FF]" : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Subs</span>
          </button>
        )}

        {token && (
          <button
            onClick={() => navigateTo("/history")}
            className={`flex flex-col items-center gap-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer ${
              isHashActive("/history") ? "text-[#6C63FF]" : "text-gray-400 hover:text-white"
            }`}
          >
            <HistoryIcon className="w-4.5 h-4.5" />
            <span>History</span>
          </button>
        )}

        {token && (
          <button
            onClick={() => navigateTo("/studio")}
            className={`flex flex-col items-center gap-1 text-[10px] uppercase font-bold tracking-tight cursor-pointer ${
              isHashActive("/studio") ? "text-[#6C63FF]" : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Studio</span>
          </button>
        )}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootLayout />
    </AppProvider>
  );
}
