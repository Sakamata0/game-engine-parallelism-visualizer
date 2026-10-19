"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Play, Pause, FastForward, ChevronRight, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { CodeViewer } from "./CodeViewer";

interface PipelineControllerProps {
  theme?: "dark" | "light";
}

// Dynamically import ThreeCharacterCanvas to prevent SSR execution of WebGL/window
const ThreeCharacterCanvas = dynamic(
  () => import("./ThreeCharacterCanvas").then((mod) => mod.ThreeCharacterCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0c1222] h-[560px] lg:h-[620px] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-9 h-9 text-cyan-500 animate-spin" />
        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Initializing WebGL 3D Viewport...</div>
      </div>
    ),
  }
);

export const PipelineController: React.FC<PipelineControllerProps> = ({ theme = "dark" }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);

  const steps = [
    {
      num: 1,
      title: "Gameplay & AI State",
      host: "CPU (Core 0)",
      time: "1.2 ms",
      summary: "Player pressed 'W': The CPU evaluates game logic and transitions the animation state machine to Running at 5.2 m/s.",
    },
    {
      num: 2,
      title: "Skeletal Rig & IK",
      host: "CPU (Job Workers)",
      time: "1.8 ms",
      summary: "SIMD worker threads calculate the 3D position of all 54 bones in the skeleton tree, adjusting feet to the ground with Inverse Kinematics.",
    },
    {
      num: 3,
      title: "PCIe Data Upload",
      host: "PCIe 4.0 Bus",
      time: "0.2 ms",
      summary: "The CPU streams the 54 bone matrices (~3.5 KB) across the PCIe bus into host-visible VRAM in under 0.0001 ms.",
    },
    {
      num: 4,
      title: "Linear Blend Skinning",
      host: "GPU (Compute Warps)",
      time: "0.4 ms",
      summary: "The GPU launches thousands of threads in parallel: each thread moves one skin vertex according to the nearest bones.",
    },
    {
      num: 5,
      title: "Rasterization & Shading",
      host: "GPU (Graphics Queue)",
      time: "7.1 ms",
      summary: "The hardware rasterizer slices 3D triangles into screen pixels; pixel shaders calculate PBR lighting, normal maps, and shadows.",
    },
    {
      num: 6,
      title: "Presentation & Fences",
      host: "Display Engine & Fences",
      time: "0.1 ms",
      summary: "The GPU presents the finished image to your monitor; the CPU waits on a VkFence so it never runs more than 2 frames ahead.",
    },
  ];

  // Auto-advance stepper
  useEffect(() => {
    if (!autoAdvance) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev >= 6 ? 1 : prev + 1));
    }, 5500 / speed);

    return () => clearInterval(interval);
  }, [autoAdvance, speed]);

  const activeStepObj = steps[currentStep - 1]!;

  return (
    <div className="space-y-6">
      {/* Interactive Step Navigator Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {steps.map((s) => {
          const isActive = s.num === currentStep;
          const isPassed = s.num < currentStep;

          return (
            <button
              key={s.num}
              onClick={() => {
                setCurrentStep(s.num);
                setAutoAdvance(false);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer group ${
                isActive
                  ? "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/30 scale-[1.02]"
                  : isPassed
                  ? "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:shadow-md hover:scale-[1.01]"
                  : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-70 hover:opacity-100 hover:shadow-md hover:scale-[1.01]"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 accent-bar"></div>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                    isActive
                      ? "bg-cyan-500 text-white dark:text-slate-950"
                      : isPassed
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Step {s.num}
                </span>
                <span className={`text-[10px] font-mono font-semibold ${isActive ? "text-cyan-600 dark:text-cyan-300" : "text-slate-500 dark:text-slate-400"}`}>{s.time}</span>
              </div>
              <div className="mt-3">
                <div className={`text-xs font-bold truncate ${isActive ? "text-cyan-900 dark:text-cyan-100" : "text-slate-800 dark:text-slate-100"}`}>{s.title}</div>
                <div className={`text-[11px] font-mono font-medium truncate mt-0.5 ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-400"}`}>{s.host}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Human-Readable Active Step Explainer Callout */}
      <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center font-bold font-mono text-sm shadow-md shrink-0">
            {activeStepObj.num}
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-900 dark:text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>{activeStepObj.title}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-mono">{activeStepObj.host}</span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
              {activeStepObj.summary}
            </div>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setCurrentStep((prev) => (prev <= 1 ? 6 : prev - 1));
              setAutoAdvance(false);
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
          >
            Prev Step
          </button>
          <button
            onClick={() => {
              setCurrentStep((prev) => (prev >= 6 ? 1 : prev + 1));
              setAutoAdvance(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition shadow-md"
          >
            Next Step
          </button>
        </div>
      </div>

      {/* Main Stage: Bigger 3D Viewport on Left + Architecture & Code on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Extra Large 3D Character Viewport */}
        <div className="lg:col-span-6 space-y-4">
          <ThreeCharacterCanvas
            currentStep={currentStep}
            speed={speed}
            isPlaying={isPlaying}
            theme={theme}
          />

          {/* Playback & Auto-Advance Control Strip */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1629] p-3.5 px-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause 3D" : "Play 3D"}
              </button>

              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  autoAdvance
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <FastForward className="w-3.5 h-3.5" />
                Auto-Advance {autoAdvance ? "ON" : "OFF"}
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-xs font-mono">
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    speed === s
                      ? "bg-cyan-500 text-white dark:text-slate-950 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Architecture Diagram & Active Code Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <ArchitectureDiagram currentStep={currentStep} />
          <CodeViewer currentStep={currentStep} />
        </div>
      </div>

      {/* Frame Budget Consumption Bar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-lg shadow-sm">
              10.8
            </div>
            <div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                Cumulative Frame Time: 10.8 ms / 16.67 ms
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                60 FPS Guaranteed — 5.87 ms headroom for audio &amp; post-processing
              </div>
            </div>
          </div>

          {/* Multi-segment budget progress bar */}
          <div className="w-full md:w-1/2">
            <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-l-full" style={{ width: "18%" }} title="CPU Logic: 3.0ms"></div>
              <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500" style={{ width: "2%" }} title="PCIe Transfer: 0.2ms"></div>
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: "45%" }} title="GPU Shading: 7.6ms"></div>
              <div className="h-full bg-slate-200 dark:bg-slate-800/80 rounded-r-full" style={{ width: "35%" }} title="Idle Headroom"></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono mt-2 text-slate-500 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500"></span>CPU 3.0ms</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500"></span>PCIe 0.2ms</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>GPU 7.6ms</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold"><span className="w-2 h-2 rounded-sm bg-slate-300 dark:bg-slate-700"></span>16.67ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
