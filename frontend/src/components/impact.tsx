"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  MinusCircle,
} from "lucide-react";
import { GradientWave } from "./backgrounds";
import {
  SpotlightCard,
  PageHeader,
  SecondaryButton,
  EmptyState,
  SectionReveal,
  AnimatedMetric,
} from "./ui";

// ============================================================
// Types
// ============================================================
type ImpactMetric = { value: number | null; status: string };
type Impact = {
  assetsCirculated: number;
  procurementAvoided: ImpactMetric;
  costDifference: ImpactMetric;
  lifeExtensionMonths: ImpactMetric;
  wasteAvoidedKg: ImpactMetric;
  assumptions: string[];
  message: string;
};

// ============================================================
// Data quality badge
// ============================================================
type DataQuality = "MEASURED" | "ESTIMATED" | "UNAVAILABLE";

function DataQualityBadge({ quality }: { quality: DataQuality }) {
  const config = {
    MEASURED:    { color: "var(--emerald)", bg: "var(--emerald-soft)", icon: <CheckCircle size={11} /> },
    ESTIMATED:   { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", icon: <AlertCircle size={11} /> },
    UNAVAILABLE: { color: "var(--text-muted)", bg: "var(--bg-overlay)", icon: <MinusCircle size={11} /> },
  };
  const cfg = config[quality] ?? config.UNAVAILABLE;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.icon}
      {quality}
    </span>
  );
}

// ============================================================
// Impact Metric Card
// ============================================================
interface ImpactCardProps {
  label: string;
  value: number | null;
  status: string;
  prefix?: string;
  suffix?: string;
  accent?: boolean;
  delay?: number;
}

function ImpactCard({ label, value, status, prefix, suffix, accent, delay = 0 }: ImpactCardProps) {
  const quality: DataQuality =
    value === null ? "UNAVAILABLE" :
    status === "MEASURED" ? "MEASURED" :
    "ESTIMATED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <SpotlightCard className="p-6 h-full flex flex-col gap-3">
        {/* Label & quality */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            {label}
          </span>
          <DataQualityBadge quality={quality} />
        </div>

        {/* Value */}
        {value !== null ? (
          <AnimatedMetric
            label=""
            value={value}
            prefix={prefix}
            suffix={suffix}
            accent={accent}
            className="flex-1"
          />
        ) : (
          <div className="flex-1 flex items-center">
            <span className="text-3xl font-bold" style={{ color: "var(--text-muted)" }}>—</span>
          </div>
        )}

        {/* Status note */}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {quality === "UNAVAILABLE"
            ? "Data not available yet"
            : quality === "ESTIMATED"
            ? "Estimated from asset records"
            : "Measured from approved actions"}
        </p>
      </SpotlightCard>
    </motion.div>
  );
}

// ============================================================
// Simple bar chart (pure CSS, no library)
// ============================================================
function SimpleBarChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="glass p-5">
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>{title}</p>
      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs w-24 shrink-0 text-right" style={{ color: "var(--text-muted)" }}>
              {item.label}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 + 0.2 }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums w-8" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main ImpactPage Component
// ============================================================
interface ImpactPageProps {
  impact: Impact | null;
  assets: Array<{ condition: string; lifecycleStatus: string; category: string; department: string }>;
  loading: boolean;
  error?: string | null;
  onRefresh: () => Promise<void>;
}

