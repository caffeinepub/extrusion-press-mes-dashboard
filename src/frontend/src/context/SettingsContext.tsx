import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Role = "Operator" | "Management" | "CEO" | "Supervisor";

export interface SettingsState {
  // Dashboard Layout
  showKPIRibbon: boolean;
  showChartsRow: boolean;
  showPressFleetTable: boolean;
  showDowntimeAnalysis: boolean;
  showWIPAging: boolean;

  // KPI Ribbon Tiles
  kpiTiles: {
    totalInput: boolean;
    totalOutput: boolean;
    totalScrap: boolean;
    recovery: boolean;
    wipStock: boolean;
    contactTime: boolean;
    totalDelay: boolean;
    ppPlanAct: boolean;
    fleetOEE: boolean;
    totalUtil: boolean;
    energy: boolean;
    gasConsumption: boolean;
  };

  // Press Fleet Table Columns
  fleetColumns: {
    status: boolean;
    dieKgH: boolean;
    pressKgH: boolean;
    inputMt: boolean;
    outputMt: boolean;
    contactTime: boolean;
    downtime: boolean;
    ppPlan: boolean;
    ppActual: boolean;
    dieLoad: boolean;
    dieUnload: boolean;
    oee: boolean;
    recovery: boolean;
  };

  // Tab Visibility
  visibleTabs: Record<string, boolean>;

  // View Defaults
  defaultRole: Role;
  defaultShift: "All" | "A" | "B" | "C";
  defaultPeriod: "Today" | "Week" | "Month";

  // Data Display
  autoRefresh: boolean;
  showLastUpdated: boolean;
  showLiveClock: boolean;
  kpiDecimals: 1 | 2 | 3;

  // Alerts
  showAIBadge: boolean;
  showFooter: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  showKPIRibbon: true,
  showChartsRow: true,
  showPressFleetTable: true,
  showDowntimeAnalysis: true,
  showWIPAging: true,

  kpiTiles: {
    totalInput: true,
    totalOutput: true,
    totalScrap: true,
    recovery: true,
    wipStock: true,
    contactTime: true,
    totalDelay: true,
    ppPlanAct: true,
    fleetOEE: true,
    totalUtil: true,
    energy: true,
    gasConsumption: true,
  },

  fleetColumns: {
    status: true,
    dieKgH: true,
    pressKgH: true,
    inputMt: true,
    outputMt: true,
    contactTime: true,
    downtime: true,
    ppPlan: true,
    ppActual: true,
    dieLoad: true,
    dieUnload: true,
    oee: true,
    recovery: true,
  },

  visibleTabs: {
    Dashboard: true,
    "Total Input": true,
    "Total Output": true,
    "Total Scrap": true,
    Recovery: true,
    "WIP Stock": true,
    "Contact Time": true,
    "Delay & Downtime": true,
    "PP (Plan/Act)": true,
    "Die (Load/Unload)": true,
    "Fleet OEE": true,
    "Total UTIL": true,
    Energy: true,
    "Gas Consumption": true,
    Production: true,
    OEE: true,
    Orders: true,
    Quality: true,
  },

  defaultRole: "Management",
  defaultShift: "All",
  defaultPeriod: "Today",

  autoRefresh: true,
  showLastUpdated: true,
  showLiveClock: true,
  kpiDecimals: 2,

  showAIBadge: true,
  showFooter: true,
};

// ─── Per-view storage keys ─────────────────────────────────────────────────
const STORAGE_KEYS: Record<Role, string> = {
  Operator: "mes_settings_operator",
  Management: "mes_settings_management",
  CEO: "mes_settings_ceo",
  Supervisor: "mes_settings_supervisor",
};

const OLD_STORAGE_KEY = "mes_settings";

type ViewSettingsMap = Record<Role, SettingsState>;

const ALL_ROLES: Role[] = ["Operator", "Management", "CEO", "Supervisor"];

