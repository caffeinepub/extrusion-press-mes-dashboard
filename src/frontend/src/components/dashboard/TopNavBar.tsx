import {
  Brain,
  Calendar,
  ChevronDown,
  Clock,
  LogOut,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Period,
  type Shift,
  useFilter,
} from "../../context/FilterContext";

type AppRole = "Operator" | "Management" | "CEO" | "Supervisor";

interface TopNavBarProps {
  role: AppRole;
  onRoleChange: (role: AppRole) => void;
  lastUpdated: Date;
  onSettingsClick?: () => void;
  showLiveClock?: boolean;
  showLastUpdated?: boolean;
  showAIBadge?: boolean;
}

const AI_INSIGHTS = [
  {
    type: "critical",
    text: "P2500 has been in Breakdown for 180+ mins — longest downtime event this shift.",
  },
  {
    type: "warning",
    text: "Fleet OEE is 80.1% vs target 85%. Mechanical & die failures account for 62% of total downtime.",
  },
  {
    type: "success",
    text: "P3300 is top performer at 88.9% OEE, running at 2,100 kg/hr — 12% above fleet average.",
  },
  {
    type: "warning",
    text: "Scrap rate on alloy 6082 is elevated (2.3%) — correlates with P2500 breakdown episodes.",
  },
  {
    type: "info",
    text: "On-Time Delivery is 91% vs 95% target. 3 open orders are flagged as delayed.",
  },
  {
    type: "info",
    text: "Die #2001005 (P2500) has exceeded 80% of shot life and is due for maintenance inspection.",
  },
];

const TYPE_STYLES: Record<string, { bar: string; label: string }> = {
  critical: { bar: "#ef4444", label: "CRITICAL" },
  warning: { bar: "#d97706", label: "WARNING" },
  success: { bar: "#10b981", label: "INSIGHT" },
  info: { bar: "#3b82f6", label: "INFO" },
};

const SHIFTS: Shift[] = ["All", "A", "B", "C"];

// Grafana-style pill button
const pillStyle = {
  border: "1px solid #d0d6df",
  borderRadius: "3px",
  background: "#f7f8fa",
  color: "#333d47",
  fontSize: "11px",
  padding: "3px 8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "background 0.1s ease",
  fontFamily: '"General Sans", system-ui, sans-serif',
  fontWeight: 500,
} as const;

