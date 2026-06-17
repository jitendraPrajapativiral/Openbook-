/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WatchHistoryItem {
  videoId: string;
  watchedAt: string;
  progressPercent: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  channelBanner: string;
  channelName: string;
  channelDescription: string;
  subscriberCount: number;
  totalViews: number;
  verified: boolean;
  watchHistory: WatchHistoryItem[];
  likedVideos: string[];
  createdAt: string;
}

export interface VideoQuality {
  "360p"?: string;
  "480p"?: string;
  "720p"?: string;
  "1080p"?: string;
}

export interface AIChapter {
  time: string; // e.g. "0:00"
  title: string;
}

export type VideoVisibility = "public" | "unlisted" | "private";
export type VideoStatus = "uploading" | "processing" | "ready" | "failed";

export interface Video {
  _id: string;
  title: string;
  description: string;
  userId: string;
  channelName: string;
  channelAvatar: string;
  videoUrl: string; // Raw video URL fallback
  hlsUrl: string; // master.m3u8 URL
  thumbnailUrl: string;
  duration: number; // in seconds
  views: number;
  likes: string[]; // userIds
  dislikes: string[]; // userIds
  category: string;
  tags: string[];
  visibility: VideoVisibility;
  status: VideoStatus;
  quality: VideoQuality;
  aiSummary: string;
  aiChapters: AIChapter[];
  isShort?: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes: string[]; // userIds
  parentId: string | null; // null = top level, string = parent comment ID
  replies?: Comment[];
  createdAt: string;
}

export interface Subscription {
  _id: string;
  subscriberId: string;
  channelId: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string; // "upload" | "like" | "subscribe" | "system"
  message: string;
  videoId?: string;
  read: boolean;
  createdAt: string;
}
