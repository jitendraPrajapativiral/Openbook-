/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { useApp } from "../store/AppContext";
import UploadProgress from "../components/UploadProgress";
import { CATEGORIES } from "../utils";
import { UploadCloud, FileVideo, Sparkles, Plus, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface UploadProps {
  onNavigate: (page: string) => void;
}

export default function Upload({ onNavigate }: UploadProps) {
  const { token, currentUser } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("All");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  
  // Custom video file / thumbnail upload refs
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(120); // mock duration seconds
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isShorts, setIsShorts] = useState(false);

  // Suggested Titles list
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

  // Pipeline simulation states
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(1);
  const [pipelinePct, setPipelinePct] = useState(0);
  const [mockCreatedVideoId, setMockCreatedVideoId] = useState("");

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const dragAreaRef = useRef<HTMLDivElement | null>(null);

  // File drag & drops controls
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragAreaRef.current) dragAreaRef.current.style.borderColor = "#6C63FF";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragAreaRef.current) dragAreaRef.current.style.borderColor = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragAreaRef.current) dragAreaRef.current.style.borderColor = "";
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedVideo(files[0]);
    }
  };

  const selectVideoClick = () => {
    if (videoInputRef.current) videoInputRef.current.click();
  };

  const selectThumbnailClick = () => {
    if (thumbnailInputRef.current) thumbnailInputRef.current.click();
  };

  const processSelectedVideo = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Invalid format! Please provide standard MP4/MOV files.");
      return;
    }
    setVideoFile(file);
    // Auto populate Title
    const plainName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    setTitle(plainName.substring(0, 100));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedVideo(files[0]);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setThumbnailFile(files[0]);
      setThumbnailPreview(URL.createObjectURL(files[0]));
    }
  };

  // Claude/Gemini AI powered Title suggestion tool
  const triggerSuggestions = async () => {
    if (!token) return;
    if (!description) {
      alert("Please provide video Description details first so AI has semantic keywords context to work with!");
      return;
    }

    setIsSuggesting(true);
    setSuggestedTitles([]);

    try {
      const res = await fetch("/api/ai/title-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestedTitles(data.suggestions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Run pipeline 6-step Transcoding simulator
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!videoFile) {
      alert("Video file select is mandatory!");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a Video Title");
      return;
    }

    setPipelineActive(true);
    setPipelineStep(1);
    setPipelinePct(5);

    // Simulate pipeline intervals
    const runSimulator = setInterval(() => {
      setPipelinePct((prevPct) => {
        let pct = prevPct + Math.floor(Math.random() * 8) + 3;
        if (pct >= 100) {
          pct = 100;
        }

        // Auto map step transitions
        if (pct >= 100) {
          setPipelineStep((prevStep) => {
            if (prevStep < 6) {
              setTimeout(() => {
                setPipelinePct(5);
              }, 400);
              return prevStep + 1;
            } else {
              clearInterval(runSimulator);
              completeBackendRegistration();
              return 6;
            }
          });
        }
        return pct;
      });
    }, 240); // high speed intervals for seamless user engagement
  };

  // Actually write to Express server Local DB seed storage
  const completeBackendRegistration = async () => {
    try {
      // Mock thumbnail if none provided
      const finalThumb =
        thumbnailPreview ||
        `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80`;

      // Split Tag lists
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          duration: videoDuration,
          thumbnailUrl: finalThumb,
          isShort: isShorts,
          category: category === "All" ? "Tech" : category,
          tags: tagsArray,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMockCreatedVideoId(data.video?._id || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!token) {
    return (
      <div className="py-24 text-center max-w-md mx-auto bg-[#111118]/40 border border-gray-800 rounded-2xl p-6 font-sans">
        <AlertCircle className="w-12 h-12 text-[#FF6584] mx-auto mb-3 animate-bounce" />
        <h4 className="font-bold text-gray-850 dark:text-gray-250">Verification Required</h4>
        <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
          Sign In sequence required to setup creator studios, upload files, transcode HLS, and publish custom playlists.
        </p>
        <button
          onClick={() => onNavigate("/login")}
          className="mt-5 bg-[#6C63FF] hover:bg-opacity-90 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all"
        >
          Sign In Context
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16 font-sans select-none animate-fade-in max-w-4xl mx-auto px-1">
      {/* Conditionally render pipeline panel or details entry form */}
      {pipelineActive ? (
        <div className="py-10">
          <UploadProgress
            step={pipelineStep}
            progress={pipelinePct}
            title={title}
            onFinishedClose={() => {
              if (mockCreatedVideoId) {
                onNavigate(`/watch/${mockCreatedVideoId}`);
              } else {
                onNavigate("/");
              }
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="border-b border-gray-150 dark:border-gray-850 pb-3">
            <h2 className="text-xl font-bold font-display text-gray-950 dark:text-white">Publish Creator Broadcasts</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Define your narration files. We auto transcode, translocate, and generate Gemini transcripts!</p>
          </div>

          <form onSubmit={handlePublishSubmit} className="flex flex-col md:flex-row gap-6">
            
            {/* Left dragging area and media parameters */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Drag drop zone */}
              <div
                ref={dragAreaRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={selectVideoClick}
                className="border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-[#6C63FF] dark:hover:border-[#6C63FF] rounded-2xl p-6 sm:p-10 text-center bg-[#111118]/20 hover:bg-[#6C63FF]/5 cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 bg-[#6C63FF]/15 text-[#6C63FF] rounded-2xl flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                {videoFile ? (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs">{videoFile.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB Payload</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-display font-semibold text-xs text-gray-900 dark:text-white">Select video format</h4>
                    <p className="text-[10px] text-gray-400 max-w-xs mt-1 leading-normal mx-auto">
                      Drag & Drop MP4, WEBM, or AVI files here, or tap browse. Supports standard transcode ratios up to 10GB.
                    </p>
                  </div>
                )}
              </div>

              {/* Title counters selection */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 font-display">
                  <span>Video Title*</span>
                  <span>{title.length}/100</span>
                </div>
                <input
                  type="text"
                  placeholder="Is video me kya sikhne milega? Add catchy hooks!"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
                />
              </div>

              {/* Description Counters */}
              <div className="flex flex-col gap-1.5 relative">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 font-display">
                  <span>Narration Description</span>
                  <span>{description.length}/1000</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Apni video katha full features explore karein. Description triggers high ranking tags!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white resize-none"
                />

                {/* Sparkling generator recommendations launcher */}
                <button
                  type="button"
                  onClick={triggerSuggestions}
                  disabled={isSuggesting}
                  className="absolute right-3.5 bottom-3.5 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 text-[#6C63FF] font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border border-[#6C63FF]/20"
                  title="Generate headlines with Claude AI"
                >
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>AI Generate Titles</span>
                </button>
              </div>

              {/* AI Generated Titles Shelf popover list */}
              {suggestedTitles.length > 0 && (
                <div className="bg-[#6C63FF]/5 border border-[#6C63FF]/20 rounded-xl p-4 flex flex-col gap-2 animate-fade-in text-xs font-semibold">
                  <p className="text-[10px] font-bold uppercase text-[#6C63FF] font-display">Claude Recommended Hooks Suggestions:</p>
                  <div className="grid grid-cols-1 gap-1.5 mt-1">
                    {suggestedTitles.map((t, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setTitle(t)}
                        className="text-left py-1.5 px-3 hover:bg-[#6C63FF]/10 dark:hover:bg-[#1C1C26] rounded-lg transition-all text-xs flex gap-2 items-center text-gray-700 dark:text-gray-300"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#6C63FF]" />
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right details parameters and thumbnail previews */}
            <div className="w-full md:w-80 shrink-0 flex flex-col gap-5">
              {/* Format selection */}
              <div className="flex flex-col gap-2 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 bg-gray-50/20 dark:bg-transparent">
                <span className="text-[10px] uppercase font-bold text-gray-400 font-display">Publishing format</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsShorts(false)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      !isShorts
                        ? "bg-[#6C63FF] text-white border-[#6C63FF]"
                        : "bg-transparent border-gray-200 dark:border-gray-800 hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    Standard Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShorts(true)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      isShorts
                        ? "bg-[#6C63FF] text-white border-[#6C63FF]"
                        : "bg-transparent border-gray-200 dark:border-gray-800 hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    Short Format
                  </button>
                </div>
              </div>

              {/* Custom Thumbnail Selection */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 font-display">Video Thumbnail</span>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="hidden"
                />

                <div
                  onClick={selectThumbnailClick}
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-850 bg-[#111118]/40 hover:bg-[#1A1A26] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Snippet" className="w-full h-full object-cover select-none" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] font-semibold text-gray-400">Click to upload poster JPG</span>
                    </>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 font-display">Category Selection</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "General / Miscellaneous" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag limits commas separate */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 font-display">Semantic tags list</span>
                <input
                  type="text"
                  placeholder="commas separated: tech, dynamic, live"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C63FF] text-gray-900 dark:text-white"
                />
              </div>

              {/* Visibility range */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 font-display">Visibility Rights</span>
                <div className="flex flex-col gap-1 bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-semibold">
                  {[
                    { raw: "public", label: "Public Broadcast" },
                    { raw: "unlisted", label: "Unlisted Link Sharing" },
                    { raw: "private", label: "Private Studio Vault" },
                  ].map((vs) => (
                    <label key={vs.raw} className="flex items-center gap-2 py-1 cursor-pointer hover:text-[#6C63FF] transition-colors">
                      <input
                        type="radio"
                        name="visibility"
                        value={vs.raw}
                        checked={visibility === vs.raw}
                        onChange={() => setVisibility(vs.raw as any)}
                        className="accent-[#6C63FF] cursor-pointer"
                      />
                      <span>{vs.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Launcher publish */}
              <button
                type="submit"
                className="w-full bg-[#6C63FF] hover:bg-[#574FEB] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-[#6C63FF]/15 flex items-center justify-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 fill-current" />
                <span>Begin Transcode & Publish</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
