"use client";

import React from "react";
import { Cpu, Zap, Activity, HardDrive, Layers, ArrowRight } from "lucide-react";

interface ArchitectureDiagramProps {
  currentStep: number;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ currentStep }) => {
  const isCpuActive = currentStep === 1 || currentStep === 2;
  const isPcieActive = currentStep === 3;
  const isGpuActive = currentStep >= 4;
  const isSyncActive = currentStep === 6;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1629] p-5 shadow-xl relative overflow-hidden transition-colors duration-300">
      {/* Background glow lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs tracking-wider uppercase">
            Hardware Execution Map (Distributed PCIe Pipeline)
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Target: <span className="text-amber-500 dark:text-amber-400 font-bold">16.67 ms (60 FPS)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* ================= CPU BLOCK (4 Cols) ================= */}
        <div
          className={`lg:col-span-4 rounded-2xl p-4 transition-all duration-300 border ${
            isCpuActive
              ? "bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className={`w-5 h-5 ${isCpuActive ? "text-amber-500 dark:text-amber-400 animate-pulse" : "text-slate-400"}`} />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">CPU (Host)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                isCpuActive
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {currentStep === 1
                ? "Core 0 Active (AI)"
                : currentStep === 2
                ? "SIMD Workers Active"
                : "Idle / Frame N+1"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Core 0 */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                currentStep === 1
                  ? "bg-amber-500/20 border-amber-400 text-amber-700 dark:text-amber-200 font-bold"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="font-mono font-semibold">Core 0 (Main)</div>
              <div className="text-[11px] truncate mt-0.5">Gameplay & AI FSM</div>
            </div>

            {/* Core 1 (IK) */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                currentStep === 2
                  ? "bg-amber-500/20 border-amber-400 text-amber-700 dark:text-amber-200 font-bold"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="font-mono font-semibold">Cores 1-3 (Workers)</div>
              <div className="text-[11px] truncate mt-0.5">Skeletal IK & Hierarchy</div>
            </div>

            {/* Core 4-7 */}
            <div className="p-2 rounded-xl border bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
              <div className="font-mono font-semibold">Cores 4-7</div>
              <div className="text-[11px] truncate mt-0.5">Physics Broadphase</div>
            </div>

            {/* Command Recorder */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                currentStep === 2 || currentStep === 3
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-700 dark:text-cyan-200 font-bold"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="font-mono font-semibold">Command Recorder</div>
              <div className="text-[11px] truncate mt-0.5">VkCommandBuffer Gen</div>
            </div>
          </div>
        </div>

        {/* ================= PCIE BUS (3 Cols) ================= */}
        <div
          className={`lg:col-span-3 flex flex-col items-center justify-center p-3 rounded-2xl border relative transition-all duration-300 ${
            isPcieActive
              ? "bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
              : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 font-bold">
            <Zap className={`w-3.5 h-3.5 ${isPcieActive ? "text-cyan-500 dark:text-cyan-400 animate-bounce" : "text-slate-400"}`} />
            PCIe 4.0 x16 Bus
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">~31.5 GB/s Throughput</div>

          {/* Animated data packet traveling */}
          <div className="w-full bg-slate-200 dark:bg-slate-950 h-6 rounded-full mt-2 relative overflow-hidden border border-slate-300 dark:border-slate-800 flex items-center px-1">
            <div
              className={`h-4 rounded-full transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold ${
                isPcieActive
                  ? "w-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 text-slate-950 animate-pulse shadow-md"
                  : isCpuActive
                  ? "w-1/4 bg-amber-500/50 text-slate-800 dark:text-amber-200"
                  : isGpuActive
                  ? "w-full bg-emerald-500/40 text-emerald-800 dark:text-emerald-200"
                  : "w-0"
              }`}
            >
              {isPcieActive ? "54 MATRICES (3.5 KB)" : isCpuActive ? "PREP" : "DELIVERED"}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-mono font-medium">
            <span>Ring Allocator</span>
            <ArrowRight className="w-3 h-3 text-cyan-500" />
            <span>Upload Heap</span>
          </div>
        </div>

        {/* ================= GPU BLOCK (4 Cols) ================= */}
        <div
          className={`lg:col-span-4 rounded-2xl p-4 transition-all duration-300 border ${
            isGpuActive
              ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className={`w-5 h-5 ${isGpuActive ? "text-emerald-500 dark:text-emerald-400 animate-pulse" : "text-slate-400"}`} />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">GPU (Device)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                currentStep === 4
                  ? "bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/40"
                  : currentStep === 5
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                  : currentStep === 6
                  ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {currentStep === 4
                ? "Compute Shader (Skinning)"
                : currentStep === 5
                ? "Raster & Pixel Warps"
                : currentStep === 6
                ? "Presentation / Fence"
                : "Awaiting Command Buffer"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Command Queue */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                currentStep >= 3
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-200 font-bold"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="font-mono font-semibold">VkQueue (Ring)</div>
              <div className="text-[11px] truncate mt-0.5">Command Ingestion</div>
            </div>

            {/* Compute Warps */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                currentStep === 4
                  ? "bg-pink-500/20 border-pink-400 text-pink-700 dark:text-pink-200 font-bold animate-pulse"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="font-mono font-semibold">Compute Warps</div>
              <div className="text-[11px] truncate mt-0.5">50k Vertices SIMT</div>
            </div>

            {/* Raster & ROPs */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                currentStep === 5
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-700 dark:text-emerald-200 font-bold animate-pulse"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="font-mono font-semibold">Raster & ROPs</div>
              <div className="text-[11px] truncate mt-0.5">Pixel Shading & Depth</div>
            </div>

            {/* VRAM GDDR6 */}
            <div className="p-2 rounded-xl border bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <div>
                <div className="font-mono font-semibold">GDDR6 VRAM</div>
                <div className="text-[11px] truncate mt-0.5">~672 GB/s Bandwidth</div>
              </div>
              <HardDrive className="w-4 h-4 text-emerald-500 dark:text-emerald-400/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Synchronization Fence status bar at bottom */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">CPU-GPU Sync:</span>
          <span
            className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold ${
              isSyncActive
                ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            VkFence (Signaled on Frame Completion)
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Double Buffering: [Frame N: GPU]</span>
          <span>[Frame N+1: CPU]</span>
        </div>
      </div>
    </div>
  );
};