export function ImpactPage({ impact, assets, loading, onRefresh }: ImpactPageProps) {
  // Build chart data from real assets
  const conditionDist = [
    { label: "Excellent", value: assets.filter(a => a.condition === "EXCELLENT").length, color: "#34d399" },
    { label: "Good",      value: assets.filter(a => a.condition === "GOOD").length,      color: "#6ee7b7" },
    { label: "Fair",      value: assets.filter(a => a.condition === "FAIR").length,      color: "#fbbf24" },
    { label: "Poor",      value: assets.filter(a => a.condition === "POOR").length,      color: "#f97316" },
    { label: "Unsafe",    value: assets.filter(a => a.condition === "UNSAFE").length,    color: "#f87171" },
  ].filter(d => d.value > 0);

  const lifecycleDist = [
    { label: "Available",  value: assets.filter(a => a.lifecycleStatus === "AVAILABLE").length,   color: "#34d399" },
    { label: "In Use",     value: assets.filter(a => a.lifecycleStatus === "IN_USE").length,      color: "#60a5fa" },
    { label: "Under Review",value: assets.filter(a => a.lifecycleStatus === "UNDER_REVIEW").length, color: "#fbbf24" },
    { label: "Retired",    value: assets.filter(a => a.lifecycleStatus === "RETIRED").length,     color: "#6b7280" },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <PageHeader
        eyebrow="Circular Economy"
        title="Circular Impact"
        subtitle="Measure what your organization keeps in circulation. Every reused asset tells a story."
        actions={
          <SecondaryButton onClick={onRefresh} size="md">
            <RefreshCw size={14} />
            Refresh
          </SecondaryButton>
        }
      />

      {/* Hero strip */}
      <div
        className="relative rounded-2xl overflow-hidden p-8"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <GradientWave />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--emerald)" }}>
            Impact Philosophy
          </p>
          <h2 className="font-bold mb-3" style={{ maxWidth: 600 }}>
            AI Recommends.
            <span
              style={{
                background: "linear-gradient(135deg, var(--emerald), var(--mint))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {" "}Humans Decide.{" "}
            </span>
            Impact Measured.
          </h2>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Every circular action — reuse, repair, redeploy — is recorded. Impact values are
            clearly labelled as <strong style={{ color: "var(--emerald)" }}>Measured</strong> or{" "}
            <strong style={{ color: "#fbbf24" }}>Estimated</strong> to maintain data integrity.
          </p>
        </div>
      </div>

      {/* Impact metrics */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : !impact ? (
        <EmptyState
          icon={<TrendingUp size={22} />}
          title="No impact data yet"
          description="Impact will appear as approved circular actions accumulate."
          action={
            <SecondaryButton onClick={onRefresh} size="sm">
              <RefreshCw size={13} />
              Refresh
            </SecondaryButton>
          }
        />
      ) : (
        <SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ImpactCard
              label="Assets Circulated"
              value={impact.assetsCirculated}
              status="MEASURED"
              accent
              delay={0}
            />
            <ImpactCard
              label="Procurement Avoided"
              value={impact.procurementAvoided?.value}
              status={impact.procurementAvoided?.status ?? "UNAVAILABLE"}
              prefix="₹"
              accent
              delay={0.08}
            />
            <ImpactCard
              label="Cost Difference"
              value={impact.costDifference?.value}
              status={impact.costDifference?.status ?? "UNAVAILABLE"}
              prefix="₹"
              delay={0.16}
            />
            <ImpactCard
              label="Lifecycle Extension"
              value={impact.lifeExtensionMonths?.value}
              status={impact.lifeExtensionMonths?.status ?? "UNAVAILABLE"}
              suffix=" mo"
              delay={0.24}
            />
            <ImpactCard
              label="Waste Avoided"
              value={impact.wasteAvoidedKg?.value}
              status={impact.wasteAvoidedKg?.status ?? "UNAVAILABLE"}
              suffix=" kg"
              delay={0.32}
            />

            {/* Message card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div
                className="glass p-6 h-full flex flex-col gap-3"
                style={{ borderLeft: "3px solid var(--emerald)" }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--emerald)" }}>
                  System Note
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {impact.message}
                </p>
              </div>
            </motion.div>
          </div>
        </SectionReveal>
      )}

      {/* Data quality legend */}
      <SectionReveal delay={0.1}>
        <div
          className="rounded-xl p-5 flex flex-wrap items-center gap-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase shrink-0" style={{ color: "var(--text-muted)" }}>
            Data Quality
          </p>
          {[
            { label: "Measured", desc: "Calculated from confirmed, completed circular actions", color: "var(--emerald)" },
            { label: "Estimated", desc: "Projected from asset records and standard assumptions", color: "#fbbf24" },
            { label: "Unavailable", desc: "Insufficient data to compute this metric", color: "var(--text-muted)" },
          ].map(q => (
            <div key={q.label} className="flex items-start gap-2.5 flex-1 min-w-48">
              <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: q.color }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{q.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* Asset distribution charts */}
      <SectionReveal delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conditionDist.length > 0 ? (
            <SimpleBarChart data={conditionDist} title="Assets by Condition" />
          ) : (
            <div className="glass p-5">
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Assets by Condition</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No asset data available.</p>
            </div>
          )}

          {lifecycleDist.length > 0 ? (
            <SimpleBarChart data={lifecycleDist} title="Assets by Lifecycle Status" />
          ) : (
            <div className="glass p-5">
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Assets by Lifecycle Status</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No asset data available.</p>
            </div>
          )}
        </div>
      </SectionReveal>

      {/* Assumptions */}
      {impact?.assumptions && impact.assumptions.length > 0 && (
        <SectionReveal delay={0.3}>
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
              Estimation Assumptions
            </p>
            <div className="flex flex-col gap-2">
              {impact.assumptions.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span style={{ color: "var(--text-secondary)" }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      )}
    </div>
  );
}
