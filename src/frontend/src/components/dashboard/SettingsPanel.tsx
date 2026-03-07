import { ChevronDown, ChevronUp, Settings, X } from "lucide-react";
import { useState } from "react";
import {
  type Role,
  type SettingsState,
  useSettings,
} from "../../context/SettingsContext";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

// ─── Role selector colours ────────────────────────────────────────────────────
const ROLE_STYLES: Record<
  Role,
  { active: string; activeBg: string; idle: string; idleBg: string }
> = {
  Operator: {
    active: "#ffffff",
    activeBg: "#0369a1",
    idle: "#0369a1",
    idleBg: "#e0f2fe",
  },
  Management: {
    active: "#ffffff",
    activeBg: "#1d4ed8",
    idle: "#1d4ed8",
    idleBg: "#dbeafe",
  },
  CEO: {
    active: "#ffffff",
    activeBg: "#7c3aed",
    idle: "#7c3aed",
    idleBg: "#ede9fe",
  },
  Supervisor: {
    active: "#ffffff",
    activeBg: "#047857",
    idle: "#047857",
    idleBg: "#d1fae5",
  },
};

const ALL_ROLES: Role[] = ["Operator", "Management", "CEO", "Supervisor"];

// ─── Mini Toggle Component ─────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  ocid,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  ocid?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      data-ocid={ocid}
      onClick={() => onChange(!value)}
      className="relative shrink-0 transition-colors duration-200"
      style={{
        width: 32,
        height: 18,
        borderRadius: 9,
        background: value ? "#3b82f6" : "#e2e8f0",
        border: `1px solid ${value ? "#2563eb" : "#cbd5e1"}`,
        outline: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        className="absolute top-0.5 transition-transform duration-200"
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          left: value ? "calc(100% - 15px)" : "2px",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}

// ─── Section Accordion ────────────────────────────────────────────────────────
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#f1f5f9]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#f8fafc] transition-colors"
      >
        <span
          className="text-[9px] font-black tracking-widest uppercase"
          style={{ color: "#94a3b8", letterSpacing: "0.12em" }}
        >
          {title}
        </span>
        {open ? (
          <ChevronUp size={12} style={{ color: "#94a3b8" }} />
        ) : (
          <ChevronDown size={12} style={{ color: "#94a3b8" }} />
        )}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  value,
  onChange,
  ocid,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  ocid?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-3">
      <span
        className="text-[11px] font-medium truncate"
        style={{ color: "#475569" }}
      >
        {label}
      </span>
      <Toggle value={value} onChange={onChange} ocid={ocid} />
    </div>
  );
}

// ─── 2-Column Grid of toggles ─────────────────────────────────────────────────
function ToggleGrid({
  items,
  scope,
}: {
  items: {
    key: string;
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }[];
  scope: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4">
      {items.map((item) => (
        <ToggleRow
          key={item.key}
          label={item.label}
          value={item.value}
          onChange={item.onChange}
          ocid={`settings.${scope}.${item.key}.toggle`}
        />
      ))}
    </div>
  );
}

