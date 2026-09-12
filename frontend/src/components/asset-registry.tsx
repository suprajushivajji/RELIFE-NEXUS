"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Database, Cpu, Printer, Monitor, Tv2, X, Plus } from "lucide-react";
import { StatusBadge, PageHeader, EmptyState, PrimaryButton, SecondaryButton, MonoId, SectionReveal } from "./ui";

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
  analyzed?: boolean;
};

function conditionVariant(c: string): "success" | "warning" | "error" | "muted" {
  if (c === "EXCELLENT" || c === "GOOD") return "success";
  if (c === "FAIR") return "warning";
  if (c === "POOR" || c === "UNSAFE") return "error";
  return "muted";
}

function lifecycleVariant(s: string): "success" | "warning" | "muted" | "info" {
  if (s === "AVAILABLE") return "success";
  if (s === "UNDER_REVIEW") return "warning";
  if (s === "IN_USE") return "info";
  return "muted";
}

const categoryIcons: Record<string, React.ReactNode> = {
  LAPTOP:    <Monitor size={14} />,
  MONITOR:   <Monitor size={14} />,
  PROJECTOR: <Tv2 size={14} />,
  PRINTER:   <Printer size={14} />,
};

interface AssetRegistryProps {
  assets: Asset[];
  loading: boolean;
  onAnalyze: (asset: Asset) => void;
}

export function AssetRegistry({ assets, loading, onAnalyze }: AssetRegistryProps) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [condFilter, setCondFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const categories  = ["ALL", ...Array.from(new Set(assets.map(a => a.category)))];
  const conditions  = ["ALL", "EXCELLENT", "GOOD", "FAIR", "POOR", "UNSAFE"];
  const statuses    = ["ALL", "AVAILABLE", "IN_USE", "UNDER_REVIEW", "RETIRED"];

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);
      const matchCat    = catFilter    === "ALL" || a.category === catFilter;
      const matchCond   = condFilter   === "ALL" || a.condition === condFilter;
      const matchStatus = statusFilter === "ALL" || a.lifecycleStatus === statusFilter;
      return matchSearch && matchCat && matchCond && matchStatus;
    });
  }, [assets, search, catFilter, condFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems  = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when filters change
  const handleFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const hasFilters = search || catFilter !== "ALL" || condFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inventory"
        title="Asset Registry"
        subtitle="Your complete circular resource inventory. Search, filter and analyze assets."
        actions={
          <PrimaryButton size="md">
            <Plus size={14} />
            Add Asset
          </PrimaryButton>
        }
      />

      {/* Filters */}
      <SectionReveal>
        <div
          className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search assets, IDs, departments…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Category filter */}
          <FilterSelect
            value={catFilter}
            options={categories}
            onChange={handleFilter(setCatFilter)}
            placeholder="Category"
          />

          {/* Condition filter */}
          <FilterSelect
            value={condFilter}
            options={conditions}
            onChange={handleFilter(setCondFilter)}
            placeholder="Condition"
          />

          {/* Status filter */}
          <FilterSelect
            value={statusFilter}
            options={statuses}
            onChange={handleFilter(setStatusFilter)}
            placeholder="Status"
          />

          {/* Clear */}
          {hasFilters && (
            <motion.button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSearch(""); setCatFilter("ALL"); setCondFilter("ALL"); setStatusFilter("ALL"); setPage(1); }}
            >
              <X size={12} /> Clear
            </motion.button>
          )}
        </div>
      </SectionReveal>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {loading ? "Loading…" : `${filtered.length} asset${filtered.length !== 1 ? "s" : ""}`}
          {hasFilters && !loading && ` matching filters`}
        </p>
        {!loading && totalPages > 1 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Database size={22} />}
          title="No assets found"
          description={hasFilters ? "Try adjusting your search or filters." : "No resources in the registry yet."}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {/* Header */}
            <div
              className="grid gap-4 px-5 py-3 text-xs font-semibold tracking-widest uppercase"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-surface)",
                borderBottom: "1px solid var(--border)",
                gridTemplateColumns: "1fr 120px 160px 110px 110px 90px",
              }}
            >
              <span>Asset</span>
              <span>Category</span>
              <span>Location</span>
              <span>Condition</span>
              <span>Status</span>
              <span />
            </div>

            <AnimatePresence mode="popLayout">
              {pageItems.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  className="grid gap-4 px-5 py-4 items-center group cursor-pointer"
                  style={{
                    gridTemplateColumns: "1fr 120px 160px 110px 110px 90px",
                    borderBottom: i < pageItems.length - 1 ? "1px solid var(--border)" : "none",
                    background: "var(--bg-surface)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ background: "var(--bg-elevated)" }}
                  onClick={() => onAnalyze(asset)}
                >
                  {/* Name + ID */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}
                    >
                      {categoryIcons[asset.category] ?? <Database size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {asset.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MonoId>{asset.id}</MonoId>
                        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                          {asset.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {asset.category}
                  </span>

                  <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    {asset.location}
                  </span>

                  <StatusBadge variant={conditionVariant(asset.condition)} label={asset.condition} />

                  <StatusBadge
                    variant={lifecycleVariant(asset.lifecycleStatus)}
                    label={asset.lifecycleStatus.replace("_", " ")}
                  />

                  <motion.button
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "var(--emerald-soft)", color: "var(--emerald)" }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={e => { e.stopPropagation(); onAnalyze(asset); }}
                  >
                    <Cpu size={11} />
                    Analyze
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {pageItems.map((asset, i) => (
              <motion.div
                key={asset.id}
                className="glass p-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onAnalyze(asset)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <MonoId>{asset.id}</MonoId>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{asset.department}</span>
                    </div>
                  </div>
                  <StatusBadge variant={conditionVariant(asset.condition)} label={asset.condition} />
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge
                    variant={lifecycleVariant(asset.lifecycleStatus)}
                    label={asset.lifecycleStatus.replace("_", " ")}
                  />
                  <button
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--emerald-soft)", color: "var(--emerald)" }}
                    onClick={e => { e.stopPropagation(); onAnalyze(asset); }}
                  >
                    Analyze →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <SecondaryButton
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                size="sm"
              >
                Previous
              </SecondaryButton>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: page === p ? "var(--emerald)" : "var(--bg-elevated)",
                        color: page === p ? "#0a0f0d" : "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <SecondaryButton
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                size="sm"
              >
                Next
              </SecondaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// FilterSelect helper
// ============================================================
function FilterSelect({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-medium outline-none transition-colors"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: value !== "ALL" ? "var(--text-primary)" : "var(--text-muted)",
          cursor: "pointer",
          minWidth: 120,
        }}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: "#1a2420" }}>
            {o === "ALL" ? placeholder : o.replace("_", " ")}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--text-muted)" }}
      />
    </div>
  );
}
