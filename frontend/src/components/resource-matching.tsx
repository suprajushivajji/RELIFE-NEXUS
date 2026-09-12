"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompareArrows,
  Search,
  CheckCircle,
  MapPin,
  BarChart3,
  RefreshCw,
  Star,
} from "lucide-react";
import {
  SpotlightCard,
  StatusBadge,
  PageHeader,
  SecondaryButton,
  EmptyState,
  LoadingState,
  ErrorState,
  MonoId,
  SectionReveal,
} from "./ui";

// ============================================================
// Types
// ============================================================
type ResourceRequest = {
  id: string;
  department: string;
  category: string;
  quantity: number;
  specifications: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
  status: string;
  createdAt: string;
};

type Match = {
  assetId: string;
  compatibilityScore: number;
  reasons: string[];
  condition: string;
  location: string;
};

interface ResourceMatchingProps {
  requests: ResourceRequest[];
  matches: Match[];
  loading: boolean;
  error?: string | null;
  onRefresh: () => Promise<void>;
}

// ============================================================
// Matching stage visualization
// ============================================================
const matchStages = [
  { label: "Searching Inventory",     icon: <Search size={13} /> },
  { label: "Checking Compatibility",  icon: <CheckCircle size={13} /> },
  { label: "Ranking Resources",       icon: <BarChart3 size={13} /> },
  { label: "Matches Found",           icon: <Star size={13} /> },
];

function MatchingStages({ loading, count }: { loading: boolean; count: number }) {
  return (
    <div className="flex items-center justify-between gap-2 py-3 px-1">
      {matchStages.map((stage, i) => {
        const isDone = !loading && count > 0 && i === matchStages.length - 1;

        return (
          <div key={stage.label} className="flex items-center gap-2">
            <motion.div
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: (loading && i < 3) || isDone ? 1 : 0.4 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: isDone ? "var(--emerald-soft)" : "var(--bg-overlay)",
                  color: isDone ? "var(--emerald)" : loading ? "var(--text-secondary)" : "var(--text-muted)",
                  border: `1px solid ${isDone ? "var(--border-accent)" : "var(--border)"}`,
                }}
              >
                {isDone ? <CheckCircle size={13} /> : stage.icon}
              </div>
              <span className="text-xs text-center leading-tight" style={{ color: "var(--text-muted)", maxWidth: 64 }}>
                {stage.label}
              </span>
            </motion.div>
            {i < matchStages.length - 1 && (
              <motion.div
                className="flex-1 h-px"
                style={{
                  background: loading || (!loading && count > 0)
                    ? "var(--border-accent)"
                    : "var(--border)",
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.12 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Compatibility Score Bar
// ============================================================
function CompatibilityBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 85 ? "var(--emerald)" : pct >= 65 ? "var(--status-warn)" : "var(--status-err)";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color, minWidth: 36 }}>
        {pct}%
      </span>
    </div>
  );
}

// ============================================================
// Match Card
// ============================================================
function MatchCard({ match, rank, delay }: { match: Match; rank: number; delay: number }) {
  const condVariant = match.condition === "EXCELLENT" || match.condition === "GOOD" ? "success" :
                      match.condition === "FAIR" ? "warning" : "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <SpotlightCard className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Rank */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: rank === 1 ? "rgba(52,211,153,0.15)" : "var(--bg-overlay)",
                color: rank === 1 ? "var(--emerald)" : "var(--text-muted)",
                border: `1px solid ${rank === 1 ? "var(--border-accent)" : "var(--border)"}`,
              }}
            >
              {rank}
            </div>
            <div>
              <MonoId>{match.assetId}</MonoId>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin size={11} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{match.location}</span>
              </div>
            </div>
          </div>
          <StatusBadge variant={condVariant as "success" | "warning" | "error"} label={match.condition} />
        </div>

        {/* Compatibility score */}
        <div className="mb-3">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Compatibility Score
          </p>
          <CompatibilityBar score={match.compatibilityScore} />
        </div>

        {/* Reasons */}
        <div className="flex flex-col gap-1.5">
          {match.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle size={11} style={{ color: "var(--emerald)", marginTop: 1.5, flexShrink: 0 }} />
              <span style={{ color: "var(--text-secondary)" }}>{reason}</span>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

// ============================================================
// Main ResourceMatching Component
// ============================================================
export function ResourceMatching({ requests, matches, loading, error, onRefresh }: ResourceMatchingProps) {
  const request = requests[0];
  const urgencyVariant = request?.urgency === "HIGH" ? "error" : request?.urgency === "MEDIUM" ? "warning" : "muted";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Resource Intelligence"
        title="Resource Matching"
        subtitle="AI-ranked compatible assets from your inventory matched to open requests."
        actions={
          <SecondaryButton onClick={onRefresh} size="md">
            <RefreshCw size={14} />
            Refresh Matches
          </SecondaryButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================
            LEFT: Request Panel
            ====================================================== */}
        <SectionReveal>
          <div className="flex flex-col gap-4">
            {/* Active request */}
            <div
              className="rounded-xl p-5 flex flex-col gap-4"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Active Request
                </p>
                <StatusBadge variant={urgencyVariant as "error" | "warning" | "muted"} label={request?.urgency ?? "—"} />
              </div>

              {request ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <MonoId>{request.id}</MonoId>
                    <p className="text-base font-semibold mt-2" style={{ color: "var(--text-primary)" }}>
                      {request.department} needs {request.quantity}× {request.category.toLowerCase()}
                      {request.quantity !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p style={{ color: "var(--text-muted)" }}>Department</p>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{request.department}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--text-muted)" }}>Quantity</p>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{request.quantity}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--text-muted)" }}>Status</p>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{request.status}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--text-muted)" }}>Urgency</p>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{request.urgency}</p>
                    </div>
                  </div>

                  {request.specifications.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                        Specifications
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {request.specifications.map(s => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded-md"
                            style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No active requests</p>
              )}
            </div>

            {/* Match summary */}
            <AnimatePresence>
              {!loading && (
                <motion.div
                  className="rounded-xl p-5"
                  style={{
                    background: matches.length > 0 ? "var(--emerald-soft)" : "var(--bg-surface)",
                    border: `1px solid ${matches.length > 0 ? "var(--border-accent)" : "var(--border)"}`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: matches.length > 0 ? "var(--emerald)" : "var(--text-muted)" }}
                    >
                      {matches.length}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      compatible assets found
                    </span>
                  </div>
                  {matches.length > 0 && (
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      Best match: {Math.round((matches[0]?.compatibilityScore ?? 0) * 100)}% compatibility
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionReveal>

        {/* ======================================================
            RIGHT: Results
            ====================================================== */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <SectionReveal delay={0.1}>
            {/* Matching stages */}
            <div
              className="rounded-xl p-4 mb-2"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Matching Pipeline
              </p>
              <MatchingStages loading={loading} count={matches.length} />
            </div>

            {loading ? (
              <LoadingState message="Finding compatible resources…" />
            ) : error ? (
              <ErrorState message={error} onRetry={onRefresh} />
            ) : matches.length === 0 ? (
              <EmptyState
                icon={<GitCompareArrows size={22} />}
                title="No matches found"
                description="No compatible assets in inventory for this request. Try refreshing or check asset availability."
                action={
                  <SecondaryButton onClick={onRefresh} size="sm">
                    <RefreshCw size={13} />
                    Retry matching
                  </SecondaryButton>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matches.map((match, i) => (
                  <MatchCard key={match.assetId} match={match} rank={i + 1} delay={i * 0.08} />
                ))}
              </div>
            )}
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
