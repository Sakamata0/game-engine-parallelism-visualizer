"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Monitor, MessageSquare, CheckCircle, Sparkles } from "lucide-react";

export const SlideDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Parallelism in Game Engines & 3D Rendering",
      subtitle: "How Modern Games Calculate Worlds in 16 Milliseconds",
      category: "Introduction & Context",
      bullets: [
        "The Real-Time Imperative: 4K resolution (3840×2160) = 8.3 million pixels.",
        "At 60 FPS: 8.3M × 60 = 500,000,000 pixels calculated every second.",
        "At 120 FPS: The total budget shrinks to just 8.33 milliseconds per frame.",
        "Sequential processing is physically impossible: requires extreme, multi-level parallelism across CPU and GPU.",
      ],
      speakerNotes:
        "Welcome everyone. Today we examine how video game engines solve one of the most demanding problems in computer science: calculating physics, AI, animations, and hundreds of millions of shaded pixels within a strict 16.6ms window.",
    },
    {
      title: "CPU vs. GPU: Architectural Divergence",
      subtitle: "Latency Optimization vs. Throughput Optimization",
      category: "Hardware Paradigms",
      bullets: [
        "CPU (Latency Oriented): 8–16 large cores, out-of-order execution, deep branch predictors, huge L1/L2/L3 caches.",
        "CPU Role: Complex sequential branching, gameplay state machines, AI pathfinding, scene graph traversal.",
        "GPU (Throughput Oriented): Thousands of lightweight ALUs, SIMT (Single Instruction, Multiple Threads).",
        "GPU Role: Uniform mathematical operations over vast arrays (vertices, pixels, voxel grids, ray intersections).",
        "The PCIe Bridge: High bandwidth (32 GB/s on PCIe 4.0), but non-negligible latency (~1–2 µs). We must batch communications!",
      ],
      speakerNotes:
        "Think of the CPU as a handful of Einstein-level mathematicians solving unpredictable equations. The GPU is an army of 10,000 workers doing the exact same multiplication simultaneously.",
    },
    {
      title: "The Graphics Pipeline (Rasterization)",
      subtitle: "From Mathematical 3D Triangles to Screen Pixels",
      category: "Rendering Pipeline",
      bullets: [
        "Vertex Shader (Parallel per vertex): Transforms local object space to camera projection space.",
        "Primitive Assembly & Clipping: Culls triangles outside the camera view frustum.",
        "Rasterization (Fixed-Function Hardware): Slices 3D triangles into screen fragments/pixels.",
        "Fragment/Pixel Shader (Parallel per pixel): Calculates PBR textures, lighting, shadows, and reflections.",
        "Modern Evolution: Task & Mesh Shaders replace fixed input assembler with compute-style geometry culling.",
      ],
      speakerNotes:
        "The classic graphics pipeline takes 3D coordinate mathematics and converts them into 2D color buffers. The GPU handles this as massive data-parallel streams.",
    },
    {
      title: "Hardware-Accelerated Real-Time Ray Tracing",
      subtitle: "DXR, Vulkan RT & Acceleration Structures",
      category: "Lighting & Optics",
      bullets: [
        "The Challenge: Testing millions of rays against millions of triangles is O(N) — impossible in real time.",
        "The Solution: Two-Level Bounding Volume Hierarchy (BVH) reduces complexity to O(log N).",
        "BLAS (Bottom-Level AS): Meshes and triangles (cached in VRAM).",
        "TLAS (Top-Level AS): World instances, transforms, updated every frame on CPU/GPU.",
        "Dedicated RT Cores: Silicon blocks dedicated to hardware ray-box and ray-triangle intersection testing.",
        "Hybrid Rendering & Denoising: Games cast only 1–2 rays per pixel and reconstruct clean lighting using AI/temporal denoisers (DLSS-RR).",
      ],
      speakerNotes:
        "Ray tracing replaces approximations with light physics. Hardware RT cores accelerate tree traversals, while denoisers fill in the gaps so we don't have to trace 1,000 rays per pixel.",
    },
    {
      title: "Physics Simulation: Multi-Stage Parallelism",
      subtitle: "Rigid Bodies, Collisions, and Particle Dynamics",
      category: "Physics Simulation",
      bullets: [
        "Broadphase: Spatial partitioning (BVH, Octrees, Spatial Hashing) to discard distant object pairs.",
        "Narrowphase: Precise geometry collision tests (GJK, SAT) parallelized across worker threads.",
        "Island Building: Graph partitioning of touching bodies into independent sub-graphs solved concurrently.",
        "Workload Distribution: Rigid bodies (Havok, Jolt, PhysX) run on CPU job systems; Soft-bodies, cloth, and fluids run on GPU compute shaders.",
      ],
      speakerNotes:
        "Physics cannot be solved all in one giant loop. Engines partition the 3D world into islands of objects that don't touch, then solve each island on a separate thread.",
    },
    {
      title: "Skeletal Character Animation & Skinning",
      subtitle: "CPU Hierarchy vs. GPU Vertex Deformation",
      category: "Character Animation",
      bullets: [
        "The Skeletal Tree (CPU): 50–200 bones organized hierarchically. Parent transforms multiply down the chain.",
        "Inverse Kinematics (IK): Solved on CPU worker threads using SIMD vectorization (AVX2/NEON).",
        "Linear Blend Skinning (GPU): 50,000 vertices deformed via: v' = Sum( Weight_i * BoneMatrix_i * v ).",
        "Why Not Deform on CPU? Transferring 50,000 animated vertices over PCIe every frame would choke bandwidth (~50 MB/s). Transferring 128 matrices takes only 8 KB!",
      ],
      speakerNotes:
        "Here is the genius of CPU/GPU division: The CPU only calculates the 100 bone matrices and sends 8 KB across PCIe. The GPU takes those 8 KB and deforms all 50,000 skin vertices in parallel.",
    },
    {
      title: "CPU Architecture: Fiber & Job Systems",
      subtitle: "Why Traditional Threads Fail in Game Engines",
      category: "Engine Systems",
      bullets: [
        "The Flawed Model: Dedicated thread for Audio, thread for Physics, thread for AI.",
        "The Bottleneck: High context-switch overhead, cache thrashing, and load imbalance (one core stalls while another sleeps).",
        "The Modern Model: Work-Stealing Job System (e.g., Naughty Dog Fiber Engine).",
        "Micro-Tasks: Divide the frame into thousands of 0.1ms jobs; any available CPU core immediately steals the next pending task.",
        "Data-Oriented Design (DOD / ECS): Storing components contiguously in memory for 100% L1/L2 cache line hits.",
      ],
      speakerNotes:
        "Modern engines don't use 1 thread per subsystem. They break the entire frame into thousands of tiny micro-jobs that any free core can grab, keeping every core pegged at high efficiency.",
    },
    {
      title: "Modern Low-Level APIs (Vulkan & DirectX 12)",
      subtitle: "Free-Threaded Command Recording & Async Compute",
      category: "Graphics APIs",
      bullets: [
        "Eliminating the Driver Bottleneck: OpenGL/DX11 forced all draw calls through a single main thread.",
        "Multi-Threaded Recording: Every worker thread records into independent VkCommandBuffer objects in parallel.",
        "FrameGraph Pattern: DAG (Directed Acyclic Graph) of render passes for automatic memory aliasing and barrier placement.",
        "Async Compute: Overlapping compute workloads (shadow generation, physics) with main graphics rasterization.",
      ],
      speakerNotes:
        "Vulkan and DirectX 12 removed the single-thread driver bottleneck. Now 16 CPU cores can record command buffers simultaneously and submit them in one unified batch to the GPU.",
    },
    {
      title: "Conclusion & Future Horizons",
      subtitle: "The Fully GPU-Driven Engine",
      category: "Summary & Takeaways",
      bullets: [
        "Summary: Real-time rendering is an asynchronous producer-consumer assembly line.",
        "CPU coordinates gameplay, spatial hierarchies, and records command buffers.",
        "GPU executes massive data-parallel compute, skinning, rasterization, and ray tracing.",
        "Future Trend: GPU-Driven Rendering (Unreal Engine 5 Nanite), where the GPU performs its own occlusion culling, LOD selection, and draw dispatch without CPU intervention.",
        "Neural Rendering: AI models (DLSS, Neural Radiance Fields) replacing manual shader calculations.",
      ],
      speakerNotes:
        "To conclude: Game engine performance is not just about raw silicon speed—it is about data design, cache awareness, and keeping the CPU-GPU pipeline continuously fed without stalls.",
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1325] p-6 shadow-2xl relative">
      {/* Top Slide Meta Bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800/60">
            {slide.category}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-600/20 text-xs text-cyan-200 hover:bg-cyan-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="space-y-4 min-h-[300px]">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{slide.title}</h2>
          <p className="text-sm text-cyan-400 font-medium mt-1">{slide.subtitle}</p>
        </div>

        {/* Bullets */}
        <div className="grid gap-3 pt-2">
          {slide.bullets.map((bullet, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200 leading-relaxed">{bullet}</p>
            </div>
          ))}
        </div>

        {/* Presenter Notes Expandable */}
        <div className="mt-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Presenter Script / What to say to the class:</span>
          </div>
          <p className="text-xs text-amber-200/90 italic leading-relaxed">
            &ldquo;{slide.speakerNotes}&rdquo;
          </p>
        </div>
      </div>

      {/* Slide Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-slate-800/60">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? "w-8 bg-cyan-400" : "w-2 bg-slate-700 hover:bg-slate-600"
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
