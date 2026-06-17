/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1).replace(/\.0$/, "")}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1).replace(/\.0$/, "")}K views`;
  }
  return `${views} views`;
}

export function formatSubscribers(subs: number): string {
  if (subs >= 1000000) {
    return `${(subs / 1000000).toFixed(1).replace(/\.0$/, "")}M subscribers`;
  }
  if (subs >= 1000) {
    return `${(subs / 1000).toFixed(1).replace(/\.0$/, "")}K subscribers`;
  }
  return `${subs} subscribers`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = h > 0 && m < 10 ? `0${m}` : `${m}`;
  const sStr = s < 10 ? `0${s}` : `${s}`;

  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

export const CATEGORIES = [
  "All",
  "Tech",
  "Gaming",
  "Cricket",
  "Music",
  "Food",
  "Sports",
  "Movies",
  "News",
  "Education",
];
