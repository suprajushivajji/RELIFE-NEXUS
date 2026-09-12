"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Database,
  Cpu,
  GitCompareArrows,
  BarChart3,
  Shield,
  Menu,
  X,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { clsx } from "clsx";

type Page =
  | "Dashboard"
  | "Asset Registry"
  | "Analyze Asset"
  | "Resource Matching"
  | "Impact"
  | "Responsible AI";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  { id: "Dashboard",        label: "Dashboard",         icon: <LayoutDashboard size={16} />, description: "Overview & metrics" },
  { id: "Asset Registry",   label: "Asset Registry",    icon: <Database size={16} />,        description: "Resource inventory" },
  { id: "Analyze Asset",    label: "Analyze Asset",     icon: <Cpu size={16} />,             description: "AI lifecycle analysis" },
  { id: "Resource Matching",label: "Resource Matching", icon: <GitCompareArrows size={16} />,description: "Internal matching" },
  { id: "Impact",           label: "Impact",            icon: <BarChart3 size={16} />,       description: "Circular metrics" },
  { id: "Responsible AI",   label: "Responsible AI",    icon: <Shield size={16} />,          description: "Governance & ethics" },
];

interface SidebarProps {
  active: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:flex flex-col shrink-0 relative z-20"
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          minHeight: "100vh",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--emerald)", color: "#0a0f0d" }}
          >
            <Leaf size={15} strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="flex flex-col overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>
                  ReLife
                </span>
                <span
                  className="text-xs font-semibold tracking-widest uppercase leading-none mt-0.5"
                  style={{ color: "var(--emerald)" }}
                >
                  Nexus
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className="ml-auto shrink-0 p-1 rounded-md transition-colors"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              size={14}
              style={{
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.25s ease",
              }}
            />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {!collapsed && (
            <p
              className="text-xs font-semibold tracking-widest uppercase px-3 pt-3 pb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Workspace
            </p>
          )}
          {navItems.map(item => (
            <NavButton
              key={item.id}
              item={item}
              isActive={active === item.id}
              collapsed={collapsed}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-3 py-4 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* System status */}
          <div className="flex items-center gap-2 px-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--emerald)" }} />
            {!collapsed && (
              <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                Backend connected
              </span>
            )}
          </div>

          {!collapsed && (
            <div
              className="mt-1 rounded-lg p-2.5 flex items-start gap-2"
              style={{ background: "var(--emerald-soft)", border: "1px solid var(--border-accent)" }}
            >
              <Leaf size={13} style={{ color: "var(--emerald)", marginTop: 1, flexShrink: 0 }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--emerald)" }}>SDG 12</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Responsible consumption</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden w-72 flex flex-col"
              style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 h-16 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--emerald)", color: "#0a0f0d" }}
                >
                  <Leaf size={15} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>ReLife</span>
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--emerald)" }}>Nexus</span>
                </div>
                <button
                  className="ml-auto p-1 rounded-md"
                  style={{ color: "var(--text-muted)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              {/* Nav */}
              <nav className="flex flex-col gap-1 p-2 flex-1">
                {navItems.map(item => (
                  <NavButton
                    key={item.id}
                    item={item}
                    isActive={active === item.id}
                    collapsed={false}
                    onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  />
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// NavButton
// ============================================================
function NavButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      className={clsx(
        "relative flex items-center gap-3 rounded-lg text-left transition-colors group",
        collapsed ? "px-0 py-2 justify-center w-full" : "px-3 py-2.5"
      )}
      style={{
        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
        background: isActive ? "var(--bg-overlay)" : "transparent",
      }}
      whileHover={{ color: "var(--text-primary)" }}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
          style={{ background: "var(--emerald)" }}
          layoutId="nav-active"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        />
      )}

      {/* Icon */}
      <span
        className="shrink-0"
        style={{ color: isActive ? "var(--emerald)" : "inherit" }}
      >
        {item.icon}
      </span>

      {/* Label */}
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </motion.button>
  );
}

export type { Page };
