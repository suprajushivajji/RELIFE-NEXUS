"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Lock,
  AlertTriangle,
  HelpCircle,
  User,
  BookOpen,
  CheckCircle,
  ArrowDown,
  Cpu,
  Star,
} from "lucide-react";
import { TechGrid } from "./backgrounds";
import {
  SpotlightCard,
  PageHeader,
  LoadingState,
  SectionReveal,
} from "./ui";

// ============================================================
// Types
// ============================================================
type ResponsibleAIInfo = {
  aiProvider: string;
  aiModel: string;
  aiFallbackModel: string;
  timeoutMs: number;
  maxRetries: number;
  guardrails: {
    fairness: string;
    transparency: string;
    privacy: string;
    safety: string;
    uncertainty: string;
    humanOversight: string;
    auditability: string;
  };
  supportedDecisions: string[];
  humanOversightRequired: boolean;
  dataHandling: {
    sentToAI: string[];
    notSentToAI: string[];
  };
};

// ============================================================
// Principle card config
// ============================================================
const principles = [
  {
    key: "fairness" as const,
    label: "Fairness",
    icon: <Star size={16} />,
    color: "var(--emerald)",
    bg: "var(--emerald-soft)",
    description: "Recommendations are based on objective factors such as condition, compatibility, availability, and lifecycle suitability — not on employee identity, gender, race, religion, or department prestige.",
  },
  {
    key: "transparency" as const,
    label: "Transparency",
    icon: <Eye size={16} />,
    color: "var(--ai-blue)",
    bg: "var(--ai-glow)",
    description: "Every recommendation includes the decision, confidence level, reasons, evidence sources, assumptions, and unknowns. Nothing is hidden.",
  },
  {
    key: "privacy" as const,
    label: "Privacy",
    icon: <Lock size={16} />,
    color: "var(--ai-violet)",
    bg: "rgba(167,139,250,0.08)",
    description: "API keys remain server-side. Only required asset information is processed. Personal employee data should not be transmitted to AI systems.",
  },
  {
    key: "safety" as const,
    label: "Safety",
    icon: <AlertTriangle size={16} />,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    description: "Unsafe assets require mandatory human review. AI must not autonomously authorize hazardous repair, disposal, procurement, or irreversible decisions.",
  },
  {
    key: "uncertainty" as const,
    label: "Uncertainty",
    icon: <HelpCircle size={16} />,
    color: "var(--teal)",
    bg: "rgba(45,212,191,0.08)",
    description: "When evidence is insufficient, the system explicitly returns UNKNOWN, INSUFFICIENT_EVIDENCE, or NEEDS_REVIEW — never fabricating confidence.",
  },
  {
    key: "humanOversight" as const,
    label: "Human Oversight",
    icon: <User size={16} />,
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    description: "AI recommends. Humans decide. Every lifecycle recommendation requires explicit human approval before any action is taken.",
  },
  {
    key: "auditability" as const,
    label: "Auditability",
    icon: <BookOpen size={16} />,
    color: "var(--mint)",
    bg: "rgba(110,231,183,0.08)",
    description: "All decisions are traceable through structured audit records. Any recommendation, human decision, or system action can be reviewed and explained.",
  },
];

// ============================================================
// AI Decision Flow Visual
// ============================================================
const flowSteps = [
  { label: "AI Analysis",      icon: <Cpu size={14} />,      color: "var(--ai-blue)" },
  { label: "Evidence",         icon: <BookOpen size={14} />, color: "var(--ai-violet)" },
  { label: "Recommendation",   icon: <Star size={14} />,     color: "var(--emerald)" },
  { label: "Human Review",     icon: <User size={14} />,     color: "#fbbf24" },
  { label: "Decision",         icon: <CheckCircle size={14} />, color: "var(--emerald)" },
];

