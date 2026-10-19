"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Rotate3d, Play, Pause, RefreshCw, Focus } from "lucide-react";

interface ThreeCharacterCanvasProps {
  currentStep: number;
  speed: number;
  isPlaying: boolean;
  theme?: "dark" | "light";
}

export const ThreeCharacterCanvas: React.FC<ThreeCharacterCanvasProps> = ({
  currentStep,
  speed,
  isPlaying,
  theme = "dark",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const floorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const skeletonHelperRef = useRef<THREE.SkeletonHelper | null>(null);
  const skinnedMeshesRef = useRef<THREE.SkinnedMesh[]>([]);
  const skinnedPointsRef = useRef<THREE.SkinnedMesh[]>([]);

  // Component state
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentAnim, setCurrentAnim] = useState<string>("Run");
  const [showSkeletonManual, setShowSkeletonManual] = useState<boolean>(true);
  const [wireframeManual, setWireframeManual] = useState<boolean>(false);
  const [pointCloudManual, setPointCloudManual] = useState<boolean>(false);

  // Dynamic refs for animation playback control
  const isPlayingRef = useRef<boolean>(isPlaying);
  const speedRef = useRef<number>(speed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Recenter Camera function
  const recenterCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.6, 3.8);
      controlsRef.current.target.set(0, 1.0, 0);
      controlsRef.current.update();
    }
  };

  // Helper to build a SkinnedMesh that draws as POINTS (synchronized 1:1 with bones)
  const createSkinnedPoints = (mesh: THREE.SkinnedMesh) => {
    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: `
        #include <skinning_pars_vertex>
        uniform float uPointSize;
        void main() {
          #include <begin_vertex>
          #include <skinbase_vertex>
          #include <skinning_vertex>
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(uPointSize * (280.0 / -mvPosition.z), 2.5, 9.0);
        }
      `,
      fragmentShader: `
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, dist);
          gl_FragColor = vec4(1.0, 0.15, 0.65, alpha * 0.95);
        }
      `,
      uniforms: {
        uPointSize: { value: 0.055 },
      },
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });

    const pointsMesh = new THREE.SkinnedMesh(mesh.geometry, pointsMat);
    // @ts-ignore
    pointsMesh.isPoints = true;
    // @ts-ignore
    pointsMesh.isMesh = false;
    
    pointsMesh.bind(mesh.skeleton, mesh.bindMatrix);
    return pointsMesh;
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const isLight = theme === "light";
    const bgColor = isLight ? 0xf5f5f5 : 0x0c1222;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 12, 28);
    sceneRef.current = scene;

    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 600;
    const height = rect.height || container.clientHeight || 580;

    // Camera setup - precisely centered at X=0
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 3.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Ensure canvas fills container with absolute centering
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. OrbitControls centered exactly at (0, 1.0, 0)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 1.0;
    controls.maxDistance = 9.0;
    controlsRef.current = controls;

    // 3. Lighting
    const hemiLight = new THREE.HemisphereLight(
      0xffffff,
      isLight ? 0xcccccc : 0x444455,
      isLight ? 2.8 : 1.5
    );
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(
      isLight ? 0xffffff : 0x38bdf8,
      isLight ? 3.2 : 2.4
    );
    dirLight.position.set(3.5, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Additional fill light from the other side for light mode
    const fillLight = new THREE.DirectionalLight(
      isLight ? 0xfff5e6 : 0x1e40af,
      isLight ? 1.5 : 0.4
    );
    fillLight.position.set(-4, 8, -3);
    scene.add(fillLight);

    // Ambient light for even base illumination
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      isLight ? 0.9 : 0.15
    );
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf59e0b, isLight ? 0.8 : 1.6, 8);
    pointLight.position.set(-2.5, 2.5, -1);
    scene.add(pointLight);

    // 4. Ground Grid Floor - Centered at (0, 0, 0)
    const gridColor1 = isLight ? 0xc0c8d4 : 0x38bdf8;
    const gridColor2 = isLight ? 0xe2e8f0 : 0x1e293b;
    const gridHelper = new THREE.GridHelper(24, 24, gridColor1, gridColor2);
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xf0f0f0 : 0x070c18,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0, 0);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorMatRef.current = floorMat;

    // 5. Load glTF 3D Character
    const loader = new GLTFLoader();
    setLoading(true);
    setLoadError(null);
    skinnedMeshesRef.current = [];
    skinnedPointsRef.current = [];

    loader.load(
      "/models/Soldier.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.15, 1.15, 1.15);
        model.position.set(0, 0, 0);
        scene.add(model);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mesh = child as THREE.SkinnedMesh;

            if (mesh.isSkinnedMesh) {
              skinnedMeshesRef.current.push(mesh);

              const points = createSkinnedPoints(mesh);
              points.visible = false;
              mesh.add(points);
              skinnedPointsRef.current.push(points);
            }
          }
        });

        // Add 3D SkeletonHelper
        const skeletonHelper = new THREE.SkeletonHelper(model);
        skeletonHelper.visible = true;
        (skeletonHelper.material as THREE.LineBasicMaterial).linewidth = 3;
        (skeletonHelper.material as THREE.LineBasicMaterial).color.setHex(0x38bdf8);
        scene.add(skeletonHelper);
        skeletonHelperRef.current = skeletonHelper;

        // Animation Mixer setup
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        const actions: { [key: string]: THREE.AnimationAction } = {};
        for (const clip of gltf.animations) {
          actions[clip.name] = mixer.clipAction(clip);
        }
        actionsRef.current = actions;

        const initialAction = actions["Run"] || actions["Walk"] || actions[gltf.animations[0]?.name || ""];
        if (initialAction) {
          initialAction.play();
          activeActionRef.current = initialAction;
        }

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("Failed to load Soldier.glb", err);
        setLoadError("Failed to load 3D character asset.");
        setLoading(false);
      }
    );

    // 6. Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixerRef.current && isPlayingRef.current) {
        mixerRef.current.update(delta * speedRef.current);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 7. Dynamic Resize Observer for accurate container dimensions
    const updateSize = () => {
      if (!container) return;
      const bRect = container.getBoundingClientRect();
      const w = bRect.width;
      const h = bRect.height;
      if (w <= 0 || h <= 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    window.addEventListener("resize", updateSize);
    // Double trigger to catch post-layout stabilization
    requestAnimationFrame(updateSize);
    setTimeout(updateSize, 200);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, []);

  // Update theme dynamically in Three.js
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const isLight = theme === "light";
    const bgColor = isLight ? 0xf5f5f5 : 0x0c1222;

    scene.background = new THREE.Color(bgColor);
    if (scene.fog) scene.fog.color = new THREE.Color(bgColor);

    if (floorMatRef.current) {
      floorMatRef.current.color.setHex(isLight ? 0xf0f0f0 : 0x070c18);
    }
  }, [theme]);

  // Update Animation when user changes state or Step 1 triggers it
  const switchAnimation = (animName: string) => {
    const actions = actionsRef.current;
    const newAction = actions[animName];
    const prevAction = activeActionRef.current;

    if (newAction && newAction !== prevAction) {
      if (prevAction) {
        prevAction.fadeOut(0.3);
      }
      newAction.reset().fadeIn(0.3).play();
      activeActionRef.current = newAction;
      setCurrentAnim(animName);
    }
  };

  // Step-driven automatic visualization adaptations
  useEffect(() => {
    const skeletonHelper = skeletonHelperRef.current;
    const meshes = skinnedMeshesRef.current;
    const points = skinnedPointsRef.current;

    if (currentStep === 1) {
      switchAnimation("Run");
      if (skeletonHelper) skeletonHelper.visible = false;
      meshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).wireframe = false;
        m.visible = true;
      });
      points.forEach((p) => (p.visible = false));
    } else if (currentStep === 2) {
      if (skeletonHelper) {
        skeletonHelper.visible = true;
        (skeletonHelper.material as THREE.LineBasicMaterial).color.setHex(0xf59e0b);
      }
      meshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).wireframe = false;
        m.visible = true;
      });
      points.forEach((p) => (p.visible = false));
    } else if (currentStep === 3) {
      if (skeletonHelper) {
        skeletonHelper.visible = true;
        (skeletonHelper.material as THREE.LineBasicMaterial).color.setHex(0x38bdf8);
      }
      meshes.forEach((m) => (m.visible = true));
      points.forEach((p) => (p.visible = false));
    } else if (currentStep === 4) {
      if (skeletonHelper) {
        skeletonHelper.visible = true;
        (skeletonHelper.material as THREE.LineBasicMaterial).color.setHex(0xec4899);
      }
      meshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).wireframe = true;
        m.visible = true;
      });
      points.forEach((p) => (p.visible = true));
    } else if (currentStep === 5) {
      if (skeletonHelper) skeletonHelper.visible = false;
      meshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).wireframe = false;
        m.visible = true;
      });
      points.forEach((p) => (p.visible = false));
    } else if (currentStep === 6) {
      if (skeletonHelper) skeletonHelper.visible = false;
      meshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).wireframe = false;
        m.visible = true;
      });
      points.forEach((p) => (p.visible = false));
    }
  }, [currentStep]);

  // Manual toggle overrides
  useEffect(() => {
    if (skeletonHelperRef.current) {
      skeletonHelperRef.current.visible = showSkeletonManual;
    }
  }, [showSkeletonManual]);

  useEffect(() => {
    skinnedMeshesRef.current.forEach((m) => {
      (m.material as THREE.MeshStandardMaterial).wireframe = wireframeManual;
    });
  }, [wireframeManual]);

  useEffect(() => {
    skinnedPointsRef.current.forEach((p) => {
      p.visible = pointCloudManual;
    });
  }, [pointCloudManual]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0c1222] shadow-2xl flex flex-col h-[560px] lg:h-[620px] transition-colors duration-300">
      {/* 3D Viewport DOM Container with absolute 100% bounds */}
      <div className="relative w-full flex-1 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
          <RefreshCw className="w-9 h-9 text-cyan-500 animate-spin" />
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">Loading 3D Rigged Soldier Asset...</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Initializing SkinnedMesh, SkeletonHelper & Animation Mixer</div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="text-rose-500 font-bold mb-2">3D Asset Loading Error</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">{loadError}</div>
        </div>
      )}

      {/* Top Floating Badge: Step & Pipeline Stage */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 z-10 max-w-[320px] shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
            3D Pipeline Stage [{currentStep}/6]
          </span>
        </div>
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
          {currentStep === 1 && "CPU Core: Gameplay & AI State"}
          {currentStep === 2 && "CPU SIMD: Skeletal Rig & Hierarchy"}
          {currentStep === 3 && "PCIe 4.0: Bone Matrix Upload (8KB)"}
          {currentStep === 4 && "GPU SIMT: Vertex Skinning Compute"}
          {currentStep === 5 && "GPU Raster: PBR Shading & Normal Maps"}
          {currentStep === 6 && "Display Engine: Presentation & Fences"}
        </div>
      </div>

      {/* Interactive 3D Controls Hint & Recenter Button */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={recenterCamera}
          className="bg-white/90 dark:bg-slate-950/85 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-md transition cursor-pointer"
          title="Recenter character in the middle of the screen"
        >
          <Focus className="w-3.5 h-3.5 text-cyan-500" />
          <span>Recenter</span>
        </button>

        <div className="bg-white/80 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pointer-events-none shadow-md">
          <Rotate3d className="w-4 h-4 text-cyan-500" />
          <span>Rotate 360° • Zoom</span>
        </div>
      </div>

      {/* Bottom Interactive Toolbar */}
      <div className="bg-white/95 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-xs z-10 shadow-md">
        {/* Animation Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mr-1 font-semibold">Clip:</span>
          {["Run", "Walk", "Idle"].map((name) => (
            <button
              key={name}
              onClick={() => switchAnimation(name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentAnim === name
                  ? "bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* 3D Visualization Layer Toggles */}
        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            <input
              type="checkbox"
              checked={showSkeletonManual}
              onChange={(e) => setShowSkeletonManual(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Bones (CPU)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            <input
              type="checkbox"
              checked={wireframeManual}
              onChange={(e) => setWireframeManual(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Wireframe</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            <input
              type="checkbox"
              checked={pointCloudManual}
              onChange={(e) => setPointCloudManual(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Vertices (SIMT)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
