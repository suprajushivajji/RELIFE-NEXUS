"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Database,
  GitCompareArrows,
  Sparkles,
  RefreshCw,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { AuroraBackground, DotGrid } from "./backgrounds";
import {
  SpotlightCard,
  StatusBadge,
  AnimatedMetric,
  SectionReveal,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
  MonoId,
} from "./ui";

// ============================================================
// Types (matching backend API shapes)
// ============================================================
type Asset = {
  id: string;
  name: string;
  category: string;
  department: string;
  location: string;
  condition: string;
  usageStatus: string;
  lifecycleStatus: string;
  brand?: string | null;
  model?: string | null;
  purchaseYear?: number;
  replacementCost?: number | null;
};

interface DashboardProps {
  assets: Asset[];
  loading: boolean;
  onAnalyze: (asset: Asset) => void;
  onNavigate: (page: string) => void;
}

// ============================================================
// Lifecycle Flow Visualization
// ============================================================
const lifecycleSteps = [
  { label: "Asset",    icon: <Database size={14} />,        color: "var(--ai-blue)" },
  { label: "Analyze",  icon: <Cpu size={14} />,             color: "var(--ai-violet)" },
  { label: "Evidence", icon: <Sparkles size={14} />,        color: "var(--emerald)" },
  { label: "Decide",   icon: <CheckCircle size={14} />,     color: "var(--teal)" },
  { label: "Reuse",    icon: <RefreshCw size={14} />,       color: "var(--emerald)" },
  { label: "Impact",   icon: <TrendingUp size={14} />,      color: "var(--mint)" },
];

