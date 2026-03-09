import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LivePressRecord } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { PressData } from "../mockData";

// ─── Storage ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mes_live_data";

interface PersistedState {
  isLiveMode: boolean;
  liveApiUrl: string;
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        isLiveMode: parsed.isLiveMode ?? false,
        liveApiUrl: parsed.liveApiUrl ?? "",
      };
    }
  } catch {
    // ignore
  }
  return { isLiveMode: false, liveApiUrl: "" };
}

function savePersisted(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// ─── Map LivePressRecord → PressData ─────────────────────────────────────────
const PRESS_NAMES: Record<string, string> = {
  P3300: "P3300",
  P2500: "P2500",
  P1800: "P1800",
  P1460: "P1460",
  P1100: "P1100",
};

const PRESS_TONNAGE: Record<string, number> = {
  P3300: 3300,
  P2500: 2500,
  P1800: 1800,
  P1460: 1460,
  P1100: 1100,
};

function mapStatusString(
  raw: string,
): "Running" | "Idle" | "Breakdown" | "Setup" {
  const lower = raw.toLowerCase();
  if (lower === "running") return "Running";
  if (lower === "idle") return "Idle";
  if (lower === "breakdown") return "Breakdown";
  if (lower === "setup") return "Setup";
  return "Running";
}

function livePressRecordToPressData(rec: LivePressRecord): PressData {
  const id = rec.id;
  const name = PRESS_NAMES[id] ?? id;
  const tonnage = PRESS_TONNAGE[id] ?? 1000;

  return {
    id,
    name,
    tonnage,
    status: mapStatusString(rec.status),
    oee: rec.oee,
    plan: Number(rec.ppPlanBillets),
    actual: rec.kgPerHour, // repurpose for chart compat
    downtime: Number(rec.downtimeMinutes),
    scrap: Math.max(0, 100 - rec.recovery),
    dieNumber: `DIE-${id}`,
    alloyGrade: "6063",
    operator: "Live Operator",
    shift: "A",
    workOrder: `WO-${id}-LIVE`,
    billetTemp: 480,
    ramPressure: 185,
    extrusionSpeed: 6.5,
    kgPerHour: rec.kgPerHour,
    dieTarget: Number(rec.ppPlanBillets),
    dieKgH: rec.dieKgH,
    ppPlan: Number(rec.ppPlanBillets),
    ppAct: Number(rec.ppActBillets),
    ppPlanBillets: Number(rec.ppPlanBillets),
    ppActBillets: Number(rec.ppActBillets),
    dieLoad: Number(rec.dieLoadCount),
    dieUnload: Number(rec.dieUnloadCount),
    dieLoadCount: Number(rec.dieLoadCount),
    dieUnloadCount: Number(rec.dieUnloadCount),
    contactTime: rec.contactTime,
    recovery: rec.recovery,
    inputMt: rec.inputMt,
    outputMt: rec.outputMt,
  };
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface LiveDataContextValue {
  isLiveMode: boolean;
  liveApiUrl: string;
  livePressList: PressData[];
  lastFetchStatus: string;
  lastFetchTime: Date | null;
  isLoading: boolean;
  errorMsg: string | null;
  setLiveMode: (enabled: boolean) => void;
  setApiUrl: (url: string) => void;
  triggerFetch: () => Promise<void>;
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const persisted = loadPersisted();

  const [isLiveMode, setIsLiveModeState] = useState(persisted.isLiveMode);
  const [liveApiUrl, setLiveApiUrlState] = useState(persisted.liveApiUrl);
  const [livePressList, setLivePressList] = useState<PressData[]>([]);
  const [lastFetchStatus, setLastFetchStatus] =
    useState<string>("Never fetched");
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actorRef = useRef(actor);

  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  // On mount, load the stored endpoint from the backend canister.
  // We intentionally omit liveApiUrl and isLiveMode from deps — this should
  // only run once when actor becomes available, not on every state change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-shot init
  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getApiEndpoint()
      .then(([url, enabled]) => {
        if (url) {
          setLiveApiUrlState(url);
          savePersisted({ isLiveMode: enabled, liveApiUrl: url });
        }
        setIsLiveModeState(enabled);
      })
      .catch(() => {
        // ignore — backend may not have any stored endpoint yet
      });
  }, [actor, isFetching]);

  // Core fetch function
  const doFetch = useCallback(async () => {
    const currentActor = actorRef.current;
    if (!currentActor) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [success, msg] = await currentActor.fetchLiveData();
      if (success) {
        const records = await currentActor.getLivePressData();
        const mapped = records.map(livePressRecordToPressData);
        setLivePressList(mapped);
        setLastFetchStatus(`${msg} · ${mapped.length} records`);
        setLastFetchTime(new Date());
        setErrorMsg(null);
      } else {
        setErrorMsg(msg || "Fetch failed");
        setLastFetchStatus(`Error: ${msg}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message);
      setLastFetchStatus(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerFetch = useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  // Start/stop polling when live mode changes.
  // doFetch is stable (useCallback with empty deps) so we suppress the warning.
  // biome-ignore lint/correctness/useExhaustiveDependencies: doFetch is stable
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (isLiveMode) {
      // Immediate fetch on enable
      doFetch();
      pollRef.current = setInterval(() => {
        doFetch();
      }, 30_000);
    } else {
      setLivePressList([]);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isLiveMode]);

  const setLiveMode = useCallback(
    (enabled: boolean) => {
      setIsLiveModeState(enabled);
      savePersisted({ isLiveMode: enabled, liveApiUrl });
    },
    [liveApiUrl],
  );

  const setApiUrl = useCallback(
    (url: string) => {
      setLiveApiUrlState(url);
      savePersisted({ isLiveMode, liveApiUrl: url });
    },
    [isLiveMode],
  );

  return (
    <LiveDataContext.Provider
      value={{
        isLiveMode,
        liveApiUrl,
        livePressList,
        lastFetchStatus,
        lastFetchTime,
        isLoading,
        errorMsg,
        setLiveMode,
        setApiUrl,
        triggerFetch,
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLiveData(): LiveDataContextValue {
  const ctx = useContext(LiveDataContext);
  if (!ctx) {
    throw new Error("useLiveData must be used inside LiveDataProvider");
  }
  return ctx;
}