function AIDecisionFlow() {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {flowSteps.map((step, i) => (
        <div key={step.label} className="flex flex-col items-center">
          <motion.div
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${step.color}30`,
              color: step.color,
            }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
            whileHover={{ borderColor: `${step.color}60`, x: 4 }}
          >
            <span>{step.icon}</span>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{step.label}</span>
          </motion.div>

          {i < flowSteps.length - 1 && (
            <motion.div
              className="flex flex-col items-center gap-0.5 my-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.35 }}
            >
              <ArrowDown size={14} style={{ color: "var(--text-muted)" }} />
            </motion.div>
          )}
        </div>
      ))}

      {/* Central message */}
      <motion.div
        className="mt-4 px-5 py-2 rounded-full text-xs font-semibold"
        style={{
          background: "var(--emerald-soft)",
          color: "var(--emerald)",
          border: "1px solid var(--border-accent)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        AI RECOMMENDS · HUMANS DECIDE
      </motion.div>
    </div>
  );
}

// ============================================================
// Status indicator card
// ============================================================
function SystemStatusCard({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <motion.div
      className="glass p-4 flex items-center gap-3"
      whileHover={{ y: -1 }}
    >
      <div className="relative">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.4 }}
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-xs" style={{ color }}>{status}</p>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main ResponsibleAIPage Component
// ============================================================
interface ResponsibleAIPageProps {
  info: ResponsibleAIInfo | null;
  loading: boolean;
}

export function ResponsibleAIPage({ info, loading }: ResponsibleAIPageProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <PageHeader
        eyebrow="AI Governance"
        title="Responsible AI"
        subtitle="Every recommendation should be explainable, reviewable, and accountable."
      />

      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden p-8"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <TechGrid />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Left: tagline */}
          <div className="flex-1">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full inline-block mb-4"
              style={{ background: "var(--ai-glow)", color: "var(--ai-blue)", border: "1px solid rgba(96,165,250,0.2)" }}
            >
              AI Ethics
            </span>
            <h2
              className="font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #f0f4f1 40%, var(--ai-blue))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI Recommends.
              <br />Humans Decide.
            </h2>
            <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              ReLife Nexus is built on the principle that AI should support — not replace — human judgment.
              Every lifecycle decision remains under human control.
            </p>
          </div>

          {/* Right: flow */}
          <div className="shrink-0 w-full md:w-60">
            <AIDecisionFlow />
          </div>
        </div>
      </div>

      {/* System status row */}
      <SectionReveal delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Human Oversight",     status: "ACTIVE",  color: "var(--emerald)" },
            { label: "Safety Guardrails",   status: "ACTIVE",  color: "var(--emerald)" },
            { label: "Uncertainty Handling",status: "ACTIVE",  color: "var(--emerald)" },
            { label: "Evidence Traceability",status: "ACTIVE", color: "var(--emerald)" },
            { label: "Audit Logging",        status: "ACTIVE", color: "var(--emerald)" },
          ].map(item => (
            <SystemStatusCard key={item.label} label={item.label} status={item.status} color={item.color} />
          ))}
        </div>
      </SectionReveal>

      {/* Principles bento */}
      <SectionReveal delay={0.15}>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            Governance Principles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map((p, i) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 + 0.1 }}
              >
                <SpotlightCard className="p-5 h-full flex flex-col gap-3">
                  {/* Icon + label */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: p.bg, color: p.color }}
                    >
                      {p.icon}
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.label}</p>
                  </div>

                  {/* Guardrail text from backend */}
                  {info ? (
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                      {info.guardrails[p.key]}
                    </p>
                  ) : (
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                      {p.description}
                    </p>
                  )}
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* System configuration (from backend) */}
      {loading && <LoadingState message="Loading AI configuration…" />}

      {info && (
        <SectionReveal delay={0.2}>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              System Configuration
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "AI Provider",       value: info.aiProvider },
                { label: "Primary Model",     value: info.aiModel },
                { label: "Fallback Model",    value: info.aiFallbackModel },
                { label: "Timeout",           value: `${info.timeoutMs}ms` },
                { label: "Max Retries",       value: String(info.maxRetries) },
                { label: "Human Oversight",   value: info.humanOversightRequired ? "Required" : "Optional" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="glass p-4 flex flex-col gap-1"
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      )}

      {/* Data handling */}
      {info && (
        <SectionReveal delay={0.25}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sent to AI */}
            <div className="glass p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--emerald)" }} />
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>
                  Sent to AI
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {info.dataHandling.sentToAI.map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <CheckCircle size={11} style={{ color: "var(--emerald)", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not sent to AI */}
            <div className="glass p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f87171" }} />
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>
                  Not Sent to AI
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {info.dataHandling.notSentToAI.map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <Lock size={11} style={{ color: "#f87171", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>
      )}

      {/* Supported decisions */}
      {info?.supportedDecisions && info.supportedDecisions.length > 0 && (
        <SectionReveal delay={0.3}>
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              Supported Lifecycle Decisions
            </p>
            <div className="flex flex-wrap gap-2">
              {info.supportedDecisions.map(d => (
                <span
                  key={d}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontFamily: "monospace" }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </SectionReveal>
      )}
    </div>
  );
}