export function TopNavBar({
  role,
  onRoleChange,
  lastUpdated,
  onSettingsClick,
  showLiveClock = true,
  showLastUpdated = true,
  showAIBadge = true,
}: TopNavBarProps) {
  const [time, setTime] = useState(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showShiftMenu, setShowShiftMenu] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showRefreshMenu, setShowRefreshMenu] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<string>("Off");
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const shiftMenuRef = useRef<HTMLDivElement>(null);
  const periodMenuRef = useRef<HTMLDivElement>(null);
  const refreshMenuRef = useRef<HTMLDivElement>(null);

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
      if (
        refreshMenuRef.current &&
        !refreshMenuRef.current.contains(e.target as Node)
      )
        setShowRefreshMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (d: Date) => d.toTimeString().slice(0, 8);

  const REFRESH_OPTIONS = ["Off", "5s", "30s", "1m", "5m"];

  // Map period for display in time range pill
  const timeRangeLabel =
    period === "Today"
      ? "Last 24h"
      : period === "Week"
        ? "Last 7d"
        : "Last 30d";

  const handleLogout = () => {
    toast.info("No authentication configured. Login is not required.", {
      duration: 3000,
      position: "top-right",
    });
  };

  return (
    <>
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e4e7ed",
          minHeight: "44px",
          padding: "0 10px",
        }}
      >
        {/* LEFT: Brand */}
        <div className="flex items-center gap-2 shrink-0">
          {/* MES badge — Grafana orange */}
          <div
            className="flex items-center justify-center rounded font-black text-[10px] shrink-0"
            style={{
              background: "#ff6600",
              color: "#ffffff",
              width: "28px",
              height: "28px",
              letterSpacing: "-0.02em",
            }}
          >
            MES
          </div>
          <div>
            <div
              style={{
                color: "#333d47",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                lineHeight: 1.2,
                fontFamily: '"General Sans", system-ui, sans-serif',
              }}
            >
              BANCO ALUMINIUM
            </div>
            <div
              style={{
                color: "#ff6600",
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                lineHeight: 1,
              }}
            >
              MES EXECUTIVE VIEW
            </div>
          </div>
          {/* Vertical divider */}
          <div
            style={{
              width: "1px",
              height: "28px",
              background: "#e4e7ed",
              margin: "0 4px",
            }}
          />
        </div>

        {/* CENTER: Grafana toolbar controls */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          {/* Time Range Picker */}
          <div className="relative" ref={periodMenuRef}>
            <button
              type="button"
              onClick={() => setShowPeriodMenu((v) => !v)}
              data-ocid="filter.period.select"
              title="Select Time Range"
              style={{ ...pillStyle }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#e8edf2";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f7f8fa";
              }}
            >
              <Calendar size={11} style={{ color: "#9ea6b3" }} />
              <span>{timeRangeLabel}</span>
              <ChevronDown size={9} style={{ color: "#9ea6b3" }} />
            </button>
            {showPeriodMenu && (
              <div
                className="absolute top-full mt-1 left-0 z-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ed",
                  borderRadius: "3px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: "160px",
                }}
              >
                {/* Date picker inline */}
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: "1px solid #e4e7ed" }}
                >
                  <Calendar size={10} style={{ color: "#9ea6b3" }} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-ocid="filter.date.input"
                    className="bg-transparent border-none outline-none text-[10px] tabular-nums"
                    style={{
                      color: "#333d47",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  />
                </div>
                {[
                  { label: "Last 24h", value: "Today" as Period },
                  { label: "Last 7d", value: "Week" as Period },
                  { label: "Last 30d", value: "Month" as Period },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setPeriod(opt.value);
                      setShowPeriodMenu(false);
                    }}
                    data-ocid={`filter.period.${opt.value.toLowerCase()}.button`}
                    className="w-full text-left px-3 py-1.5 text-[11px] transition-colors"
                    style={{
                      color: period === opt.value ? "#ff6600" : "#333d47",
                      fontWeight: period === opt.value ? 700 : 400,
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f7f8fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shift Selector */}
          <div className="relative" ref={shiftMenuRef}>
            <button
              type="button"
              onClick={() => setShowShiftMenu((v) => !v)}
              data-ocid="filter.shift.select"
              title="Select Shift"
              style={{ ...pillStyle }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#e8edf2";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f7f8fa";
              }}
            >
              <span style={{ fontSize: "9px", color: "#9ea6b3" }}>SHIFT</span>
              <span style={{ fontWeight: 700, color: "#ff6600" }}>
                {shift === "All" ? "ALL" : shift}
              </span>
              <ChevronDown size={9} style={{ color: "#9ea6b3" }} />
            </button>
            {showShiftMenu && (
              <div
                className="absolute top-full mt-1 left-0 z-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ed",
                  borderRadius: "3px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: "120px",
                }}
              >
                {SHIFTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setShift(s);
                      setShowShiftMenu(false);
                    }}
                    data-ocid={`filter.shift.${s.toLowerCase()}.button`}
                    className="w-full text-left px-3 py-1.5 text-[11px] transition-colors"
                    style={{
                      color: s === shift ? "#ff6600" : "#333d47",
                      fontWeight: s === shift ? 700 : 400,
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f7f8fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    {s === "All" ? "All Shifts" : `Shift ${s}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Refresh Dropdown */}
          <div className="relative" ref={refreshMenuRef}>
            <button
              type="button"
              onClick={() => setShowRefreshMenu((v) => !v)}
              title="Auto-refresh interval"
              style={{ ...pillStyle }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#e8edf2";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f7f8fa";
              }}
            >
              <RefreshCw
                size={10}
                style={{
                  color: refreshInterval !== "Off" ? "#ff6600" : "#9ea6b3",
                  animation:
                    refreshInterval !== "Off"
                      ? "spin 2s linear infinite"
                      : "none",
                }}
              />
              <span>{refreshInterval}</span>
              <ChevronDown size={9} style={{ color: "#9ea6b3" }} />
            </button>
            {showRefreshMenu && (
              <div
                className="absolute top-full mt-1 left-0 z-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ed",
                  borderRadius: "3px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: "100px",
                }}
              >
                {REFRESH_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setRefreshInterval(opt);
                      setShowRefreshMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] transition-colors"
                    style={{
                      color: refreshInterval === opt ? "#ff6600" : "#333d47",
                      fontWeight: refreshInterval === opt ? 700 : 400,
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f7f8fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Role, AI, Settings, Clock, Logout */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live clock */}
          {showLiveClock && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded"
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
              <Clock size={9} style={{ color: "#16a34a" }} />
              <span
                className="tabular-nums font-bold"
                style={{
                  color: "#15803d",
                  fontSize: "11px",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {formatTime(time)}
              </span>
            </div>
          )}

          {showLastUpdated && (
            <div style={{ fontSize: "9px", color: "#9ea6b3" }}>
              <span
                className="tabular-nums"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {formatTime(lastUpdated)}
              </span>
            </div>
          )}

          <div
            style={{ width: "1px", height: "20px", background: "#e4e7ed" }}
          />

          {/* Role selector */}
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => setShowRoleMenu((v) => !v)}
              data-ocid="nav.role.select"
              style={{
                ...pillStyle,
                color: "#ff6600",
                borderColor: "#ff660040",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#fff4ec";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f7f8fa";
              }}
            >
              <span style={{ fontSize: "9px", color: "#9ea6b3" }}>VIEW</span>
              <span style={{ fontWeight: 700 }}>{role}</span>
              <ChevronDown size={9} style={{ color: "#9ea6b3" }} />
            </button>
            {showRoleMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ed",
                  borderRadius: "3px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: "140px",
                }}
              >
                {(["Operator", "Management", "CEO", "Supervisor"] as const).map(
                  (r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onRoleChange(r);
                        setShowRoleMenu(false);
                      }}
                      data-ocid={`nav.role.${r.toLowerCase()}.button`}
                      className="w-full text-left px-3 py-1.5 text-[11px] transition-colors"
                      style={{
                        color: r === role ? "#ff6600" : "#333d47",
                        fontWeight: r === role ? 700 : 400,
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#f7f8fa";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                    >
                      {r} View
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* AI Insight */}
          {showAIBadge && (
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded font-bold text-[10px] transition-opacity hover:opacity-90"
              data-ocid="nav.ai_insight.button"
              style={{
                background: "#7c3aed",
                color: "#fff",
                borderRadius: "3px",
              }}
            >
              <Brain size={10} />
              AI
            </button>
          )}

          {/* Settings */}
          <button
            type="button"
            onClick={onSettingsClick}
            className="p-1.5 rounded transition-colors"
            title="Dashboard Settings"
            data-ocid="nav.settings.button"
            style={{ color: "#9ea6b3" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#f7f8fa";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <Settings size={13} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded transition-colors"
            title="Logout"
            style={{ color: "#9ea6b3" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#f7f8fa";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <LogOut size={13} />
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
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="w-[400px] max-h-[80vh] overflow-y-auto flex flex-col"
            style={{
              background: "#ffffff",
              border: "1px solid #e4e7ed",
              borderRadius: "3px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#e4e7ed", background: "#f7f8fa" }}
            >
              {/* Left accent */}
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "3px",
                    height: "24px",
                    background: "#7c3aed",
                    borderRadius: "1px",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#464c54",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    AI Insight Engine
                  </div>
                  <div style={{ fontSize: "9px", color: "#9ea6b3" }}>
                    {shift === "All" ? "All Shifts" : `Shift ${shift}`} ·{" "}
                    {period}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded transition-colors"
                data-ocid="nav.ai_insight.close_button"
                style={{ color: "#9ea6b3" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#f0f2f5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Insight items */}
            <div className="p-3 space-y-2">
              {AI_INSIGHTS.map((insight) => {
                const insightStyle = TYPE_STYLES[insight.type];
                return (
                  <div
                    key={insight.text}
                    className="rounded p-2.5 flex gap-2.5"
                    style={{
                      background: `${insightStyle.bar}08`,
                      border: `1px solid ${insightStyle.bar}25`,
                    }}
                  >
                    <div
                      className="shrink-0 rounded-full mt-0.5"
                      style={{
                        width: "3px",
                        backgroundColor: insightStyle.bar,
                        minHeight: "14px",
                      }}
                    />
                    <div className="flex-1">
                      <div
                        className="text-[8px] font-black tracking-widest mb-1"
                        style={{ color: insightStyle.bar }}
                      >
                        {insightStyle.label}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#333d47",
                          lineHeight: 1.4,
                        }}
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
              className="px-4 py-2 border-t text-center"
              style={{
                borderColor: "#e4e7ed",
                fontSize: "8px",
                color: "#9ea6b3",
              }}
            >
              Analysis based on live press data · Banco Aluminium MES
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