function deepMerge(partial: Partial<SettingsState>): SettingsState {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    kpiTiles: { ...DEFAULT_SETTINGS.kpiTiles, ...(partial.kpiTiles ?? {}) },
    fleetColumns: {
      ...DEFAULT_SETTINGS.fleetColumns,
      ...(partial.fleetColumns ?? {}),
    },
    visibleTabs: {
      ...DEFAULT_SETTINGS.visibleTabs,
      ...(partial.visibleTabs ?? {}),
    },
  };
}

function loadRoleSettings(
  role: Role,
  migrationBase?: Partial<SettingsState>,
): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[role]);
    if (raw) {
      return deepMerge(JSON.parse(raw) as Partial<SettingsState>);
    }
    // Use migration base if available (from old single-key storage)
    if (migrationBase) {
      return deepMerge(migrationBase);
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadAllSettings(): ViewSettingsMap {
  // Migration: if old single key exists, use it as base for all roles
  let migrationBase: Partial<SettingsState> | undefined;
  try {
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      migrationBase = JSON.parse(oldRaw) as Partial<SettingsState>;
      // Remove old key after migration
      localStorage.removeItem(OLD_STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  return {
    Operator: loadRoleSettings("Operator", migrationBase),
    Management: loadRoleSettings("Management", migrationBase),
    CEO: loadRoleSettings("CEO", migrationBase),
    Supervisor: loadRoleSettings("Supervisor", migrationBase),
  };
}

// ─── Context API ──────────────────────────────────────────────────────────
interface SettingsContextValue {
  // Per-view API
  getViewSettings: (role: Role) => SettingsState;
  updateViewSettings: (role: Role, patch: Partial<SettingsState>) => void;
  resetViewSettings: (role: Role) => void;
  activeSettingsRole: Role;
  setActiveSettingsRole: (role: Role) => void;

  // Backward compat (always operates on activeSettingsRole)
  settings: SettingsState;
  updateSettings: (patch: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [allViewSettings, setAllViewSettings] =
    useState<ViewSettingsMap>(loadAllSettings);
  const [activeSettingsRole, setActiveSettingsRole] =
    useState<Role>("Management");

  // Persist all roles whenever any changes
  useEffect(() => {
    for (const role of ALL_ROLES) {
      try {
        localStorage.setItem(
          STORAGE_KEYS[role],
          JSON.stringify(allViewSettings[role]),
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [allViewSettings]);

  const getViewSettings = useCallback(
    (role: Role): SettingsState => allViewSettings[role],
    [allViewSettings],
  );

  const updateViewSettings = useCallback(
    (role: Role, patch: Partial<SettingsState>) => {
      setAllViewSettings((prev) => {
        const current = prev[role];
        return {
          ...prev,
          [role]: {
            ...current,
            ...patch,
            kpiTiles:
              patch.kpiTiles !== undefined
                ? { ...current.kpiTiles, ...patch.kpiTiles }
                : current.kpiTiles,
            fleetColumns:
              patch.fleetColumns !== undefined
                ? { ...current.fleetColumns, ...patch.fleetColumns }
                : current.fleetColumns,
            visibleTabs:
              patch.visibleTabs !== undefined
                ? { ...current.visibleTabs, ...patch.visibleTabs }
                : current.visibleTabs,
          },
        };
      });
    },
    [],
  );

  const resetViewSettings = useCallback((role: Role) => {
    setAllViewSettings((prev) => ({ ...prev, [role]: DEFAULT_SETTINGS }));
    try {
      localStorage.removeItem(STORAGE_KEYS[role]);
    } catch {
      // ignore
    }
  }, []);

  // Backward-compat aliases that operate on activeSettingsRole
  const settings = allViewSettings[activeSettingsRole];

  const updateSettings = useCallback(
    (patch: Partial<SettingsState>) => {
      updateViewSettings(activeSettingsRole, patch);
    },
    [activeSettingsRole, updateViewSettings],
  );

  const resetSettings = useCallback(() => {
    resetViewSettings(activeSettingsRole);
  }, [activeSettingsRole, resetViewSettings]);

  return (
    <SettingsContext.Provider
      value={{
        getViewSettings,
        updateViewSettings,
        resetViewSettings,
        activeSettingsRole,
        setActiveSettingsRole,
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
