"use client";

import React from "react";
import { ExternalLink, Sparkles, Cpu, Layers, Eye } from "lucide-react";

export const LiveDemos: React.FC = () => {
  const demos = [
    {
      title: "WebGPU Compute Boids Simulation",
      category: "GPU Compute Shaders (SIMT)",
      desc: "Simulates 1,500 flocking birds in real time. Every bird computes separation, alignment, and cohesion against all neighbors in a dedicated GPU thread.",
      tech: "WebGPU / WGSL Compute",
      link: "https://webgpu.github.io/webgpu-samples/?sample=computeBoids",
      highlight: "Notice 60 FPS maintained even with thousands of interactions.",
    },
    {
      title: "Interactive WebGL Cloth Simulation",
      category: "Physics & Constraint Solving",
      desc: "Simulates a tearable cloth mesh made of thousands of mass particles connected by springs (Position Based Dynamics - PBD).",
      tech: "WebGL / GPU Shaders",
      link: "https://matthias-research.github.io/pages/tenMinutePhysics/09-cloth.html",
      highlight: "Drag with your mouse to stretch and tear the cloth in real time.",
    },
    {
      title: "Shadertoy: Real-Time Pixel-Parallel Raymarching",
      category: "Massive Pixel Parallelism",
      desc: "Renders complex 3D fractal geometry and reflections purely through mathematical distance functions without any polygonal triangles.",
      tech: "GLSL Fragment Shader",
      link: "https://www.shadertoy.com/view/4dSBDt",
      highlight: "Every single pixel runs the exact same fragment shader simultaneously.",
    },
    {
      title: "Ray Tracing in One Weekend (Interactive WebGL)",
      category: "Ray Tracing & BVH",
      desc: "Demonstrates ray bounces, diffuse surfaces, refraction through glass spheres, and recursive light scattering.",
      tech: "WebGL / Ray Tracing",
      link: "https://raytracing.github.io/books/RayTracingInOneWeekend.html",
      highlight: "Shows the transition from theoretical ray optics to real-time rendering.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-[#0e1629] p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-slate-100">Live Demonstrations & Parallel Benchmarks</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Use these live interactive web demos during your presentation to show your professor and class real-time parallel computing running in the browser. Click any demo to launch it directly in a new tab:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demos.map((d, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-[#0c1322] p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {d.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{d.tech}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                {d.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{d.desc}</p>

              <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-amber-200/90 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{d.highlight}</span>
              </div>
            </div>

            <a
              href={d.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 font-semibold text-xs border border-cyan-500/40 transition group-hover:border-cyan-400"
            >
              Launch Live Interactive Demo <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
