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
import {
  type Period,
  type Shift,
  useFilter,
} from "../../context/FilterContext";

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

const SHIFTS: Shift[] = ["A", "B", "C"];
const PERIODS: Period[] = ["Today", "Week", "Month"];

const SHIFT_COLORS: Record<
  Shift,
  { bg: string; text: string; border: string }
> = {
  A: { bg: "#fef3c7", text: "#b45309", border: "#f59e0b" },
  B: { bg: "#dbeafe", text: "#1d4ed8", border: "#3b82f6" },
  C: { bg: "#f3e8ff", text: "#7c3aed", border: "#8b5cf6" },
};

const PERIOD_COLORS: Record<
  Period,
  { bg: string; text: string; border: string }
> = {
  Today: { bg: "#f0fdf4", text: "#15803d", border: "#22c55e" },
  Week: { bg: "#eff6ff", text: "#1d4ed8", border: "#3b82f6" },
  Month: { bg: "#fff7ed", text: "#c2410c", border: "#f97316" },
};

export function TopNavBar({ role, onRoleChange, lastUpdated }: TopNavBarProps) {
  const [time, setTime] = useState(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showShiftMenu, setShowShiftMenu] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const shiftMenuRef = useRef<HTMLDivElement>(null);
  const periodMenuRef = useRef<HTMLDivElement>(null);

  const { shift, period, date, setShift, setPeriod, setDate } = useFilter();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(e.target as Node)
      )
        setShowRoleMenu(false);
      if (
        shiftMenuRef.current &&
        !shiftMenuRef.current.contains(e.target as Node)
      )
        setShowShiftMenu(false);
      if (
        periodMenuRef.current &&
        !periodMenuRef.current.contains(e.target as Node)
      )
        setShowPeriodMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (d: Date) => d.toTimeString().slice(0, 8);

  const roleLabel =
    role === "CEO"
      ? "CEO View"
      : role === "Operator"
        ? "Operator View"
        : "Management View";

  const shiftStyle = SHIFT_COLORS[shift];
  const periodStyle = PERIOD_COLORS[period];

  const handleLogout = () => {
    toast.info("No authentication configured. Login is not required.", {
      duration: 3000,
      position: "top-right",
    });
  };

  return (
    <>
      <header
        className="flex items-center justify-between px-3 py-1.5 border-b border-[#e2e8f0] shrink-0"
        style={{ background: "#ffffff", minHeight: "42px" }}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center font-black text-[10px]"
              style={{ background: "#dbeafe", color: "#1d4ed8" }}
            >
              MES
            </div>
            <div>
              <div
                className="font-black tracking-tight leading-none"
                style={{
                  color: "#1e3a5f",
                  fontSize: "13px",
                  letterSpacing: "-0.01em",
                }}
              >
                BANCO ALUMINIUM
              </div>
              <div
                className="text-[8px] font-black tracking-widest mt-0.5"
                style={{ color: "#92650a", letterSpacing: "0.12em" }}
              >
                MES EXECUTIVE VIEW
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-[#e2e8f0] mx-1" />

          {/* View label (non-clickable, reflects current role) */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border"
            style={{
              background: "#eff6ff",
              borderColor: "#3b82f6",
              color: "#1d4ed8",
            }}
          >
            <Grid3X3 size={12} />
            {roleLabel}
          </div>
        </div>

        {/* Center: Date / Shift selector / Period selector */}
        <div className="flex items-center gap-2 text-[11px]">
          {/* Date picker */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded border"
            style={{ background: "#f8fafc", borderColor: "#cbd5e1" }}
          >
            <Calendar size={11} style={{ color: "#64748b", flexShrink: 0 }} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="filter.date.input"
              title="Select Date"
              className="font-mono font-semibold text-[11px] bg-transparent border-none outline-none cursor-pointer"
              style={{ color: "#1e293b", minWidth: 0 }}
            />
          </div>

          <div className="w-px h-5 bg-[#e2e8f0]" />

          {/* Shift selector */}
          <div className="relative" ref={shiftMenuRef}>
            <button
              type="button"
              onClick={() => setShowShiftMenu((v) => !v)}
              data-ocid="filter.shift.select"
              className="flex items-center gap-1 px-2 py-0.5 rounded border font-bold text-[10px] transition-colors"
              style={{
                background: shiftStyle.bg,
                color: shiftStyle.text,
                borderColor: shiftStyle.border,
              }}
              title="Select Shift"
            >
              SHIFT {shift}
              <ChevronDown size={9} />
            </button>
            {showShiftMenu && (
              <div
                className="absolute top-full mt-1 left-0 rounded border shadow-lg z-50 w-28"
                style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
              >
                {SHIFTS.map((s) => {
                  const sc = SHIFT_COLORS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setShift(s);
                        setShowShiftMenu(false);
                      }}
                      data-ocid={`filter.shift.${s.toLowerCase()}.button`}
                      className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#f1f5f9] transition-colors flex items-center gap-2"
                      style={{
                        color: s === shift ? sc.text : "#475569",
                        fontWeight: s === shift ? 700 : 400,
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                        }}
                      />
                      Shift {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Period selector */}
          <div className="relative" ref={periodMenuRef}>
            <button
              type="button"
              onClick={() => setShowPeriodMenu((v) => !v)}
              data-ocid="filter.period.select"
              className="flex items-center gap-1 px-2 py-0.5 rounded border font-bold text-[10px] transition-colors"
              style={{
                background: periodStyle.bg,
                color: periodStyle.text,
                borderColor: periodStyle.border,
              }}
              title="Select Period"
            >
              {period.toUpperCase()}
              <ChevronDown size={9} />
            </button>
            {showPeriodMenu && (
              <div
                className="absolute top-full mt-1 left-0 rounded border shadow-lg z-50 w-28"
                style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
              >
                {PERIODS.map((p) => {
                  const pc = PERIOD_COLORS[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPeriod(p);
                        setShowPeriodMenu(false);
                      }}
                      data-ocid={`filter.period.${p.toLowerCase()}.button`}
                      className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#f1f5f9] transition-colors flex items-center gap-2"
                      style={{
                        color: p === period ? pc.text : "#475569",
                        fontWeight: p === period ? 700 : 400,
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: pc.bg,
                          border: `1px solid ${pc.border}`,
                        }}
                      />
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clock, Role, AI */}
        <div className="flex items-center gap-3">
          {/* Live clock */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded"
            style={{ background: "#f0fdf4", border: "1px solid #86efac" }}
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
            <Clock size={10} style={{ color: "#16a34a" }} />
            <span
              className="font-mono font-black tabular-nums"
              style={{ color: "#15803d", fontSize: "13px" }}
            >
              {formatTime(time)}
            </span>
          </div>

          <div className="w-px h-6 bg-[#e2e8f0]" />

          {/* Last updated */}
          <div className="text-[10px]" style={{ color: "#64748b" }}>
            <span>Updated: </span>
            <span className="font-mono" style={{ color: "#475569" }}>
              {formatTime(lastUpdated)}
            </span>
          </div>

          <div className="w-px h-6 bg-[#e2e8f0]" />

          {/* Role selector */}
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => setShowRoleMenu((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border"
              data-ocid="nav.role.select"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                color: "#475569",
              }}
            >
              <Circle size={8} style={{ fill: "#3b82f6", color: "#3b82f6" }} />
              {role} View
              <ChevronDown size={10} />
            </button>
            {showRoleMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded border shadow-lg z-50"
                style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
              >
                {(["Operator", "Management", "CEO"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#f1f5f9] transition-colors"
                    data-ocid={`nav.role.${r.toLowerCase()}.button`}
                    style={{
                      color: r === role ? "#d97706" : "#475569",
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
            data-ocid="nav.ai_insight.button"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            <Brain size={11} />
            AI Insight
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[#f1f5f9] transition-colors"
            title="Logout"
          >
            <LogOut size={13} style={{ color: "#64748b" }} />
          </button>
        </div>
      </header>

      {/* AI Insight Modal */}
      {showAIModal && (
        <dialog
          open
          aria-label="AI Insight Panel"
          data-ocid="nav.ai_insight.modal"
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
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div
            className="w-[420px] max-h-[80vh] overflow-y-auto rounded-lg border shadow-2xl flex flex-col"
            style={{
              background: "#ffffff",
              borderColor: "#7c3aed30",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "#ede9fe" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ background: "#ede9fe" }}
                >
                  <Brain size={13} style={{ color: "#7c3aed" }} />
                </div>
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#5b21b6" }}
                  >
                    AI INSIGHT ENGINE
                  </div>
                  <div className="text-[9px]" style={{ color: "#7c3aed" }}>
                    Shift {shift} · {period} · {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded hover:bg-[#f1f5f9] transition-colors"
                data-ocid="nav.ai_insight.close_button"
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
                      background: `${insightStyle.bar}0d`,
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
                        style={{ color: "#374151" }}
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
              style={{ borderColor: "#ede9fe", color: "#7c3aed" }}
            >
              Analysis based on live press data · Banco Aluminium MES
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
