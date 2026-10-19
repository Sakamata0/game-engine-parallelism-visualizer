"use client";

import React, { useEffect, useRef } from "react";

interface SkeletalCanvasProps {
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  showMesh: boolean;
  showBones: boolean;
  showVertices: boolean;
}

export const SkeletalCanvas: React.FC<SkeletalCanvasProps> = ({
  currentStep,
  isPlaying,
  speed,
  showMesh,
  showBones,
  showVertices,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        timeRef.current += dt * speed * 2.8;
      }

      const t = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark subtle grid
      ctx.fillStyle = "#0c1222";
      ctx.fillRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Ground plane
      const groundY = height - 50;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, groundY);
      ctx.lineTo(width - 20, groundY);
      ctx.stroke();

      // Kinematics calculations for running cycle
      const centerX = width / 2;
      const rootY = groundY - 140 + Math.sin(t * 2) * 8; // vertical bounce
      const rootX = centerX;

      // Joint positions
      const hips = { x: rootX, y: rootY };
      const chest = { x: rootX + Math.sin(t) * 4, y: rootY - 50 };
      const head = { x: chest.x + 2, y: chest.y - 30 };

      // Legs kinematics (2 antiphase cycles)
      const legCycleL = t;
      const legCycleR = t + Math.PI;

      // Left leg (thigh, knee, ankle, toe)
      const thighAngleL = Math.sin(legCycleL) * 0.75 + 0.1;
      const kneeAngleL = Math.max(0, Math.sin(legCycleL - 0.9) * 1.1);
      const kneeL = {
        x: hips.x + Math.sin(thighAngleL) * 45,
        y: hips.y + Math.cos(thighAngleL) * 45,
      };
      const footL = {
        x: kneeL.x + Math.sin(thighAngleL + kneeAngleL) * 45,
        y: kneeL.y + Math.cos(thighAngleL + kneeAngleL) * 45,
      };

      // Right leg
      const thighAngleR = Math.sin(legCycleR) * 0.75 + 0.1;
      const kneeAngleR = Math.max(0, Math.sin(legCycleR - 0.9) * 1.1);
      const kneeR = {
        x: hips.x + Math.sin(thighAngleR) * 45,
        y: hips.y + Math.cos(thighAngleR) * 45,
      };
      const footR = {
        x: kneeR.x + Math.sin(thighAngleR + kneeAngleR) * 45,
        y: kneeR.y + Math.cos(thighAngleR + kneeAngleR) * 45,
      };

      // Arms kinematics
      const armCycleL = legCycleR; // opposite to leg
      const armCycleR = legCycleL;
      const elbowL = {
        x: chest.x + Math.sin(Math.sin(armCycleL) * 0.7 - 0.3) * 35,
        y: chest.y + Math.cos(Math.sin(armCycleL) * 0.7 - 0.3) * 35,
      };
      const handL = {
        x: elbowL.x + Math.sin(Math.sin(armCycleL) * 0.5 + 0.5) * 30,
        y: elbowL.y + Math.cos(Math.sin(armCycleL) * 0.5 + 0.5) * 30,
      };

      const elbowR = {
        x: chest.x + Math.sin(Math.sin(armCycleR) * 0.7 - 0.3) * 35,
        y: chest.y + Math.cos(Math.sin(armCycleR) * 0.7 - 0.3) * 35,
      };
      const handR = {
        x: elbowR.x + Math.sin(Math.sin(armCycleR) * 0.5 + 0.5) * 30,
        y: elbowR.y + Math.cos(Math.sin(armCycleR) * 0.5 + 0.5) * 30,
      };

      // Generate skin mesh vertices around bones (Linear Blend Skinning simulation)
      interface Vertex {
        x: number;
        y: number;
        boneWeights: { name: string; weight: number }[];
      }

      const vertices: Vertex[] = [];

      // Helper to generate skin sleeve around a bone segment
      const generateBoneSkin = (
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        radius: number,
        boneName: string,
        segments: number = 4
      ) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        for (let i = 0; i <= segments; i++) {
          const frac = i / segments;
          const px = p1.x + dx * frac;
          const py = p1.y + dy * frac;
          // Left and right envelope points
          vertices.push({
            x: px + nx * radius,
            y: py + ny * radius,
            boneWeights: [{ name: boneName, weight: 1.0 }],
          });
          vertices.push({
            x: px - nx * radius,
            y: py - ny * radius,
            boneWeights: [{ name: boneName, weight: 1.0 }],
          });
        }
      };

      // Build envelope
      generateBoneSkin(hips, chest, 20, "Spine", 3);
      generateBoneSkin(chest, head, 15, "Head", 2);
      generateBoneSkin(hips, kneeL, 14, "Thigh.L", 3);
      generateBoneSkin(kneeL, footL, 10, "Calf.L", 3);
      generateBoneSkin(hips, kneeR, 14, "Thigh.R", 3);
      generateBoneSkin(kneeR, footR, 10, "Calf.R", 3);
      generateBoneSkin(chest, elbowL, 10, "UpperArm.L", 2);
      generateBoneSkin(elbowL, handL, 8, "ForeArm.L", 2);
      generateBoneSkin(chest, elbowR, 10, "UpperArm.R", 2);
      generateBoneSkin(elbowR, handR, 8, "ForeArm.R", 2);

      // RENDER BASED ON STEP HIGHLIGHT
      const isCpuStep = currentStep === 1 || currentStep === 2;
      const isPcieStep = currentStep === 3;
      const isGpuSkinStep = currentStep === 4;
      const isRasterStep = currentStep === 5 || currentStep === 6;

      // 1. Draw Mesh Shading / Triangles if active
      if (showMesh && (isRasterStep || currentStep >= 4)) {
        ctx.fillStyle = isRasterStep ? "rgba(14, 165, 233, 0.25)" : "rgba(99, 102, 241, 0.15)";
        ctx.strokeStyle = isRasterStep ? "rgba(56, 189, 248, 0.7)" : "rgba(165, 180, 252, 0.4)";
        ctx.lineWidth = 1.2;

        // Triangulate consecutive vertices
        for (let i = 0; i < vertices.length - 2; i += 2) {
          ctx.beginPath();
          ctx.moveTo(vertices[i].x, vertices[i].y);
          ctx.lineTo(vertices[i + 1].x, vertices[i + 1].y);
          ctx.lineTo(vertices[i + 2].x, vertices[i + 2].y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // 2. Draw Bones Hierarchy
      if (showBones) {
        const boneColor = isCpuStep ? "#f59e0b" : isPcieStep ? "#38bdf8" : "#10b981";
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        const drawBone = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Joint circle
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
          ctx.fill();
        };

        // Torso & head
        drawBone(hips, chest);
        drawBone(chest, head);

        // Head circle
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(head.x, head.y - 12, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right side (drawn behind)
        drawBone(hips, kneeR);
        drawBone(kneeR, footR);
        drawBone(chest, elbowR);
        drawBone(elbowR, handR);

        // Left side (drawn in front)
        drawBone(hips, kneeL);
        drawBone(kneeL, footL);
        drawBone(chest, elbowL);
        drawBone(elbowL, handL);
      }

      // 3. Draw Skin Vertices (Parallel compute points)
      if (showVertices || isGpuSkinStep) {
        ctx.fillStyle = isGpuSkinStep ? "#ec4899" : "#60a5fa";
        for (const v of vertices) {
          ctx.beginPath();
          ctx.arc(v.x, v.y, isGpuSkinStep ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Step annotations overlay on canvas
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(15, 15, 270, 68);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.strokeRect(15, 15, 270, 68);

      ctx.font = "bold 13px system-ui";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`CURRENT STAGE: [STEP ${currentStep}/6]`, 25, 35);

      ctx.font = "12px system-ui";
      ctx.fillStyle = "#e2e8f0";
      const stepNames = [
        "",
        "CPU Core: Gameplay & AI State",
        "CPU Job: Inverse Kinematics (IK)",
        "PCIe 4.0: Upload 128 Matrices (8KB)",
        "GPU Compute: Linear Blend Skinning",
        "GPU Graphics: Rasterize & Shading",
        "Display Engine: Present & Fences",
      ];
      ctx.fillText(stepNames[currentStep] || "", 25, 54);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px system-ui";
      ctx.fillText("Real-Time Kinematic Simulation", 25, 70);

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [currentStep, isPlaying, speed, showMesh, showBones, showVertices]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0c1222] shadow-2xl">
      <canvas
        ref={canvasRef}
        width={480}
        height={380}
        className="w-full h-auto block"
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        60 FPS Dynamic Rig
      </div>
    </div>
  );
};
