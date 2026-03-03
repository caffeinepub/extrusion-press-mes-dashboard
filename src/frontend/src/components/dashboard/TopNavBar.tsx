import {
  Brain,
  Calendar,
  ChevronDown,
  Circle,
  Clock,
  Grid3X3,
  LogOut,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface TopNavBarProps {
  role: "Operator" | "Management" | "CEO";
  onRoleChange: (role: "Operator" | "Management" | "CEO") => void;
  lastUpdated: Date;
}

const AI_INSIGHTS = [
  {
    type: "critical",
    text: "P2500 Atlas has been in Breakdown for 180+ mins — longest downtime event this shift.",
  },
  {
    type: "warning",
    text: "Fleet OEE is 80.1% vs target 85%. Mechanical & die failures account for 62% of total downtime.",
  },
  {
    type: "success",
    text: "P3300 Titan is top performer at 88.9% OEE, running at 2,100 kg/hr — 12% above fleet average.",
  },
  {
    type: "warning",
    text: "Scrap rate on alloy 6082 is elevated (2.3%) — correlates with Atlas breakdown episodes.",
  },
  {
    type: "info",
    text: "On-Time Delivery is 91% vs 95% target. 3 open orders are flagged as delayed.",
  },
  {
    type: "info",
    text: "Die #2001005 (Atlas) has exceeded 80% of shot life and is due for maintenance inspection.",
  },
];

const TYPE_STYLES: Record<string, { bar: string; dot: string; label: string }> =
  {
    critical: {
      bar: "#ef4444",
      dot: "bg-red-400",
      label: "CRITICAL",
    },
    warning: {
      bar: "#d97706",
      dot: "bg-amber-400",
      label: "WARNING",
    },
    success: {
      bar: "#10b981",
      dot: "bg-emerald-400",
      label: "INSIGHT",
    },
    info: {
      bar: "#3b82f6",
      dot: "bg-blue-400",
      label: "INFO",
    },
  };

export function TopNavBar({ role, onRoleChange, lastUpdated }: TopNavBarProps) {
  const [time, setTime] = useState(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close role menu when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(e.target as Node)
      ) {
        setShowRoleMenu(false);
      }
    }
    if (showRoleMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showRoleMenu]);

  const formatTime = (d: Date) => d.toTimeString().slice(0, 8);

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const roleLabel =
    role === "CEO"
      ? "CEO View"
      : role === "Operator"
        ? "Operator View"
        : "Management View";

  const handleLogout = () => {
    toast.info("No authentication configured. Login is not required.", {
      duration: 3000,
      position: "top-right",
    });
  };

  return (
    <>
      <header
        className="flex items-center justify-between px-3 py-1.5 border-b border-[#162030] shrink-0"
        style={{ background: "#060b14", minHeight: "42px" }}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center font-black text-[10px]"
              style={{ background: "#1e3a6e", color: "#f59e0b" }}
            >
              MES
            </div>
            <div>
              <div
                className="font-black tracking-tight leading-none"
                style={{
                  color: "#d0e4f8",
                  fontSize: "13px",
                  letterSpacing: "-0.01em",
                }}
              >
                BANCO ALUMINIUM
              </div>
              <div
                className="text-[8px] font-black tracking-widest mt-0.5"
                style={{ color: "#c48a10", letterSpacing: "0.12em" }}
              >
                MES EXECUTIVE VIEW
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-[#1e2d45] mx-1" />

          {/* View label (non-clickable, reflects current role) */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border"
            style={{
              background: "#1e3a6e",
              borderColor: "#3b82f6",
              color: "#93c5fd",
            }}
          >
            <Grid3X3 size={12} />
            {roleLabel}
          </div>
        </div>

        {/* Center: Date/Shift/Period */}
        <div className="flex items-center gap-4 text-[11px]">
          <div
            className="flex items-center gap-1.5"
            style={{ color: "#94a3b8" }}
          >
            <Calendar size={11} />
            <span
              className="font-mono font-semibold"
              style={{ color: "#e2e8f0" }}
            >
              {dateStr}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#64748b" }}>SHIFT</span>
            <span
              className="font-bold px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: "#f59e0b20", color: "#f59e0b" }}
            >
              Shift A
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#64748b" }}>PERIOD</span>
            <span
              className="font-bold px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: "#f59e0b20", color: "#f59e0b" }}
            >
              Today
            </span>
          </div>
        </div>

        {/* Right: Clock, Role, AI */}
        <div className="flex items-center gap-3">
          {/* Live clock */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded"
            style={{ background: "#0a1f10", border: "1px solid #22c55e30" }}
          >
            <div className="relative flex items-center justify-center w-2 h-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#22c55e" }}
              />
              <div
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{ background: "#22c55e", opacity: 0.4 }}
              />
            </div>
            <Clock size={10} style={{ color: "#22c55e60" }} />
            <span
              className="font-mono font-black tabular-nums"
              style={{ color: "#22c55e", fontSize: "13px" }}
            >
              {formatTime(time)}
            </span>
          </div>

          <div className="w-px h-6 bg-[#1e2d45]" />

          {/* Last updated */}
          <div className="text-[10px]" style={{ color: "#475569" }}>
            <span>Updated: </span>
            <span className="font-mono" style={{ color: "#64748b" }}>
              {formatTime(lastUpdated)}
            </span>
          </div>

          <div className="w-px h-6 bg-[#1e2d45]" />

          {/* Role selector */}
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => setShowRoleMenu((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border"
              style={{
                background: "#0f1729",
                borderColor: "#1e2d45",
                color: "#94a3b8",
              }}
            >
              <Circle size={8} style={{ fill: "#3b82f6", color: "#3b82f6" }} />
              {role} View
              <ChevronDown size={10} />
            </button>
            {showRoleMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded border shadow-xl z-50"
                style={{ background: "#0f1729", borderColor: "#1e2d45" }}
              >
                {(["Operator", "Management", "CEO"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#1e2d45] transition-colors"
                    style={{
                      color: r === role ? "#f59e0b" : "#94a3b8",
                    }}
                  >
                    {r} View
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Insight */}
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-opacity hover:opacity-90"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            <Brain size={11} />
            AI Insight
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[#1e2d45] transition-colors"
            title="Logout"
          >
            <LogOut size={13} style={{ color: "#475569" }} />
          </button>
        </div>
      </header>

      {/* AI Insight Modal */}
      {showAIModal && (
        <dialog
          open
          aria-label="AI Insight Panel"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowAIModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: "3.5rem 1rem 1rem",
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            margin: 0,
            border: "none",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="w-[420px] max-h-[80vh] overflow-y-auto rounded-lg border shadow-2xl flex flex-col"
            style={{ background: "#0a111e", borderColor: "#7c3aed60" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "#7c3aed40" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ background: "#7c3aed30" }}
                >
                  <Brain size={13} style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#c4b5fd" }}
                  >
                    AI INSIGHT ENGINE
                  </div>
                  <div className="text-[9px]" style={{ color: "#6d28d9" }}>
                    Real-time analysis • {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded hover:bg-[#1e2d45] transition-colors"
              >
                <X size={14} style={{ color: "#64748b" }} />
              </button>
            </div>

            {/* Insight items */}
            <div className="p-3 space-y-2">
              {AI_INSIGHTS.map((insight) => {
                const insightStyle = TYPE_STYLES[insight.type];
                return (
                  <div
                    key={insight.text}
                    className="rounded p-3 flex gap-3"
                    style={{
                      background: `${insightStyle.bar}10`,
                      border: `1px solid ${insightStyle.bar}30`,
                    }}
                  >
                    <div
                      className="w-1.5 shrink-0 rounded-full mt-0.5"
                      style={{
                        backgroundColor: insightStyle.bar,
                        minHeight: "14px",
                      }}
                    />
                    <div className="flex-1">
                      <div
                        className="text-[9px] font-black tracking-widest mb-1"
                        style={{ color: insightStyle.bar }}
                      >
                        {insightStyle.label}
                      </div>
                      <div
                        className="text-xs leading-relaxed"
                        style={{ color: "#cbd5e1" }}
                      >
                        {insight.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 border-t text-[9px] text-center"
              style={{ borderColor: "#7c3aed30", color: "#4c1d95" }}
            >
              Analysis based on live press data · Banco Aluminium MES
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
