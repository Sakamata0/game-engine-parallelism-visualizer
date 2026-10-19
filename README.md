# Parallelism in Video Game Engines & 3D Rendering
> **Academic Project:** Parallel Computing (Master IGL4)  
> **Topic:** Parallelism in Game Engines, 3D Rendering, Skeletal Animation & CPU-GPU Collaboration  
> **Built with:** Next.js 15, React 19, TypeScript, Three.js WebGL, Tailwind CSS, Lucide Icons

---

## 🌟 Key Features

1. **Interactive 3D Skeletal Pipeline (CPU ↔ PCIe ↔ GPU Walkthrough)**:
   - **Step 1:** Gameplay & AI FSM on CPU Core 0 (Main thread evaluation).
   - **Step 2:** Skeletal Rig & Inverse Kinematics (IK) across multi-core SIMD worker threads (54-bone matrix hierarchy).
   - **Step 3:** Host-to-Device Memory Transfer over PCIe 4.0 bus (54 bone matrices = ~3.5 KB into host-visible VRAM).
   - **Step 4:** Linear Blend Skinning (LBS) on GPU Compute Warps (thousands of SIMT threads deforming vertices in parallel).
   - **Step 5:** Rasterization & Cook-Torrance PBR Shading (pixel fragments, normal maps, and depth buffer).
   - **Step 6:** Frame Presentation, Swapchains, and CPU-GPU `VkFence` Synchronization (double/triple buffering).
2. **Real-Time 3D WebGL Viewport (Three.js)**:
   - Full 3D rigged character asset (`Soldier.glb`) animated at 60 FPS.
   - Synchronized skinned vertex point cloud (GLSL skinning shader) rendering live vertex positions.
   - Interactive 3D OrbitControls (360° rotate, zoom, pan, and one-click Recenter).
   - Animation clip switcher (**Run**, **Walk**, **Idle**), playback controls (Play/Pause, 0.5x, 1x, 2x speed), and layer toggles (Bones, Wireframe, Vertices).
3. **Live Hardware Architecture Board**:
   - Visualizes CPU cores, PCIe 4.0 lane throughput (~31.5 GB/s), GPU Warp Schedulers, GDDR6 VRAM (~672 GB/s), and `VkFence` synchronization.
4. **Real Engineering Code Inspector**:
   - Synchronized C++ Job System code, Vulkan upload heaps, and HLSL/GLSL Compute Shaders with technical rationale.
5. **Frame Budget Tracker**:
   - Real-time frame time budget bar displaying CPU, PCIe, and GPU time vs. the 16.67ms (60 FPS) deadline.
6. **Dark & Light Studio Mode**:
   - Beautiful responsive UI with seamless theme switching and custom studio lighting.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

---

## 🌐 Deploying to Vercel (Recommended)

1. Import this repository in [Vercel](https://vercel.com/new).
2. Vercel automatically detects Next.js.
3. Click **Deploy**. The site will be live instantly!

---

## 📚 References & Academic Literature
- *Real-Time Rendering, 4th Edition* (Tomas Akenine-Möller, Eric Haines, Naty Hoffman)
- *Game Engine Architecture, 3rd Edition* (Jason Gregory, Naughty Dog)
- *Parallelizing the Naughty Dog Engine Using Fibers* (Christian Gyrling, GDC)
- *Vulkan Programming Guide & Specification* (Khronos Group)