// ─── Select Row ───────────────────────────────────────────────────────────────
function SelectRow({
  label,
  value,
  options,
  onChange,
  ocid,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  ocid?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-3">
      <span className="text-[11px] font-medium" style={{ color: "#475569" }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-ocid={ocid}
        className="text-[11px] font-semibold rounded border px-2 py-1 outline-none cursor-pointer"
        style={{
          background: "#f8fafc",
          borderColor: "#e2e8f0",
          color: "#1e293b",
          minWidth: 110,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── All Management Tabs (for visibility control) ─────────────────────────────
const ALL_TABS = [
  "Dashboard",
  "Total Input",
  "Total Output",
  "Total Scrap",
  "Recovery",
  "WIP Stock",
  "Contact Time",
  "Delay & Downtime",
  "PP (Plan/Act)",
  "Die (Load/Unload)",
  "Fleet OEE",
  "Total UTIL",
  "Energy",
  "Gas Consumption",
  "Production",
  "OEE",
  "Orders",
  "Quality",
] as const;

// ─── Main Panel ───────────────────────────────────────────────────────────────
export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    settings,
    updateSettings,
    resetSettings,
    activeSettingsRole,
    setActiveSettingsRole,
  } = useSettings();

  const handleReset = () => {
    resetSettings();
  };

  // KPI Tile helpers
  const setKpiTile = (key: keyof SettingsState["kpiTiles"], val: boolean) => {
    updateSettings({ kpiTiles: { ...settings.kpiTiles, [key]: val } });
  };

  // Fleet Column helpers
  const setFleetCol = (
    key: keyof SettingsState["fleetColumns"],
    val: boolean,
  ) => {
    updateSettings({ fleetColumns: { ...settings.fleetColumns, [key]: val } });
  };

  // Tab visibility helpers
  const setTabVisible = (tab: string, val: boolean) => {
    if (tab === "Dashboard") return; // protected
    updateSettings({ visibleTabs: { ...settings.visibleTabs, [tab]: val } });
  };

  const roleStyles = ROLE_STYLES[activeSettingsRole];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Close settings"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            zIndex: 99,
          }}
        />
      )}

      {/* Slide-in panel */}
      <div
        data-ocid="settings.panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          background: "#ffffff",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Panel Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] shrink-0"
          style={{ background: "#f8fafc" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: roleStyles.activeBg }}
            >
              <Settings size={14} style={{ color: "#ffffff" }} />
            </div>
            <div>
              <div
                className="text-[13px] font-black tracking-tight"
                style={{ color: "#1e293b" }}
              >
                Dashboard Settings
              </div>
              <div
                className="text-[9px] font-bold tracking-widest uppercase mt-0.5"
                style={{ color: roleStyles.activeBg }}
              >
                {activeSettingsRole} View Settings
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="settings.close_button"
            className="p-1.5 rounded hover:bg-[#f1f5f9] transition-colors"
            title="Close settings"
          >
            <X size={15} style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* ── View Selector Row ── */}
        <div
          className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-[#e2e8f0]"
          style={{ background: "#f8fafc" }}
        >
          <span
            className="text-[9px] font-black tracking-widest uppercase mr-1"
            style={{ color: "#94a3b8" }}
          >
            Configuring:
          </span>
          {ALL_ROLES.map((role) => {
            const isActive = activeSettingsRole === role;
            const rs = ROLE_STYLES[role];
            return (
              <button
                key={role}
                type="button"
                data-ocid={`settings.view_selector.${role.toLowerCase()}.toggle`}
                onClick={() => setActiveSettingsRole(role)}
                className="flex-1 text-[10px] font-bold rounded py-1 px-1 transition-all duration-150"
                style={{
                  background: isActive ? rs.activeBg : rs.idleBg,
                  color: isActive ? rs.active : rs.idle,
                  border: `1.5px solid ${isActive ? rs.activeBg : "transparent"}`,
                  letterSpacing: "0.02em",
                }}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ── 1. Dashboard Layout ── */}
          <Section title="Dashboard Layout">
            <ToggleRow
              label="KPI Ribbon"
              value={settings.showKPIRibbon}
              onChange={(v) => updateSettings({ showKPIRibbon: v })}
              ocid="settings.layout.show_kpi_ribbon.toggle"
            />
            <ToggleRow
              label="Charts Row (3 Charts)"
              value={settings.showChartsRow}
              onChange={(v) => updateSettings({ showChartsRow: v })}
              ocid="settings.layout.show_charts_row.toggle"
            />
            <ToggleRow
              label="Press Fleet Table"
              value={settings.showPressFleetTable}
              onChange={(v) => updateSettings({ showPressFleetTable: v })}
              ocid="settings.layout.show_press_fleet_table.toggle"
            />
            <ToggleRow
              label="Downtime Analysis"
              value={settings.showDowntimeAnalysis}
              onChange={(v) => updateSettings({ showDowntimeAnalysis: v })}
              ocid="settings.layout.show_downtime_analysis.toggle"
            />
            <ToggleRow
              label="WIP Aging Analysis"
              value={settings.showWIPAging}
              onChange={(v) => updateSettings({ showWIPAging: v })}
              ocid="settings.layout.show_wip_aging.toggle"
            />
          </Section>

          {/* ── 2. KPI Ribbon Tiles ── */}
          <Section title="KPI Ribbon Tiles">
            <p className="text-[9px] mb-2" style={{ color: "#94a3b8" }}>
              Toggle which KPI tiles are visible in the ribbon
            </p>
            <ToggleGrid
              scope="kpi"
              items={[
                {
                  key: "totalInput",
                  label: "Total Input",
                  value: settings.kpiTiles.totalInput,
                  onChange: (v) => setKpiTile("totalInput", v),
                },
                {
                  key: "totalOutput",
                  label: "Total Output",
                  value: settings.kpiTiles.totalOutput,
                  onChange: (v) => setKpiTile("totalOutput", v),
                },
                {
                  key: "totalScrap",
                  label: "Total Scrap",
                  value: settings.kpiTiles.totalScrap,
                  onChange: (v) => setKpiTile("totalScrap", v),
                },
                {
                  key: "recovery",
                  label: "Recovery",
                  value: settings.kpiTiles.recovery,
                  onChange: (v) => setKpiTile("recovery", v),
                },
                {
                  key: "wipStock",
                  label: "WIP Stock",
                  value: settings.kpiTiles.wipStock,
                  onChange: (v) => setKpiTile("wipStock", v),
                },
                {
                  key: "contactTime",
                  label: "Contact Time",
                  value: settings.kpiTiles.contactTime,
                  onChange: (v) => setKpiTile("contactTime", v),
                },
                {
                  key: "totalDelay",
                  label: "Total Delay",
                  value: settings.kpiTiles.totalDelay,
                  onChange: (v) => setKpiTile("totalDelay", v),
                },
                {
                  key: "ppPlanAct",
                  label: "Press Kg/H",
                  value: settings.kpiTiles.ppPlanAct,
                  onChange: (v) => setKpiTile("ppPlanAct", v),
                },
                {
                  key: "fleetOEE",
                  label: "Fleet OEE",
                  value: settings.kpiTiles.fleetOEE,
                  onChange: (v) => setKpiTile("fleetOEE", v),
                },
                {
                  key: "totalUtil",
                  label: "Total UTIL",
                  value: settings.kpiTiles.totalUtil,
                  onChange: (v) => setKpiTile("totalUtil", v),
                },
                {
                  key: "energy",
                  label: "Energy",
                  value: settings.kpiTiles.energy,
                  onChange: (v) => setKpiTile("energy", v),
                },
                {
                  key: "gasConsumption",
                  label: "Gas Consumption",
                  value: settings.kpiTiles.gasConsumption,
                  onChange: (v) => setKpiTile("gasConsumption", v),
                },
              ]}
            />
          </Section>

          {/* ── 3. Press Fleet Columns ── */}
          <Section title="Press Fleet Columns">
            <p className="text-[9px] mb-2" style={{ color: "#94a3b8" }}>
              Show or hide columns in Press Fleet Performance table
            </p>
            <ToggleGrid
              scope="fleet_col"
              items={[
                {
                  key: "status",
                  label: "Status",
                  value: settings.fleetColumns.status,
                  onChange: (v) => setFleetCol("status", v),
                },
                {
                  key: "dieKgH",
                  label: "Die Kg/H",
                  value: settings.fleetColumns.dieKgH,
                  onChange: (v) => setFleetCol("dieKgH", v),
                },
                {
                  key: "pressKgH",
                  label: "Press Kg/H",
                  value: settings.fleetColumns.pressKgH,
                  onChange: (v) => setFleetCol("pressKgH", v),
                },
                {
                  key: "inputMt",
                  label: "Input (Mt)",
                  value: settings.fleetColumns.inputMt,
                  onChange: (v) => setFleetCol("inputMt", v),
                },
                {
                  key: "outputMt",
                  label: "Output (Mt)",
                  value: settings.fleetColumns.outputMt,
                  onChange: (v) => setFleetCol("outputMt", v),
                },
                {
                  key: "contactTime",
                  label: "Contact Time",
                  value: settings.fleetColumns.contactTime,
                  onChange: (v) => setFleetCol("contactTime", v),
                },
                {
                  key: "downtime",
                  label: "Downtime",
                  value: settings.fleetColumns.downtime,
                  onChange: (v) => setFleetCol("downtime", v),
                },
                {
                  key: "ppPlan",
                  label: "PP Planned",
                  value: settings.fleetColumns.ppPlan,
                  onChange: (v) => setFleetCol("ppPlan", v),
                },
                {
                  key: "ppActual",
                  label: "PP Actual",
                  value: settings.fleetColumns.ppActual,
                  onChange: (v) => setFleetCol("ppActual", v),
                },
                {
                  key: "dieLoad",
                  label: "Die Load",
                  value: settings.fleetColumns.dieLoad,
                  onChange: (v) => setFleetCol("dieLoad", v),
                },
                {
                  key: "dieUnload",
                  label: "Die Unload",
                  value: settings.fleetColumns.dieUnload,
                  onChange: (v) => setFleetCol("dieUnload", v),
                },
                {
                  key: "oee",
                  label: "OEE %",
                  value: settings.fleetColumns.oee,
                  onChange: (v) => setFleetCol("oee", v),
                },
                {
                  key: "recovery",
                  label: "Recovery %",
                  value: settings.fleetColumns.recovery,
                  onChange: (v) => setFleetCol("recovery", v),
                },
              ]}
            />
          </Section>

          {/* ── 4. Tab Visibility ── */}
          <Section title="Tab Visibility">
            <p className="text-[9px] mb-2" style={{ color: "#94a3b8" }}>
              Dashboard tab is always visible. Toggle other tabs on/off.
            </p>
            <ToggleGrid
              scope="tabs"
              items={ALL_TABS.map((tab) => ({
                key: tab
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "_")
                  .replace(/_+/g, "_"),
                label: tab,
                value:
                  tab === "Dashboard"
                    ? true
                    : settings.visibleTabs[tab] !== false,
                onChange: (v) => setTabVisible(tab, v),
              }))}
            />
          </Section>

          {/* ── 5. View Defaults ── */}
          <Section title="View Defaults">
            <p className="text-[9px] mb-2" style={{ color: "#94a3b8" }}>
              These apply on next page load, not the current session.
            </p>
            <SelectRow
              label="Default Role"
              value={settings.defaultRole}
              options={[
                { value: "Operator", label: "Operator" },
                { value: "Management", label: "Management" },
                { value: "CEO", label: "CEO" },
                { value: "Supervisor", label: "Supervisor" },
              ]}
              onChange={(v) =>
                updateSettings({
                  defaultRole: v as SettingsState["defaultRole"],
                })
              }
              ocid="settings.defaults.role.select"
            />
            <SelectRow
              label="Default Shift"
              value={settings.defaultShift}
              options={[
                { value: "All", label: "All Shifts" },
                { value: "A", label: "Shift A" },
                { value: "B", label: "Shift B" },
                { value: "C", label: "Shift C" },
              ]}
              onChange={(v) =>
                updateSettings({
                  defaultShift: v as SettingsState["defaultShift"],
                })
              }
              ocid="settings.defaults.shift.select"
            />
            <SelectRow
              label="Default Period"
              value={settings.defaultPeriod}
              options={[
                { value: "Today", label: "Today" },
                { value: "Week", label: "Week" },
                { value: "Month", label: "Month" },
              ]}
              onChange={(v) =>
                updateSettings({
                  defaultPeriod: v as SettingsState["defaultPeriod"],
                })
              }
              ocid="settings.defaults.period.select"
            />
          </Section>

          {/* ── 6. Data Display ── */}
          <Section title="Data Display">
            <ToggleRow
              label="Auto-Refresh (30s)"
              value={settings.autoRefresh}
              onChange={(v) => updateSettings({ autoRefresh: v })}
              ocid="settings.display.auto_refresh.toggle"
            />
            <ToggleRow
              label="Show Last Updated"
              value={settings.showLastUpdated}
              onChange={(v) => updateSettings({ showLastUpdated: v })}
              ocid="settings.display.show_last_updated.toggle"
            />
            <ToggleRow
              label="Show Live Clock"
              value={settings.showLiveClock}
              onChange={(v) => updateSettings({ showLiveClock: v })}
              ocid="settings.display.show_live_clock.toggle"
            />
            <SelectRow
              label="KPI Decimal Places"
              value={String(settings.kpiDecimals)}
              options={[
                { value: "1", label: "1 decimal" },
                { value: "2", label: "2 decimals" },
                { value: "3", label: "3 decimals" },
              ]}
              onChange={(v) =>
                updateSettings({
                  kpiDecimals: Number(v) as SettingsState["kpiDecimals"],
                })
              }
              ocid="settings.display.kpi_decimals.select"
            />
          </Section>

          {/* ── 7. Alerts & Notifications ── */}
          <Section title="Alerts &amp; Notifications">
            <ToggleRow
              label="AI Insight Button"
              value={settings.showAIBadge}
              onChange={(v) => updateSettings({ showAIBadge: v })}
              ocid="settings.alerts.show_ai_badge.toggle"
            />
            <ToggleRow
              label="Show Footer"
              value={settings.showFooter}
              onChange={(v) => updateSettings({ showFooter: v })}
              ocid="settings.alerts.show_footer.toggle"
            />
          </Section>

          {/* Bottom padding */}
          <div className="h-20" />
        </div>

        {/* ── Sticky Footer ── */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-[#e2e8f0]"
          style={{ background: "#f8fafc" }}
        >
          <button
            type="button"
            onClick={handleReset}
            data-ocid="settings.reset_button"
            className="px-3 py-1.5 text-[11px] font-bold rounded border transition-colors hover:bg-red-50"
            style={{ color: "#ef4444", borderColor: "#fecaca" }}
          >
            Reset {activeSettingsRole} View
          </button>
          <button
            type="button"
            onClick={onClose}
            data-ocid="settings.close_button"
            className="px-3 py-1.5 text-[11px] font-bold rounded border transition-colors hover:bg-[#eff6ff]"
            style={{
              color: "#1d4ed8",
              borderColor: "#bfdbfe",
              background: "#ffffff",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
