/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, Loader, Video, Sparkles, Wand2, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadProgressProps {
  step: number; // 1 to 6
  progress: number; // 0 to 100
  title: string;
  thumbnailUrl?: string;
  onFinishedClose?: () => void;
}

export default function UploadProgress({
  step,
  progress,
  title,
  thumbnailUrl,
  onFinishedClose,
}: UploadProgressProps) {
  const stepsList = [
    { num: 1, label: "Selecting file", desc: "Verifying video file parameters" },
    { num: 2, label: "Uploading payload to server", desc: "Transporting packets safely" },
    { num: 3, label: "Processing 360p & 480p HLS segments", desc: "Generating adaptive bitrate files" },
    { num: 4, label: "Processing 720p & 1080p high definition", desc: "Completing master playlist mapping" },
    { num: 5, label: "OpenBook AI elements generation", desc: "Creating smart chapters and summaries" },
    { num: 6, label: "Published!", desc: "Ready for OpenBook search feeds!" },
  ];

  // Helper status indicators
  const getStepStatus = (num: number) => {
    if (step > num || (step === 6 && num === 6)) return "completed";
    if (step === num) return "active";
    return "pending";
  };

  return (
    <div className="bg-white dark:bg-[#111118] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-xl max-w-xl w-full mx-auto animate-fade-in font-sans">
      <div className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-850 pb-4 mb-5">
        <div className="w-12 h-12 bg-[#6C63FF]/10 text-[#6C63FF] rounded-xl flex items-center justify-center shrink-0">
          <Video className="w-6 h-6 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-display">
            Video Processing Pipeline
          </p>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate font-display mt-0.5">
            {title || "Uploading Title..."}
          </h4>
        </div>

        {step === 6 && (
          <span className="bg-[#6C63FF]/15 text-[#6C63FF] font-semibold text-[11px] px-2.5 py-1 rounded-full animate-bounce">
            Ready
          </span>
        )}
      </div>

      {/* Main progress bar slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-xs font-semibold">
          <span className="text-[#6C63FF]">
            {step === 6 ? "Transcode Completed" : `Step ${step}: ${stepsList[step - 1].label}`}
          </span>
          <span className="text-gray-500 font-mono">{progress}%</span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden flex border border-gray-200/50 dark:border-gray-900/50">
          <div
            style={{ width: `${progress}%` }}
            className={`h-full transition-all duration-300 rounded-full ${
              step === 6
                ? "bg-gradient-to-r from-[#6C63FF] to-[#FF6584]"
                : "bg-[#6C63FF] animate-pulse"
            }`}
          />
        </div>
      </div>

      {/* Lists of details */}
      <div className="space-y-3">
        {stepsList.map((item) => {
          const status = getStepStatus(item.num);

          return (
            <div
              key={item.num}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                status === "active"
                  ? "bg-[#6C63FF]/5 border border-[#6C63FF]/10"
                  : "bg-transparent border border-transparent"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {status === "completed" ? (
                  <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                ) : status === "active" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#6C63FF] flex items-center justify-center animate-spin" />
                ) : (
                  <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold font-mono">
                    {item.num}
                  </div>
                )}
              </div>

              <div className="flex-1 text-xs">
                <p
                  className={`font-semibold ${
                    status === "completed"
                      ? "text-gray-500 dark:text-gray-400 line-through decoration-gray-400 dark:decoration-gray-600"
                      : status === "active"
                      ? "text-gray-900 dark:text-white font-bold"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {step === 6 && onFinishedClose && (
        <button
          onClick={onFinishedClose}
          className="mt-6 w-full bg-[#6C63FF] hover:bg-[#574FEB] text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-[#6C63FF]/20"
        >
          Go to Watch Page 🎉
        </button>
      )}
    </div>
  );
}
