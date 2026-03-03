import { Toaster } from "@/components/ui/sonner";
import { useEffect, useMemo, useRef, useState } from "react";

import { CEOView } from "./components/dashboard/CEOView";
import {
  OEEQualityChart,
  OutputRatesChart,
  ProductionVsPlanChart,
} from "./components/dashboard/Charts";
import { DowntimeAnalysis } from "./components/dashboard/DowntimeAnalysis";
import { KPIRibbon } from "./components/dashboard/KPIRibbon";
import { OperatorView } from "./components/dashboard/OperatorView";
import { PressFleetTable } from "./components/dashboard/PressFleetTable";
import { TopNavBar } from "./components/dashboard/TopNavBar";
import {
  TopAlloysTable,
  TopDiesTable,
  WIPAgingDonut,
} from "./components/dashboard/TopTablesAndWIP";
import { TotalInputModal } from "./components/dashboard/TotalInputModal";

import { CostTab } from "./components/tabs/CostTab";
import { DowntimeTab } from "./components/tabs/DowntimeTab";
import { MachineTab } from "./components/tabs/MachineTab";
import { MultiPlantTab } from "./components/tabs/MultiPlantTab";
import { OEETab } from "./components/tabs/OEETab";
import { OrdersTab } from "./components/tabs/OrdersTab";
import { ProductionTab } from "./components/tabs/ProductionTab";
import { QualityTab } from "./components/tabs/QualityTab";
import { StrategicTab } from "./components/tabs/StrategicTab";

import {
  useActiveAlarms,
  useAllDowntimeEvents,
  useAllPlants,
  useAllPresses,
  useOEEData,
  useOrdersByStatus,
  useOverdueDies,
  useProductionMetrics,
  useQualityRecords,
} from "./hooks/useQueries";

import {
  type PressData,
  applyLiveDelta,
  downtimeCategories,
  initialPresses,
  kpiData,
  strategicKPIs,
  topAlloys,
  topDies,
  wipAgingData,
} from "./mockData";

type Role = "Operator" | "Management" | "CEO";

type ManagementTab =
  | "Dashboard"
  | "Production"
  | "OEE"
  | "Machine"
  | "Orders"
  | "Quality"
  | "Downtime"
  | "Cost"
  | "Multi-Plant"
  | "Strategic";

const MANAGEMENT_TABS: ManagementTab[] = [
  "Dashboard",
  "Production",
  "OEE",
  "Machine",
  "Orders",
  "Quality",
  "Downtime",
  "Cost",
  "Multi-Plant",
  "Strategic",
];

