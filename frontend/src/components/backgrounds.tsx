"use client";

import { motion } from "framer-motion";

// ============================================================
// AuroraBackground — subtle animated gradient aurora
// ============================================================
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* Primary aurora blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60%",
          height: "60%",
          top: "-10%",
          left: "-5%",
          background: "radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 30, -10, 20, 0],
          y: [0, -20, 15, -5, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary aurora blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "50%",
          height: "50%",
          top: "30%",
          right: "-10%",
          background: "radial-gradient(ellipse, rgba(96,165,250,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, -25, 10, -15, 0],
          y: [0, 20, -10, 15, 0],
          scale: [1, 0.9, 1.1, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      {/* Accent blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40%",
          height: "40%",
          bottom: "-5%",
          left: "30%",
          background: "radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{
          x: [0, 15, -20, 10, 0],
          y: [0, -15, 20, -10, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
    </div>
  );
}

// ============================================================
// DotGrid — subtle animated dot matrix background
// ============================================================
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }}
    />
  );
}

// ============================================================
// TechGrid — technical grid lines
// ============================================================
export function TechGrid({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 50%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 50%, transparent 100%)",
      }}
    />
  );
}

// ============================================================
// GradientWave — subtle moving gradient
// ============================================================
export function GradientWave({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(52,211,153,0.04) 0%, transparent 40%, rgba(96,165,250,0.04) 60%, transparent 100%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ============================================================
// SubtleParticles — minimal floating particles
// ============================================================
interface Particle { id: number; x: number; y: number; size: number; duration: number; delay: number; }

export function SubtleParticles({ count = 12, className }: { count?: number; className?: string }) {
  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 37 + 17) % 100,
    y: (i * 53 + 29) % 100,
    size: 1 + (i % 2),
    duration: 10 + (i % 5) * 3,
    delay: (i * 1.4) % 8,
  }));

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? "var(--emerald)" : p.id % 3 === 1 ? "var(--ai-blue)" : "var(--ai-violet)",
            opacity: 0.3,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
