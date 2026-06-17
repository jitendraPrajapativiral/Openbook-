/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Video, Notification } from "../types";

interface AppContextType {
  token: string | null;
  currentUser: User | null;
  theme: "dark" | "light";
  searchQuery: string;
  activeCategory: string;
  notifications: Notification[];
  unreadNotifications: number;
  loadingAuth: boolean;
  
  toggleTheme: () => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (cat: string) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  loginWithGoogle: (name: string, email: string, googleId: string, avatar: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string; channelName?: string; channelDescription?: string; avatar?: string; channelBanner?: string }) => Promise<User>;
  refreshUser: () => Promise<void>;
  
  fetchNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("openbook_token"));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">((localStorage.getItem("openbook_theme") as "dark" | "light") || "dark");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Apply theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("openbook_theme", theme);
  }, [theme]);

  // Fetch logged in profile details
  const refreshUser = async () => {
    if (!token) {
      setCurrentUser(null);
      setLoadingAuth(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("openbook_user", JSON.stringify(data.user));
      } else {
        // Token expired/invalid
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem("openbook_token");
        localStorage.removeItem("openbook_user");
      }
    } catch (err) {
      console.error("Auth me check failed", err);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  // Notifications loader helper
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // poll notifications
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const markNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login credentials check failed");
    }

    setToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem("openbook_token", data.token);
    localStorage.setItem("openbook_user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Form validation error");
    }

    setToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem("openbook_token", data.token);
    localStorage.setItem("openbook_user", JSON.stringify(data.user));
    return data.user;
  };

  const loginWithGoogle = async (name: string, email: string, googleId: string, avatar: string): Promise<User> => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, googleId, avatar }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error("Google login failed");
    }

    setToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem("openbook_token", data.token);
    localStorage.setItem("openbook_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("openbook_token");
    localStorage.removeItem("openbook_user");
  };

  const updateProfile = async (data: { name?: string; channelName?: string; channelDescription?: string; avatar?: string; channelBanner?: string }): Promise<User> => {
    if (!token) throw new Error("Auth required");
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || "Profile update failed");
    }

    setCurrentUser(body.user);
    localStorage.setItem("openbook_user", JSON.stringify(body.user));
    return body.user;
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        token,
        currentUser,
        theme,
        searchQuery,
        activeCategory,
        notifications,
        unreadNotifications,
        loadingAuth,
        toggleTheme,
        setSearchQuery,
        setActiveCategory,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser,
        fetchNotifications,
        markNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
}