export default function App() {
  const [role, setRole] = useState<Role>("Management");
  const [activeTab, setActiveTab] = useState<ManagementTab>("Dashboard");
  const [presses, setPresses] = useState<PressData[]>(initialPresses);
  const [kpis, setKpis] = useState({ ...kpiData });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showTotalInputModal, setShowTotalInputModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate live data refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPresses((prev) =>
        prev.map((p) => ({
          ...p,
          oee:
            p.status === "Breakdown"
              ? p.oee
              : Math.min(99, Math.max(30, applyLiveDelta(p.oee, 0.02))),
          actual:
            p.status === "Breakdown"
              ? p.actual
              : Math.max(0, applyLiveDelta(p.actual, 0.03)),
          kgPerHour:
            p.status === "Breakdown"
              ? p.kgPerHour
              : Math.max(0, applyLiveDelta(p.kgPerHour, 0.025)),
        })),
      );
      setKpis((prev) => ({
        ...prev,
        totalInput: Math.max(0, applyLiveDelta(prev.totalInput, 0.015)),
        totalOutput: Math.max(0, applyLiveDelta(prev.totalOutput, 0.015)),
        fleetOEE: Math.min(
          99,
          Math.max(30, applyLiveDelta(prev.fleetOEE, 0.01)),
        ),
        totalUtil: Math.min(
          99,
          Math.max(30, applyLiveDelta(prev.totalUtil, 0.01)),
        ),
        totalEnergy: Math.max(0, applyLiveDelta(prev.totalEnergy, 0.02)),
      }));
      setLastUpdated(new Date());
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Build production chart data from live press data
  const productionChartData = presses.map((p) => ({
    press: `${p.id} (${p.name})`,
    plan: p.plan,
    actual: Number.parseFloat(p.actual.toFixed(2)),
  }));

  // ---------- Backend data hooks (for Management tabs) ----------
  const pressesQuery = useAllPresses();
  const plantsQuery = useAllPlants();
  const alarmsQuery = useActiveAlarms();
  const downtimeEventsQuery = useAllDowntimeEvents();
  const ordersQuery = useOrdersByStatus();
  const overdueDiesQuery = useOverdueDies();

  const backendPresses = pressesQuery.data ?? [];
  const backendPressIds = useMemo(
    () => backendPresses.map((p) => p.id),
    [backendPresses],
  );
  const alloys = useMemo(
    () =>
      Array.from(
        new Set(backendPresses.map((p) => p.alloyGrade).filter(Boolean)),
      ),
    [backendPresses],
  );

  const productionMetricsQuery = useProductionMetrics(backendPressIds);
  const oeeDataQuery = useOEEData(backendPressIds);
  const qualityRecordsQuery = useQualityRecords(alloys);

  const backendPlants = plantsQuery.data ?? [];
  const backendAlarms = alarmsQuery.data ?? [];
  const backendDowntimeEvents = downtimeEventsQuery.data ?? [];
  const backendOrders = ordersQuery.data ?? [];
  const backendOverdueDies = overdueDiesQuery.data ?? [];
  const backendProductionData = productionMetricsQuery.data ?? {};
  const backendOEEData = oeeDataQuery.data ?? {};
  const backendQualityRecords = qualityRecordsQuery.data ?? [];

  const isBackendLoading =
    pressesQuery.isLoading ||
    plantsQuery.isLoading ||
    alarmsQuery.isLoading ||
    downtimeEventsQuery.isLoading ||
    ordersQuery.isLoading ||
    overdueDiesQuery.isLoading;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "#070c16",
        fontFamily: '"Mona Sans", system-ui, sans-serif',
      }}
    >
      {/* Toast notifications */}
      <Toaster theme="dark" />

      {/* Top Navigation Bar */}
      <TopNavBar role={role} onRoleChange={setRole} lastUpdated={lastUpdated} />

      {/* KPI Ribbon */}
      <KPIRibbon
        data={kpis}
        onTotalInputClick={() => setShowTotalInputModal(true)}
      />

      {/* Total Input Modal */}
      <TotalInputModal
        open={showTotalInputModal}
        onClose={() => setShowTotalInputModal(false)}
        totalInput={kpis.totalInput}
      />

      {/* Main Content — role-based */}
      {role === "Operator" ? (
        <div className="flex-1 overflow-y-auto">
          <OperatorView presses={presses} />
        </div>
      ) : role === "CEO" ? (
        <div className="flex-1 overflow-y-auto">
          <CEOView
            kpis={strategicKPIs}
            fleetOEE={kpis.fleetOEE}
            totalOutput={kpis.totalOutput}
            fleetUtil={kpis.totalUtil}
          />
        </div>
      ) : (
        /* Management View — tabbed dashboard */
        <div
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: "#070c16" }}
        >
          {/* Tab Bar */}
          <div
            className="shrink-0 border-b overflow-x-auto"
            style={{
              background: "#060b14",
              borderColor: "#162030",
              scrollbarWidth: "none",
            }}
          >
            <div className="flex items-end gap-0 px-1.5 min-w-max">
              {MANAGEMENT_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="relative px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0"
                    style={{
                      color: isActive ? "#93c5fd" : "#475569",
                      background: isActive ? "#0a1628" : "transparent",
                      borderBottom: isActive
                        ? "2px solid #3b82f6"
                        : "2px solid transparent",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {tab.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "Dashboard" && (
              <div style={{ background: "#070c16" }}>
                {/* Charts Row */}
                <div
                  className="grid p-1.5 gap-1.5"
                  style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                >
                  <ProductionVsPlanChart productionData={productionChartData} />
                  <OEEQualityChart />
                  <OutputRatesChart />
                </div>

                {/* Press Fleet + Downtime Row */}
                <div
                  className="grid gap-1.5 px-1.5 pb-1.5"
                  style={{ gridTemplateColumns: "65fr 35fr" }}
                >
                  <PressFleetTable presses={presses} />
                  <DowntimeAnalysis
                    categories={downtimeCategories}
                    totalHrs={17.8}
                  />
                </div>

                {/* Top Dies + Top Alloys + WIP Aging Row */}
                <div
                  className="grid gap-1.5 px-1.5 pb-1.5"
                  style={{ gridTemplateColumns: "35fr 35fr 30fr" }}
                >
                  <TopDiesTable dies={topDies} />
                  <TopAlloysTable alloys={topAlloys} />
                  <WIPAgingDonut data={wipAgingData} />
                </div>
              </div>
            )}

            {activeTab === "Production" && (
              <ProductionTab
                presses={backendPresses}
                productionData={backendProductionData}
                isLoading={
                  pressesQuery.isLoading || productionMetricsQuery.isLoading
                }
              />
            )}

            {activeTab === "OEE" && (
              <OEETab
                presses={backendPresses}
                oeeData={backendOEEData}
                downtimeEvents={backendDowntimeEvents}
                isLoading={
                  pressesQuery.isLoading ||
                  oeeDataQuery.isLoading ||
                  downtimeEventsQuery.isLoading
                }
              />
            )}

            {activeTab === "Machine" && (
              <MachineTab
                presses={backendPresses}
                alarms={backendAlarms}
                isLoading={pressesQuery.isLoading || alarmsQuery.isLoading}
              />
            )}

            {activeTab === "Orders" && (
              <OrdersTab
                orders={backendOrders}
                overdueDies={backendOverdueDies}
                isLoading={ordersQuery.isLoading || overdueDiesQuery.isLoading}
              />
            )}

            {activeTab === "Quality" && (
              <QualityTab
                presses={backendPresses}
                qualityRecords={backendQualityRecords}
                isLoading={
                  pressesQuery.isLoading || qualityRecordsQuery.isLoading
                }
              />
            )}

            {activeTab === "Downtime" && (
              <DowntimeTab
                presses={backendPresses}
                downtimeEvents={backendDowntimeEvents}
                isLoading={
                  pressesQuery.isLoading || downtimeEventsQuery.isLoading
                }
              />
            )}

            {activeTab === "Cost" && (
              <CostTab
                presses={backendPresses}
                oeeData={backendOEEData}
                isLoading={pressesQuery.isLoading || oeeDataQuery.isLoading}
              />
            )}

            {activeTab === "Multi-Plant" && (
              <MultiPlantTab
                plants={backendPlants}
                presses={backendPresses}
                oeeData={backendOEEData}
                productionData={backendProductionData}
                isLoading={isBackendLoading}
              />
            )}

            {activeTab === "Strategic" && (
              <StrategicTab
                presses={backendPresses}
                plants={backendPlants}
                oeeData={backendOEEData}
                productionData={backendProductionData}
                orders={backendOrders}
                isLoading={isBackendLoading}
              />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="border-t border-[#1e2d45] px-3 py-1.5 flex items-center justify-between shrink-0"
        style={{ background: "#080d18" }}
      >
        <div
          className="flex items-center gap-3 text-[9px]"
          style={{ color: "#334155" }}
        >
          <span>5 PRESSES MONITORED</span>
          <span>·</span>
          <span>SHIFT A</span>
          <span>·</span>
          <span className="font-mono" style={{ color: "#3b82f6" }}>
            LIVE
          </span>
        </div>
        <div className="text-[9px]" style={{ color: "#334155" }}>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[#64748b] transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
