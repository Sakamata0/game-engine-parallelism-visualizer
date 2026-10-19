"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Sun, Moon, Sparkles, Activity, Zap, Monitor } from "lucide-react";
import { PipelineController } from "@/components/PipelineController";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference or system preference
    const saved = localStorage.getItem("theme-preference");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme-preference", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main
      suppressHydrationWarning
      className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Animated accent bar at the very top */}
      <div className="accent-bar h-1 w-full"></div>

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60 uppercase tracking-wider shadow-sm">
                Parallel Computing • Master IGL4
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-sm flex items-center gap-1.5">
                <Monitor className="w-3 h-3" />
                60 FPS Real-Time Budget (16.6ms)
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-cyan-700 dark:from-slate-100 dark:via-cyan-200 dark:to-sky-400 bg-clip-text text-transparent leading-tight">
              Parallelism in Game Engines
              <br className="hidden md:block" />
              <span className="text-2xl md:text-4xl">&amp; 3D Rendering</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-2xl leading-relaxed">
              Interactive architecture visualizer demonstrating CPU-GPU distributed simulation, PCIe transfers, and linear blend skinning in real-time.
            </p>
          </div>

          {/* Right Header Toolbar */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4.5 h-4.5 text-cyan-600 group-hover:-rotate-12 transition-transform duration-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

        {/* Main Interactive Pipeline Section */}
        <section>
          <PipelineController theme={theme} />
        </section>

        {/* Footer */}
        <footer className="pt-6 pb-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-3 font-medium">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span>Software Engineering Project: Parallel Algorithms &amp; Real-Time Computer Graphics</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Next.js 15</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Three.js WebGL</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Vulkan &amp; DirectX 12</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
