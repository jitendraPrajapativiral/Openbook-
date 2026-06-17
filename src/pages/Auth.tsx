/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { LogIn, KeySquare, Mail, UserPlus, Sparkles, LogIn as GoogleIcon, AlertCircle } from "lucide-react";

interface AuthProps {
  onNavigate: (page: string) => void;
}

export default function Auth({ onNavigate }: AuthProps) {
  const { login: finishLoginContext, register: finishRegisterContext } = useApp();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          finishLoginContext(data.token, data.user);
          onNavigate("/");
        } else {
          const data = await res.json();
          setErrorMessage(data.error || "Invalid login credentials! Make sure email and password match.");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, avatar }),
        });

        if (res.ok) {
          const data = await res.json();
          finishRegisterContext(data.token, data.user);
          onNavigate("/");
        } else {
          const data = await res.json();
          setErrorMessage(data.error || "Email already in use, or password criteria not reached.");
        }
      }
    } catch (err) {
      setErrorMessage("Something went wrong with the connection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth flow simulation (with seed users)
  const handleGoogleMockLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "coder@chai.com", password: "password123" }), // using seeded Google login mock
      });
      if (res.ok) {
        const data = await res.json();
        finishLoginContext(data.token, data.user);
        onNavigate("/");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 flex items-center justify-center font-sans animate-fade-in px-4 select-none">
      <div className="bg-white dark:bg-[#111118] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl flex flex-col gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-[#6C63FF]/10 to-[#FF6584]/5 rounded-bl-full pointer-events-none" />

        {/* Title branding header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] rounded-2xl shadow-md text-white mx-auto mb-3.5">
            <span className="text-2xl font-bold">📖</span>
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-gray-950 dark:text-white leading-tight">
            Welcome to OpenBook
          </h2>
          <p className="text-[11px] text-[#6C63FF] font-semibold mt-0.5">"Har video, har kahani — khulke dekho"</p>
        </div>

        {/* Switch tab buttons */}
        <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-colors ${
              activeTab === "login"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Sign In Account
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-colors ${
              activeTab === "register"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Create Channel
          </button>
        </div>

        {/* Error reporting banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl flex items-start gap-2.5 animate-fade-in text-xs text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Inputs forms */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {activeTab === "register" && (
            <>
              {/* Creator Channel Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-display">Channel / User Name</label>
                <div className="relative flex">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={35}
                    placeholder="e.g. Creator Tech"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-950 border border-gray-205 dark:border-gray-850 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Avatar Icon */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-display">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Paste profile URL..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-950 border border-gray-205 dark:border-gray-850 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Email inputs */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 font-display">Email Address</label>
            <div className="relative flex">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-950 border border-gray-205 dark:border-gray-850 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 font-display">Password Secret</label>
            <div className="relative flex">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <KeySquare className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-950 border border-gray-205 dark:border-gray-850 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6C63FF] hover:bg-[#574FEB] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#6C63FF]/20 flex items-center justify-center gap-2 mt-2 disabled:bg-gray-800"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : activeTab === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In Securely</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Channel</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
          <span className="flex-shrink mx-4 text-gray-500 font-mono text-[9px] uppercase font-bold">Or use instant login</span>
          <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
        </div>

        {/* Demo login quick triggers */}
        <button
          onClick={handleGoogleMockLogin}
          className="w-full bg-white dark:bg-transparent hover:bg-gray-150/40 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-100 border border-gray-205 dark:border-gray-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#FF6584] animate-pulse" />
          <span>One-Click Developer Sign-In</span>
        </button>
      </div>
    </div>
  );
}
