"use client";

import { motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { clsx } from "clsx";

// ============================================================
// GlassCard
// ============================================================
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, glow, hover, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={clsx(
        "glass relative overflow-hidden",
        glow && "glow-emerald",
        hover && "cursor-pointer",
        className
      )}
      whileHover={hover ? { y: -2, borderColor: "rgba(52,211,153,0.2)" } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// SpotlightCard — cursor-following glow effect
// ============================================================
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={ref}
      className={clsx("glass relative overflow-hidden cursor-pointer", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight gradient */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(52,211,153,0.08), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

// ============================================================
// StatusBadge
// ============================================================
type BadgeVariant = "success" | "warning" | "error" | "info" | "muted" | "active" | "review" | "retired";

const badgeConfig: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success:  { bg: "rgba(52,211,153,0.1)",  text: "#34d399", dot: "#34d399" },
  warning:  { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24", dot: "#fbbf24" },
  error:    { bg: "rgba(248,113,113,0.1)", text: "#f87171", dot: "#f87171" },
  info:     { bg: "rgba(96,165,250,0.1)",  text: "#60a5fa", dot: "#60a5fa" },
  muted:    { bg: "rgba(107,114,128,0.1)", text: "#9ca3af", dot: "#6b7280" },
  active:   { bg: "rgba(52,211,153,0.1)",  text: "#34d399", dot: "#34d399" },
  review:   { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24", dot: "#fbbf24" },
  retired:  { bg: "rgba(107,114,128,0.1)", text: "#9ca3af", dot: "#6b7280" },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ variant, label, pulse, className }: StatusBadgeProps) {
  const cfg = badgeConfig[variant] ?? badgeConfig.muted;
  return (
    <span
      className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full", className)}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className={clsx("w-1.5 h-1.5 rounded-full shrink-0", pulse && "animate-pulse")}
        style={{ background: cfg.dot }}
      />
      {label}
    </span>
  );
}

// ============================================================
// AnimatedMetric — count-up number
// ============================================================
import { useEffect } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedMetricProps {
  value: number;
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
  accent?: boolean;
  className?: string;
}

export function AnimatedMetric({ value, label, sublabel, prefix, suffix, accent, className }: AnimatedMetricProps) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, v => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: [0.25, 0.1, 0.25, 1],
      delay: 0.2,
    });
    return controls.stop;
  }, [value, motionVal]);

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <motion.span
        className="text-4xl font-bold tabular-nums"
        style={{ color: accent ? "var(--emerald)" : "var(--text-primary)" }}
      >
        {prefix}
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.span>
      {sublabel && (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

// ============================================================
// ConfidenceRing — animated radial indicator
// ============================================================
interface ConfidenceRingProps {
  value: number; // 0–1
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ConfidenceRing({ value, size = 80, strokeWidth = 6, className }: ConfidenceRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));

  // Color based on confidence
  const color = pct >= 0.85 ? "var(--emerald)" : pct >= 0.65 ? "var(--status-warn)" : "var(--status-err)";

  return (
    <div className={clsx("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold tabular-nums" style={{ color }}>
          {Math.round(pct * 100)}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>%</span>
      </div>
    </div>
  );
}

// ============================================================
// PageHeader
// ============================================================
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <motion.div
      className={clsx("flex items-start justify-between gap-4 mb-8", className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--emerald)" }}
          >
            {eyebrow}
          </span>
        )}
        <h2 style={{ margin: 0 }}>{title}</h2>
        {subtitle && (
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </motion.div>
  );
}

// ============================================================
// EmptyState
// ============================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "var(--emerald-soft)", color: "var(--emerald)" }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
        {description && (
          <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>{description}</p>
        )}
      </div>
      {action}
    </motion.div>
  );
}

// ============================================================
// LoadingState
// ============================================================
interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export function LoadingState({ message = "Loading...", compact }: LoadingStateProps) {
  return (
    <motion.div
      className={clsx("flex items-center gap-3", compact ? "py-4" : "py-16 justify-center")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Spinner */}
      <div className="relative w-5 h-5 shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: "var(--emerald-soft)", borderTopColor: "var(--emerald)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{message}</span>
    </motion.div>
  );
}

// ============================================================
// ErrorState
// ============================================================
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
        style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
      >
        ⚠
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>{message}</p>
      </div>
      {onRetry && (
        <PrimaryButton onClick={onRetry} size="sm">Retry</PrimaryButton>
      )}
    </motion.div>
  );
}

// ============================================================
// Button components
// ============================================================
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
}

export function PrimaryButton({ children, onClick, disabled, loading, size = "md", className }: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <motion.button
      className={clsx(
        "inline-flex items-center gap-2 font-semibold rounded-lg transition-all",
        sizeClasses[size],
        className
      )}
      style={{
        background: disabled ? "rgba(52,211,153,0.2)" : "var(--emerald)",
        color: disabled ? "var(--text-muted)" : "#0a0f0d",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      whileHover={!disabled ? { scale: 1.02, filter: "brightness(1.1)" } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {loading && (
        <motion.span
          className="w-3 h-3 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
}

export function SecondaryButton({ children, onClick, disabled, size = "md", className }: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <motion.button
      className={clsx(
        "inline-flex items-center gap-2 font-semibold rounded-lg border transition-all",
        sizeClasses[size],
        className
      )}
      style={{
        background: "transparent",
        color: "var(--text-secondary)",
        borderColor: "var(--border)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      whileHover={!disabled ? { borderColor: "rgba(52,211,153,0.4)", color: "var(--text-primary)" } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

// ============================================================
// SectionReveal — scroll-triggered fade-in
// ============================================================
interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// Divider
// ============================================================
export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={clsx("h-px w-full", className)}
      style={{ background: "var(--border)" }}
    />
  );
}

// ============================================================
// Tag/Chip
// ============================================================
export function Chip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={clsx("inline-flex px-2 py-0.5 text-xs rounded-md font-medium", className)}
      style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
    >
      {label}
    </span>
  );
}

// ============================================================
// Monospace ID
// ============================================================
export function MonoId({ children, className }: { children: string; className?: string }) {
  return (
    <code
      className={clsx("text-xs px-1.5 py-0.5 rounded", className)}
      style={{ background: "var(--bg-overlay)", color: "var(--text-muted)", fontFamily: "monospace" }}
    >
      {children}
    </code>
  );
}