function LifecycleFlow() {
  return (
    <div className="flex items-center justify-between gap-1 py-2">
      {lifecycleSteps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <motion.div
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.3, duration: 0.4 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${step.color}18`, border: `1px solid ${step.color}40`, color: step.color }}
            >
              {step.icon}
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{step.label}</span>
          </motion.div>
          {i < lifecycleSteps.length - 1 && (
            <motion.div
              className="flex-1 h-px mx-1 mb-4"
              style={{ background: "var(--border)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.08 + 0.5, duration: 0.3 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Condition / Status helpers
// ============================================================
function conditionVariant(c: string): "success" | "warning" | "error" | "muted" {
  if (c === "EXCELLENT" || c === "GOOD") return "success";
  if (c === "FAIR") return "warning";
  if (c === "POOR" || c === "UNSAFE") return "error";
  return "muted";
}

// ============================================================
// Dashboard Component
// ============================================================
export function Dashboard({ assets, loading, onAnalyze, onNavigate }: DashboardProps) {
  const total     = assets.length;
  const available = assets.filter(a => a.lifecycleStatus === "AVAILABLE").length;
  const inUse     = assets.filter(a => a.usageStatus === "ACTIVE").length;
  const review    = assets.filter(a => a.lifecycleStatus === "UNDER_REVIEW").length;
  const recent    = assets.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      {/* ======================================================
          HERO SECTION
          ====================================================== */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <AuroraBackground />
        <DotGrid />

        <div className="relative z-10 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{ background: "var(--emerald-soft)", color: "var(--emerald)", border: "1px solid var(--border-accent)" }}
              >
                AI-Powered
              </span>
              <span
                className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{ background: "var(--ai-glow)", color: "var(--ai-blue)", border: "1px solid rgba(96,165,250,0.2)" }}
              >
                Circular Economy
              </span>
            </div>

            <h1
              className="font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #f0f4f1 0%, #34d399 50%, #6ee7b7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
              }}
            >
              Circular Resource
              <br />Intelligence
            </h1>

            <p className="text-base mb-6 max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Turn existing resources into intelligent lifecycle decisions.
              AI-powered matching, analysis and audit across your entire asset inventory.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <PrimaryButton onClick={() => onNavigate("Analyze Asset")} size="lg">
                <Cpu size={15} />
                Analyze Asset
                <ArrowRight size={14} />
              </PrimaryButton>
              <SecondaryButton onClick={() => onNavigate("Resource Matching")} size="lg">
                <GitCompareArrows size={15} />
                Find Matches
              </SecondaryButton>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================
          METRICS BENTO GRID
          ====================================================== */}
      <SectionReveal delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Assets",      value: total,     sublabel: "In registry",          accent: false },
            { label: "Available",         value: available, sublabel: "Ready for reuse",       accent: true  },
            { label: "Active",            value: inUse,     sublabel: "Currently in service",  accent: false },
            { label: "Under Review",      value: review,    sublabel: "Awaiting decision",     accent: false },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="glass p-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
              whileHover={{ y: -2 }}
            >
              <AnimatedMetric
                label={m.label}
                value={m.value}
                sublabel={m.sublabel}
                accent={m.accent}
              />
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      {/* ======================================================
          BENTO LAYOUT — Main content
          ====================================================== */}
      <SectionReveal delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Lifecycle Flow — large card */}
          <SpotlightCard className="md:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--emerald)" }}>
                  Lifecycle Pipeline
                </p>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  AI-Driven Circular Flow
                </h3>
              </div>
              <div
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "var(--emerald-soft)", color: "var(--emerald)", border: "1px solid var(--border-accent)" }}
              >
                AI Active
              </div>
            </div>
            <LifecycleFlow />
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
              Every asset flows through evidence-based AI analysis before a human-approved lifecycle decision.
            </p>
          </SpotlightCard>

          {/* Quick actions */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Analyze Asset",     sub: "AI lifecycle analysis",   icon: <Cpu size={18} />,             page: "Analyze Asset",     color: "var(--emerald)" },
              { label: "Find Matches",      sub: "Resource matching",        icon: <GitCompareArrows size={18} />,page: "Resource Matching", color: "var(--ai-blue)" },
              { label: "View Impact",       sub: "Circular metrics",         icon: <TrendingUp size={18} />,      page: "Impact",            color: "var(--ai-violet)" },
            ].map((action) => (
              <motion.button
                key={action.label}
                className="glass text-left p-4 flex items-center gap-3 group"
                whileHover={{ y: -1, borderColor: "rgba(52,211,153,0.2)" }}
                transition={{ duration: 0.2 }}
                onClick={() => onNavigate(action.page)}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${action.color}15`, color: action.color }}
                >
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{action.label}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{action.sub}</p>
                </div>
                <ArrowRight size={14} style={{ color: "var(--text-muted)" }} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ======================================================
          RECENT ASSETS
          ====================================================== */}
      <SectionReveal delay={0.3}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
              Inventory
            </p>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Recent Assets</h3>
          </div>
          <SecondaryButton onClick={() => onNavigate("Asset Registry")} size="sm">
            View all
            <ArrowRight size={12} />
          </SecondaryButton>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Database size={22} />}
            title="No assets yet"
            description="Assets will appear here as they are added to the registry."
          />
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {recent.map((asset, i) => (
              <motion.div
                key={asset.id}
                className="flex items-center gap-4 px-5 py-3.5 group cursor-pointer"
                style={{
                  borderBottom: i < recent.length - 1 ? "1px solid var(--border)" : "none",
                  background: "var(--bg-surface)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ background: "var(--bg-elevated)" }}
                onClick={() => onAnalyze(asset)}
              >
                {/* Category icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}
                >
                  {asset.category.slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {asset.name}
                    </span>
                    <MonoId>{asset.id}</MonoId>
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {asset.department} · {asset.location}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge
                    variant={conditionVariant(asset.condition) as "success" | "warning" | "error" | "muted"}
                    label={asset.condition}
                  />
                  <span
                    className="text-xs hidden sm:block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {asset.lifecycleStatus.replace("_", " ")}
                  </span>
                </div>

                {/* Analyze button */}
                <button
                  className="text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "var(--emerald-soft)", color: "var(--emerald)" }}
                  onClick={e => { e.stopPropagation(); onAnalyze(asset); }}
                >
                  Analyze
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </SectionReveal>

      {/* ======================================================
          STATUS ROW
          ====================================================== */}
      <SectionReveal delay={0.4}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "AI System",         status: "ACTIVE", variant: "success" as const },
            { label: "Human Oversight",   status: "ACTIVE", variant: "success" as const },
            { label: "Audit Logging",     status: "ACTIVE", variant: "success" as const },
            { label: "Safety Guardrails", status: "ACTIVE", variant: "success" as const },
          ].map(item => (
            <div
              key={item.label}
              className="glass p-4 flex items-center gap-3"
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--emerald)" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "var(--emerald)" }}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>
    </div>
  );
}
