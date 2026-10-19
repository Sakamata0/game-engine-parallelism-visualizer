import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parallelism in Game Engines & 3D Rendering | Interactive Pipeline",
  description: "Educational interactive visualizer demonstrating CPU-GPU collaboration, real-time skeletal animation, and parallel computing in game engines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white transition-colors duration-300"
      >
        {children}
      </body>
    </html>
  );
}
