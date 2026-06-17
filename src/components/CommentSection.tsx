/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { ThumbsUp, Trash2, CornerDownRight, Smile, Sparkles, MessageSquare } from "lucide-react";
import { Comment } from "../types";

interface CommentSectionProps {
  videoId: string;
  videoOwnerId: string;
}

export default function CommentSection({ videoId, videoOwnerId }: CommentSectionProps) {
  const { token, currentUser } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sortBy, setSortBy] = useState<"top" | "newest">("newest");
  const [showEmojiRow, setShowEmojiRow] = useState<string | null>(null); // "main" or comment_id

  // AI Reply Helper state
  const [selectedReplyComment, setSelectedReplyComment] = useState<Comment | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const popularEmojis = ["❤️", "🔥", "👍", "💡", "😂", "🚀", "👏", "⚡"];

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  // Handle Sort changes
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "top") {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Top levels and nested replies dividing
  const parentComments = sortedComments.filter((c) => c.parentId === null);
  const getReplies = (parentId: string) => {
    return sortedComments.filter((c) => c.parentId === parentId);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Please sign in or register to comment on OpenBook!");
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newCommentText }),
      });

      if (res.ok) {
        setNewCommentText("");
        setShowEmojiRow(null);
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!token) return;
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyText, parentId }),
      });

      if (res.ok) {
        setReplyText("");
        setReplyToId(null);
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Zaroor delete karna chahte hain?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchComments();
        if (selectedReplyComment?._id === id) {
          setSelectedReplyComment(null);
          setAiSuggestions([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeComment = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/comments/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI Reply Suggestions generator (Claude/Gemini integration)
  const handleTriggerAiReply = async (comment: Comment) => {
    setSelectedReplyComment(comment);
    setAiSuggestions([]);
    setLoadingAi(true);

    try {
      const res = await fetch("/api/ai/reply-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText: comment.text }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const applyAiReply = (text: string, parentId: string) => {
    setReplyToId(parentId);
    setReplyText(text);
    setSelectedReplyComment(null);
    setAiSuggestions([]);
  };

  const appendEmoji = (emoji: string, type: "main" | "reply") => {
    if (type === "main") {
      setNewCommentText((p) => p + emoji);
    } else {
      setReplyText((p) => p + emoji);
    }
  };

  // Quick helper to highlight @mentions
  const renderCommentText = (txt: string) => {
    const parts = txt.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("@") && part.length > 1) {
        return (
          <span key={index} className="text-[#6C63FF] font-semibold bg-[#6C63FF]/5 px-1 py-0.5 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Search Header views */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 pb-3 gap-3">
        <h3 className="font-display font-semibold text-base flex items-center gap-2 text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5 text-[#6C63FF]" />
          <span>{comments.length} Comments</span>
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium font-sans">Sort by:</span>
          <button
            onClick={() => setSortBy("newest")}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              sortBy === "newest"
                ? "bg-[#6C63FF] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              sortBy === "top"
                ? "bg-[#6C63FF] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Top Comments
          </button>
        </div>
      </div>

      {/* Main Comment Input Block */}
      <form onSubmit={handleAddComment} className="flex gap-4">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-800 bg-gray-100">
          <img
            src={
              currentUser?.avatar ||
              "https://api.dicebear.com/7.x/initials/svg?seed=OpenBook"
            }
            alt="My Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            placeholder={token ? "Openly comment your opinion... Add @mentions too!" : "Sign in to share your view..."}
            disabled={!token}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white dark:bg-[#111118]/60 dark:hover:bg-[#1A1A26] dark:focus:bg-[#111118]/60 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white transition-all disabled:opacity-50"
          />
          {token && (
            <div className="flex justify-between items-center relative">
              {/* Simple Emoji trigger row */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowEmojiRow(showEmojiRow === "main" ? null : "main")}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/5 transition-all cursor-pointer"
                  title="Insert Emoji"
                >
                  <Smile className="w-4.5 h-4.5" />
                </button>

                {(showEmojiRow === "main") && (
                  <div className="flex gap-1 bg-gray-50 dark:bg-[#1C1C26] border border-gray-200 dark:border-gray-800 p-1.5 rounded-lg absolute left-8 z-10 shadow-lg animate-fade-in">
                    {popularEmojis.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => appendEmoji(em, "main")}
                        className="hover:scale-125 transition-transform text-sm cursor-pointer p-0.5"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-[#6C63FF] hover:bg-[#574FEB] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#6C63FF]/10"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Dynamic AI reply Suggestion banner for content publisher creators */}
      {currentUser && currentUser._id === videoOwnerId && selectedReplyComment && (
        <div className="bg-[#6C63FF]/5 border border-[#6C63FF]/20 rounded-2xl p-4 flex flex-col gap-2.5 animate-fade-in">
          <p className="text-xs text-[#6C63FF] font-semibold font-display flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>OpenBook AI Reply Helper for "{selectedReplyComment.userName}"'s comment</span>
          </p>

          {loadingAi ? (
            <div className="flex items-center gap-2 py-1">
              <div className="w-4 h-4 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading custom AI responses...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {aiSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyAiReply(sug, selectedReplyComment._id)}
                  className="bg-white hover:bg-gray-100/50 dark:bg-[#111118] dark:hover:bg-[#191925] border border-gray-200 dark:border-gray-850 p-2.5 rounded-xl text-left text-xs text-gray-700 dark:text-gray-300 transition-colors leading-relaxed group shadow-2xs"
                  title="Apply this response"
                >
                  <p className="line-clamp-3 group-hover:text-[#6C63FF] transition-colors">{sug}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Lists */}
      <div className="space-y-5">
        {parentComments.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 dark:bg-gray-900/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">No opinions posted yet. Auron ko khulke batane ka mauka dein!</p>
          </div>
        ) : (
          parentComments.map((com) => {
            const repliesList = getReplies(com._id);
            const isMyComment = currentUser && currentUser._id === com.userId;
            const hasLiked = currentUser && com.likes?.includes(currentUser._id);

            return (
              <div key={com._id} className="group border-b border-gray-100 dark:border-gray-900/60 pb-4 flex flex-col gap-3">
                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-gray-200/80 dark:border-gray-800 bg-gray-100">
                    <img src={com.userAvatar} alt={com.userName} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{com.userName}</span>
                      {com.userId === videoOwnerId && (
                        <span className="bg-[#6C63FF]/15 text-[#6C63FF] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-display select-none">
                          Creator
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(com.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-sans leading-relaxed">
                      {renderCommentText(com.text)}
                    </p>

                    {/* Comment controls row */}
                    <div className="flex items-center gap-4 mt-2.5">
                      <button
                        type="button"
                        onClick={() => handleLikeComment(com._id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          hasLiked ? "text-[#FF6584]" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{com.likes?.length || 0}</span>
                      </button>

                      {token && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyToId(replyToId === com._id ? null : com._id);
                            setReplyText("");
                          }}
                          className="text-xs font-semibold text-gray-400 hover:text-[#6C63FF] cursor-pointer transition-colors"
                        >
                          Reply
                        </button>
                      )}

                      {/* Display AI options for owner to auto insert responses */}
                      {currentUser && currentUser._id === videoOwnerId && !isMyComment && (
                        <button
                          type="button"
                          onClick={() => handleTriggerAiReply(com)}
                          className="text-[11px] font-bold text-[#6C63FF] hover:text-[#574FEB] flex items-center gap-1 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                          title="Generate instant response suggests using Gemini"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Reply Helper</span>
                        </button>
                      )}

                      {/* Trash cleaner */}
                      {currentUser && isMyComment && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(com._id)}
                          className="text-xs text-gray-450 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors ml-auto md:opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    {/* Inline reply box */}
                    {replyToId === com._id && (
                      <div className="mt-3 flex gap-3 animate-fade-in relative z-20">
                        <input
                          type="text"
                          placeholder={`Replying to @${com.userName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(com._id)}
                          disabled={!replyText.trim()}
                          className="bg-[#6C63FF] text-white px-4 rounded-xl text-xs font-semibold cursor-pointer hover:bg-opacity-90 disabled:opacity-50"
                        >
                          Post Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies nested render 1 level deep */}
                {repliesList.length > 0 && (
                  <div className="pl-12 flex flex-col gap-3">
                    {repliesList.map((rep) => {
                      const isRepOwner = currentUser && rep.userId === currentUser._id;
                      const hasRepLiked = currentUser && rep.likes?.includes(currentUser._id);

                      return (
                        <div key={rep._id} className="flex gap-2.5 items-start bg-gray-100/30 dark:bg-gray-900/20 p-2.5 rounded-xl border border-gray-150/40 dark:border-gray-850/40">
                          <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                            <img src={rep.userAvatar} alt={rep.userName} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{rep.userName}</span>
                              {rep.userId === videoOwnerId && (
                                <span className="bg-[#6C63FF]/15 text-[#6C63FF] px-1 py-0.2 rounded text-[8px] font-bold uppercase font-display">
                                  Creator
                                </span>
                              )}
                              <span className="text-[9px] text-gray-400 font-mono">
                                {new Date(rep.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 mt-1 text-xs">
                              {renderCommentText(rep.text)}
                            </p>

                            <div className="flex items-center gap-3 mt-1.5">
                              <button
                                type="button"
                                onClick={() => handleLikeComment(rep._id)}
                                className={`flex items-center gap-1 font-semibold transition-colors ${
                                  hasRepLiked ? "text-[#FF6584]" : "text-gray-400 hover:text-white"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{rep.likes?.length || 0}</span>
                              </button>

                              {currentUser && isRepOwner && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(rep._id)}
                                  className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
