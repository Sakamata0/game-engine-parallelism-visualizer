"use client";

import React from "react";
import { Code2, Terminal, BookOpen } from "lucide-react";

interface CodeViewerProps {
  currentStep: number;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ currentStep }) => {
  const stepData = [
    null,
    // Step 1: Gameplay & AI State
    {
      title: "Step 1: Gameplay & AI State Machine",
      lang: "C++ (Game Logic)",
      file: "CharacterController.cpp",
      concept: "CPU Sequential Logic & Branching",
      explanation:
        "The CPU main thread handles player inputs, collision checks, and state transitions. In modern Data-Oriented Design (DOD), states are stored in contiguous arrays for high L1 cache locality.",
      code: `// Run on CPU Core 0 (Main Thread)
void CharacterController::Update(float deltaTime, const InputState& input) {
    if (input.isMoving && player.stamina > 0.0f) {
        player.state = ECharacterState::RUNNING;
        player.currentSpeed = glm::mix(player.currentSpeed, RUN_SPEED, deltaTime * 8.0f);
        
        // Spawn asynchronous animation job onto Worker Threads
        JobSystem::KickJob(new SkeletalEvaluationJob(player.skeleton, player.currentSpeed));
    } else {
        player.state = ECharacterState::IDLE;
    }
}`,
    },
    // Step 2: Skeletal Rig & IK
    {
      title: "Step 2: Skeletal Rig & Inverse Kinematics (IK)",
      lang: "C++ (SIMD AVX-256)",
      file: "AnimationJob.cpp",
      concept: "Multi-core Task Graphs & Matrix Hierarchies",
      explanation:
        "CPU worker threads traverse the 54-bone parent-child tree. Local bone transforms are multiplied into Model-Space matrices. SIMD registers (AVX/NEON) multiply 4x4 matrices in parallel across CPU cores.",
      code: `// Executed across CPU Worker Threads via Fiber / Job System
void EvaluateSkeletalPose(const Skeleton& skeleton, glm::mat4* outFinalMatrices) {
    // 54 bones traversed hierarchically (Root -> Spine -> Limbs)
    for (uint32_t i = 0; i < skeleton.boneCount; ++i) {
        const int parentIdx = skeleton.parentIndices[i];
        
        // ModelMatrix[i] = ModelMatrix[parent] * LocalTransform[i]
        // SIMD vectorization speeds up this 4x4 matrix multiplication
        glm::mat4 globalTransform = (parentIdx >= 0) 
            ? outFinalMatrices[parentIdx] * skeleton.localPoses[i]
            : skeleton.localPoses[i];
            
        // Final Matrix converts vertex from mesh rest-pose into animated pose
        outFinalMatrices[i] = globalTransform * skeleton.inverseBindPose[i];
    }
}`,
    },
    // Step 3: PCIe Data Transfer
    {
      title: "Step 3: Host-to-Device Memory Transfer",
      lang: "C++ / Vulkan API",
      file: "VulkanUploadBuffer.cpp",
      concept: "Ring Allocator & Host-Visible VRAM",
      explanation:
        "Rather than stalling to upload data, modern engines write into a persistently mapped 'Upload Heap'. 54 matrices × 64 bytes = 3.45 KB is streamed across PCIe 4.0 in less than 0.2 microseconds without driver overhead.",
      code: `// CPU writes 3.45 KB of bone matrices to Host-Visible VRAM
struct FrameUniforms {
    glm::mat4 BoneMatrices[64]; // 64 * 64 bytes = 4 KB
    glm::mat4 ViewProjection;
};

void UploadBoneData(const FrameUniforms& data, uint32_t frameIndex) {
    // Persistent mapped pointer (No vkMapMemory syscall overhead every frame!)
    uint8_t* destination = pMappedUploadRingBuffer + (frameIndex * FRAME_OFFSET);
    
    // Fast contiguous memory copy across PCIe bus
    memcpy(destination, &data, sizeof(FrameUniforms));
    
    // Non-coherent memory flush (if device requires explicit cache flushing)
    VkMappedMemoryRange memoryRange = { VK_STRUCTURE_TYPE_MAPPED_MEMORY_RANGE };
    memoryRange.memory = uploadMemoryHandle;
    memoryRange.offset = frameIndex * FRAME_OFFSET;
    memoryRange.size   = sizeof(FrameUniforms);
    vkFlushMappedMemoryRanges(device, 1, &memoryRange);
}`,
    },
    // Step 4: Linear Blend Skinning
    {
      title: "Step 4: Linear Blend Skinning (LBS)",
      lang: "HLSL / Compute Shader",
      file: "SkinningCompute.hlsl",
      concept: "GPU SIMT (Single Instruction, Multiple Threads)",
      explanation:
        "The GPU launches thousands of threads concurrently. Each thread processes a single 3D vertex, deforming its position by interpolating up to 4 influencing bone matrices. 50,000 vertices are processed in ~0.35 milliseconds.",
      code: `// HLSL Compute Shader executed in parallel on GPU Warps (32 or 64 threads)
StructuredBuffer<Vertex> g_RestVertices     : register(t0);
StructuredBuffer<float4x4> g_BoneMatrices   : register(t1);
RWStructuredBuffer<Vertex> g_SkinnedVertices : register(u0);

[numthreads(64, 1, 1)] // 64 threads per threadgroup
void CSMain(uint3 dispatchThreadID : SV_DispatchThreadID) {
    uint vertexID = dispatchThreadID.x;
    if (vertexID >= g_TotalVertexCount) return;

    Vertex v = g_RestVertices[vertexID];
    float4 animatedPos = float4(0, 0, 0, 0);
    
    // Linear Blend Skinning (LBS) formula: v' = Sum( Weight_i * BoneMatrix_i * v )
    [unroll]
    for (int i = 0; i < 4; ++i) {
        uint boneIndex = v.BoneIndices[i];
        float boneWeight = v.BoneWeights[i];
        
        animatedPos += mul(g_BoneMatrices[boneIndex], float4(v.Position, 1.0f)) * boneWeight;
    }
    
    g_SkinnedVertices[vertexID].Position = animatedPos.xyz;
}`,
    },
    // Step 5: Rasterization & Shading
    {
      title: "Step 5: Rasterization & Fragment Shading",
      lang: "GLSL / Pixel Shader",
      file: "PBRShading.frag",
      concept: "Wavefront Pixel Execution & Cook-Torrance PBR",
      explanation:
        "Hardware rasterizers turn triangles into pixel fragments. Fragment shaders calculate Cook-Torrance Physically Based Rendering (PBR), normal map tangents, shadows, and roughness across massive SIMT wavefronts.",
      code: `// Fragment Shader executed per screen pixel
layout(location = 0) in vec3 v_WorldPos;
layout(location = 1) in vec3 v_Normal;
layout(location = 2) in vec2 v_TexCoords;

layout(location = 0) out vec4 outFragColor;

void main() {
    vec3 N = normalize(v_Normal);
    vec3 V = normalize(u_CameraPos - v_WorldPos);
    vec3 L = normalize(u_LightPos - v_WorldPos);
    
    // Evaluate Cook-Torrance BRDF (Physically Based Rendering)
    vec3 albedo   = texture(u_AlbedoMap, v_TexCoords).rgb;
    float metallic = texture(u_MetallicRoughnessMap, v_TexCoords).b;
    float rough    = texture(u_MetallicRoughnessMap, v_TexCoords).g;
    
    vec3 color = EvaluatePBR(N, V, L, albedo, metallic, rough);
    outFragColor = vec4(color, 1.0);
}`,
    },
    // Step 6: Presentation & Synchronization
    {
      title: "Step 6: Frame Presentation & Fences",
      lang: "C++ / Vulkan Synchronization",
      file: "EngineFrameSync.cpp",
      concept: "Producer-Consumer Queue & Triple Buffering",
      explanation:
        "The GPU finishes rendering into the Backbuffer and presents it to the display engine. The CPU checks `vkWaitForFences` to avoid rendering more than 2 frames ahead (preventing input lag).",
      code: `// CPU-GPU Synchronization loop at frame boundary
void PresentAndSynchronize(VkDevice device, VkQueue queue, uint32_t frameIndex) {
    // 1. Submit recorded command buffer with synchronization fence
    VkSubmitInfo submitInfo = { VK_STRUCTURE_TYPE_SUBMIT_INFO };
    submitInfo.pCommandBuffers = &g_CommandBuffers[frameIndex];
    
    // Signal g_Fences[frameIndex] when GPU completes all draw calls
    vkQueueSubmit(queue, 1, &submitInfo, g_Fences[frameIndex]);

    // 2. Hand image to swapchain for display (vsync / presentation)
    VkPresentInfoKHR presentInfo = { VK_STRUCTURE_TYPE_PRESENT_INFO_KHR };
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains    = &g_Swapchain;
    presentInfo.pImageIndices  = &g_CurrentImageIndex;
    vkQueuePresentKHR(queue, &presentInfo);

    // 3. Prevent CPU from running too far ahead (Max 2 frames in flight)
    uint32_t nextFrameSlot = (frameIndex + 1) % MAX_FRAMES_IN_FLIGHT;
    vkWaitForFences(device, 1, &g_Fences[nextFrameSlot], VK_TRUE, UINT64_MAX);
    vkResetFences(device, 1, &g_Fences[nextFrameSlot]);
}`,
    },
  ];

  const current = stepData[currentStep] || stepData[1]!;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1527] overflow-hidden shadow-xl flex flex-col h-full transition-colors duration-300">
      {/* Code header bar */}
      <div className="bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">{current.file}</span>
          <span className="text-[11px] bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60 px-2 py-0.5 rounded-lg font-mono font-semibold">
            {current.lang}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{current.concept}</span>
        </div>
      </div>

      {/* Educational Explanation Box */}
      <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
        <span className="bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
          Engineering Insight
        </span>
        <p>{current.explanation}</p>
      </div>

      {/* Code Body */}
      <div className="p-4 font-mono text-xs text-slate-100 overflow-x-auto bg-[#0a0f1d] flex-1 leading-relaxed">
        <pre>
          <code>{current.code}</code>
        </pre>
      </div>
    </div>
  );
};
