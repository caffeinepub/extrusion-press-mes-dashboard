import { Toaster } from "@/components/ui/sonner";
import { useEffect, useMemo, useRef, useState } from "react";

import { CEOView } from "./components/dashboard/CEOView";
import {
  OEEQualityChart,
  OutputRatesChart,
  ProductionVsPlanChart,
} from "./components/dashboard/Charts";
import { ContactTimeModal } from "./components/dashboard/ContactTimeModal";
import { DowntimeAnalysis } from "./components/dashboard/DowntimeAnalysis";
import { DowntimePressModal } from "./components/dashboard/DowntimePressModal";
import { FleetOEEModal } from "./components/dashboard/FleetOEEModal";
import { GasModal } from "./components/dashboard/GasModal";
import { KPIRibbon } from "./components/dashboard/KPIRibbon";
import { OperatorView } from "./components/dashboard/OperatorView";
import { PressDetailModal } from "./components/dashboard/PressDetailModal";
import { PressFleetTable } from "./components/dashboard/PressFleetTable";
import { PressKgHModal } from "./components/dashboard/PressKgHModal";
import { TopNavBar } from "./components/dashboard/TopNavBar";
import { WIPAgingDonut } from "./components/dashboard/TopTablesAndWIP";
import { TotalBacklogModal } from "./components/dashboard/TotalBacklogModal";
import { TotalDelayModal } from "./components/dashboard/TotalDelayModal";
import { TotalEnergyModal } from "./components/dashboard/TotalEnergyModal";
import { TotalInputModal } from "./components/dashboard/TotalInputModal";
import { TotalOutputModal } from "./components/dashboard/TotalOutputModal";
import { TotalRecoveryModal } from "./components/dashboard/TotalRecoveryModal";
import { TotalScrapModal } from "./components/dashboard/TotalScrapModal";
import { TotalUtilModal } from "./components/dashboard/TotalUtilModal";
import { TotalWIPModal } from "./components/dashboard/TotalWIPModal";
import { WIPAgingPressModal } from "./components/dashboard/WIPAgingPressModal";

import { ContactTimeTab } from "./components/tabs/ContactTimeTab";
import { DelayDowntimeTab } from "./components/tabs/DelayDowntimeTab";
import { DieLoadUnloadTab } from "./components/tabs/DieLoadUnloadTab";
import { EnergyTab } from "./components/tabs/EnergyTab";
import { FleetOEETab } from "./components/tabs/FleetOEETab";
import { GasTab } from "./components/tabs/GasTab";
import { OEETab } from "./components/tabs/OEETab";
import { OrdersTab } from "./components/tabs/OrdersTab";
import { PPPlanVsActualTab } from "./components/tabs/PPPlanVsActualTab";
import { ProductionTab } from "./components/tabs/ProductionTab";
import { QualityTab } from "./components/tabs/QualityTab";
import { RecoveryTab } from "./components/tabs/RecoveryTab";
import { TotalInputTab } from "./components/tabs/TotalInputTab";
import { TotalOutputTab } from "./components/tabs/TotalOutputTab";
import { TotalScrapTab } from "./components/tabs/TotalScrapTab";
import { TotalUtilTab } from "./components/tabs/TotalUtilTab";
import { WIPStockTab } from "./components/tabs/WIPStockTab";

import {
  useAllDowntimeEvents,
  useAllPresses,
  useOEEData,
  useOrdersByStatus,
  useOverdueDies,
  useProductionMetrics,
  useQualityRecords,
} from "./hooks/useQueries";

import { FilterProvider, useFilter } from "./context/FilterContext";

import {
  MOCK_BACKEND_PRESSES,
  MOCK_DOWNTIME_EVENTS,
  MOCK_OEE_DATA,
  MOCK_ORDERS,
  MOCK_OVERDUE_DIES,
  MOCK_PRODUCTION_DATA,
  MOCK_QUALITY_RECORDS,
  type PressData,
  applyLiveDelta,
  getFilteredMockData,
} from "./mockData";

type Role = "Operator" | "Management" | "CEO";

type ManagementTab =
  | "Dashboard"
  | "Total Input"
  | "Total Output"
  | "Total Scrap"
  | "Recovery"
  | "WIP Stock"
  | "Contact Time"
  | "Delay & Downtime"
  | "PP (Plan/Act)"
  | "Die (Load/Unload)"
  | "Fleet OEE"
  | "Total UTIL"
  | "Energy"
  | "Gas Consumption"
  | "Production"
  | "OEE"
  | "Orders"
  | "Quality";

const MANAGEMENT_TABS: ManagementTab[] = [
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
];

// ─── Inner app (has access to FilterContext) ────────────────────────────────
function AppInner() {
  const { shift, period, date } = useFilter();

  const [role, setRole] = useState<Role>("Management");
  const [activeTab, setActiveTab] = useState<ManagementTab>("Dashboard");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showTotalInputModal, setShowTotalInputModal] = useState(false);
  const [showTotalOutputModal, setShowTotalOutputModal] = useState(false);
  const [showTotalScrapModal, setShowTotalScrapModal] = useState(false);
  const [showTotalRecoveryModal, setShowTotalRecoveryModal] = useState(false);
  const [showTotalWIPModal, setShowTotalWIPModal] = useState(false);
  const [showContactTimeModal, setShowContactTimeModal] = useState(false);
  const [showTotalDelayModal, setShowTotalDelayModal] = useState(false);
  const [showPressKgHModal, setShowPressKgHModal] = useState(false);
  const [showFleetOEEModal, setShowFleetOEEModal] = useState(false);
  const [showTotalUtilModal, setShowTotalUtilModal] = useState(false);
  const [showTotalEnergyModal, setShowTotalEnergyModal] = useState(false);
  const [showTotalBacklogModal, setShowTotalBacklogModal] = useState(false);
  const [showGasModal, setShowGasModal] = useState(false);
  const [downtimePressModal, setDowntimePressModal] = useState<{
    name: string;
    color: string;
  } | null>(null);
  const [wipPressModal, setWIPPressModal] = useState<{
    label: string;
    color: string;
    value: number;
  } | null>(null);
  const [selectedPress, setSelectedPress] = useState<PressData | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derive filtered mock data from current shift/period/date selection
  const filteredData = useMemo(
    () => getFilteredMockData(shift, period, date),
    [shift, period, date],
  );

  // Live-updating press state (reset when filter changes)
  const [presses, setPresses] = useState<PressData[]>(filteredData.presses);
  const [kpis, setKpis] = useState({ ...filteredData.kpis });

  // Reset press/kpi state when filter changes
  useEffect(() => {
    setPresses(filteredData.presses);
    setKpis({ ...filteredData.kpis });
    setLastUpdated(new Date());
  }, [filteredData]);

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
        totalScrap: Math.min(
          10,
          Math.max(0, applyLiveDelta(prev.totalScrap, 0.01)),
        ),
        totalRecovery: Math.min(
          99,
          Math.max(50, applyLiveDelta(prev.totalRecovery, 0.005)),
        ),
        contactTime: Math.min(
          90,
          Math.max(10, applyLiveDelta(prev.contactTime, 0.01)),
        ),
        pressKgH: Math.max(0, applyLiveDelta(prev.pressKgH, 0.02)),
        fleetOEE: Math.min(
          99,
          Math.max(30, applyLiveDelta(prev.fleetOEE, 0.01)),
        ),
        totalUtil: Math.min(
          99,
          Math.max(30, applyLiveDelta(prev.totalUtil, 0.01)),
        ),
        totalEnergy: Math.max(0, applyLiveDelta(prev.totalEnergy, 0.02)),
        totalGas: Math.max(0, applyLiveDelta(prev.totalGas, 0.02)),
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
  const downtimeEventsQuery = useAllDowntimeEvents();
  const ordersQuery = useOrdersByStatus();
  const overdueDiesQuery = useOverdueDies();

  const backendPresses = pressesQuery.data?.length
    ? pressesQuery.data
    : MOCK_BACKEND_PRESSES;
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

  const backendDowntimeEvents = downtimeEventsQuery.data?.length
    ? downtimeEventsQuery.data
    : MOCK_DOWNTIME_EVENTS;
  const backendOrders = ordersQuery.data?.length
    ? ordersQuery.data
    : MOCK_ORDERS;
  const backendOverdueDies = overdueDiesQuery.data?.length
    ? overdueDiesQuery.data
    : MOCK_OVERDUE_DIES;
  const backendProductionData =
    productionMetricsQuery.data &&
    Object.keys(productionMetricsQuery.data).length
      ? productionMetricsQuery.data
      : MOCK_PRODUCTION_DATA;
  const backendOEEData =
    oeeDataQuery.data && Object.keys(oeeDataQuery.data).length
      ? oeeDataQuery.data
      : MOCK_OEE_DATA;
  const backendQualityRecords = qualityRecordsQuery.data?.length
    ? qualityRecordsQuery.data
    : MOCK_QUALITY_RECORDS;

  // Filter badge string
  const filterBadge = `Shift ${shift} · ${period} · ${date}`;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "#ffffff",
        fontFamily: '"Mona Sans", system-ui, sans-serif',
      }}
    >
      {/* Toast notifications */}
      <Toaster theme="light" />

      {/* Top Navigation Bar */}
      <TopNavBar role={role} onRoleChange={setRole} lastUpdated={lastUpdated} />

      {/* KPI Ribbon */}
      <KPIRibbon
        data={kpis}
        onTotalInputClick={() => setShowTotalInputModal(true)}
        onTotalOutputClick={() => setShowTotalOutputModal(true)}
        onTotalScrapClick={() => setShowTotalScrapModal(true)}
        onTotalRecoveryClick={() => setShowTotalRecoveryModal(true)}
        onTotalWIPClick={() => setShowTotalWIPModal(true)}
        onContactTimeClick={() => setShowContactTimeModal(true)}
        onTotalDelayClick={() => setShowTotalDelayModal(true)}
        onPressKgHClick={() => setShowPressKgHModal(true)}
        onFleetOEEClick={() => setShowFleetOEEModal(true)}
        onTotalUtilClick={() => setShowTotalUtilModal(true)}
        onTotalEnergyClick={() => setShowTotalEnergyModal(true)}
        onTotalGasClick={() => setShowGasModal(true)}
      />

      {/* KPI Drilldown Modals */}
      <TotalInputModal
        open={showTotalInputModal}
        onClose={() => setShowTotalInputModal(false)}
        totalInput={kpis.totalInput}
      />
      <TotalOutputModal
        open={showTotalOutputModal}
        onClose={() => setShowTotalOutputModal(false)}
        totalOutput={kpis.totalOutput}
      />
      <TotalScrapModal
        open={showTotalScrapModal}
        onClose={() => setShowTotalScrapModal(false)}
        totalScrap={kpis.totalScrap}
      />
      <TotalRecoveryModal
        open={showTotalRecoveryModal}
        onClose={() => setShowTotalRecoveryModal(false)}
        totalRecovery={kpis.totalRecovery}
      />
      <TotalWIPModal
        open={showTotalWIPModal}
        onClose={() => setShowTotalWIPModal(false)}
        totalWIP={kpis.totalWIP}
      />
      <ContactTimeModal
        open={showContactTimeModal}
        onClose={() => setShowContactTimeModal(false)}
        contactTime={kpis.contactTime}
      />
      <TotalDelayModal
        open={showTotalDelayModal}
        onClose={() => setShowTotalDelayModal(false)}
        totalDelay={kpis.totalDelay}
      />
      <PressKgHModal
        open={showPressKgHModal}
        onClose={() => setShowPressKgHModal(false)}
        pressKgH={kpis.pressKgH}
      />
      <FleetOEEModal
        open={showFleetOEEModal}
        onClose={() => setShowFleetOEEModal(false)}
        fleetOEE={kpis.fleetOEE}
      />
      <TotalUtilModal
        open={showTotalUtilModal}
        onClose={() => setShowTotalUtilModal(false)}
        totalUtil={kpis.totalUtil}
      />
      <TotalEnergyModal
        open={showTotalEnergyModal}
        onClose={() => setShowTotalEnergyModal(false)}
        totalEnergy={kpis.totalEnergy}
      />
      <TotalBacklogModal
        open={showTotalBacklogModal}
        onClose={() => setShowTotalBacklogModal(false)}
        totalBacklog={kpis.totalBacklog ?? 0}
      />
      <GasModal
        open={showGasModal}
        onClose={() => setShowGasModal(false)}
        totalGas={kpis.totalGas}
      />
      <DowntimePressModal
        open={!!downtimePressModal}
        onClose={() => setDowntimePressModal(null)}
        categoryName={downtimePressModal?.name ?? ""}
        categoryColor={downtimePressModal?.color ?? "#ef4444"}
        totalHrs={filteredData.totalDowntimeHrs}
      />
      <WIPAgingPressModal
        open={!!wipPressModal}
        onClose={() => setWIPPressModal(null)}
        bucketLabel={wipPressModal?.label ?? ""}
        bucketColor={wipPressModal?.color ?? "#0891b2"}
        bucketTotalMT={wipPressModal?.value ?? 0}
      />
      <PressDetailModal
        press={selectedPress}
        open={!!selectedPress}
        onClose={() => setSelectedPress(null)}
      />

      {/* Main Content — role-based */}
      {role === "Operator" ? (
        <div className="flex-1 overflow-y-auto">
          <OperatorView presses={presses} />
        </div>
      ) : role === "CEO" ? (
        <div className="flex-1 overflow-y-auto">
          <CEOView
            kpis={filteredData.strategicKPIs}
            fleetOEE={kpis.fleetOEE}
            totalOutput={kpis.totalOutput}
            fleetUtil={kpis.totalUtil}
          />
        </div>
      ) : (
        /* Management View — tabbed dashboard */
        <div
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: "#f8fafc" }}
        >
          {/* Tab Bar */}
          <div
            className="shrink-0 border-b overflow-x-auto"
            style={{
              background: "#ffffff",
              borderColor: "#e2e8f0",
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
                    data-ocid={`nav.${tab.toLowerCase().replace("-", "_")}.tab`}
                    style={{
                      color: isActive ? "#1d4ed8" : "#64748b",
                      background: isActive ? "#eff6ff" : "transparent",
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

          {/* Tab Content — keyed on filter so data resets on filter change */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "Dashboard" && (
              <div key={filterBadge} style={{ background: "#f8fafc" }}>
                {/* Row 1: Charts Row — 3 equal columns */}
                <div
                  className="grid p-1.5 gap-1.5"
                  style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                >
                  <ProductionVsPlanChart productionData={productionChartData} />
                  <OEEQualityChart presses={presses} />
                  <OutputRatesChart presses={presses} />
                </div>

                {/* Row 2: Press Fleet Table — full width */}
                <div className="px-1.5 pb-1.5">
                  <PressFleetTable
                    presses={presses}
                    onPressClick={(p) => setSelectedPress(p)}
                  />
                </div>

                {/* Row 3: Downtime Analysis (55%) | WIP Aging (45%) */}
                <div
                  className="grid gap-1.5 px-1.5 pb-1.5"
                  style={{ gridTemplateColumns: "55fr 45fr" }}
                >
                  <DowntimeAnalysis
                    categories={filteredData.downtimeCategories}
                    totalHrs={filteredData.totalDowntimeHrs}
                    onCategoryClick={(cat) =>
                      setDowntimePressModal({
                        name: cat.name,
                        color: cat.color,
                      })
                    }
                  />
                  <WIPAgingDonut
                    data={filteredData.wipAgingData}
                    onSegmentClick={(seg) =>
                      setWIPPressModal({
                        label: seg.label,
                        color: seg.color,
                        value: seg.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {activeTab === "Production" && (
              <ProductionTab
                key={filterBadge}
                presses={backendPresses}
                productionData={backendProductionData}
                isLoading={
                  pressesQuery.isLoading || productionMetricsQuery.isLoading
                }
                filterBadge={filterBadge}
                mockPresses={presses}
              />
            )}

            {activeTab === "OEE" && (
              <OEETab
                key={filterBadge}
                presses={backendPresses}
                oeeData={backendOEEData}
                downtimeEvents={backendDowntimeEvents}
                isLoading={
                  pressesQuery.isLoading ||
                  oeeDataQuery.isLoading ||
                  downtimeEventsQuery.isLoading
                }
                filterBadge={filterBadge}
                mockPresses={presses}
              />
            )}

            {activeTab === "Orders" && (
              <OrdersTab
                key={filterBadge}
                orders={backendOrders}
                overdueDies={backendOverdueDies}
                isLoading={ordersQuery.isLoading || overdueDiesQuery.isLoading}
                filterBadge={filterBadge}
              />
            )}

            {activeTab === "Total Input" && (
              <TotalInputTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalInput={kpis.totalInput}
              />
            )}

            {activeTab === "Total Output" && (
              <TotalOutputTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalOutput={kpis.totalOutput}
              />
            )}

            {activeTab === "Total Scrap" && (
              <TotalScrapTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalScrap={kpis.totalScrap}
              />
            )}

            {activeTab === "Recovery" && (
              <RecoveryTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalRecovery={kpis.totalRecovery}
              />
            )}

            {activeTab === "WIP Stock" && (
              <WIPStockTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalWIP={kpis.totalWIP}
              />
            )}

            {activeTab === "Contact Time" && (
              <ContactTimeTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                contactTime={kpis.contactTime}
              />
            )}

            {activeTab === "Delay & Downtime" && (
              <DelayDowntimeTab
                key={filterBadge}
                presses={presses}
                backendPresses={backendPresses}
                downtimeEvents={backendDowntimeEvents}
                isLoading={
                  pressesQuery.isLoading || downtimeEventsQuery.isLoading
                }
                filterBadge={filterBadge}
                totalDelay={kpis.totalDelay}
                downtimeCategories={filteredData.downtimeCategories}
                totalDowntimeHrs={filteredData.totalDowntimeHrs}
              />
            )}

            {activeTab === "PP (Plan/Act)" && (
              <PPPlanVsActualTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
              />
            )}

            {activeTab === "Die (Load/Unload)" && (
              <DieLoadUnloadTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
              />
            )}

            {activeTab === "Fleet OEE" && (
              <FleetOEETab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                fleetOEE={kpis.fleetOEE}
              />
            )}

            {activeTab === "Total UTIL" && (
              <TotalUtilTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalUtil={kpis.totalUtil}
              />
            )}

            {activeTab === "Energy" && (
              <EnergyTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalEnergy={kpis.totalEnergy}
              />
            )}

            {activeTab === "Quality" && (
              <QualityTab
                key={filterBadge}
                presses={backendPresses}
                qualityRecords={backendQualityRecords}
                isLoading={
                  pressesQuery.isLoading || qualityRecordsQuery.isLoading
                }
                filterBadge={filterBadge}
                mockPresses={presses}
              />
            )}

            {activeTab === "Gas Consumption" && (
              <GasTab
                key={filterBadge}
                presses={presses}
                filterBadge={filterBadge}
                totalGas={kpis.totalGas}
              />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="border-t border-[#e2e8f0] px-3 py-1.5 flex items-center justify-between shrink-0"
        style={{ background: "#f8fafc" }}
      >
        <div
          className="flex items-center gap-3 text-[9px]"
          style={{ color: "#64748b" }}
        >
          <span>5 PRESSES MONITORED</span>
          <span>·</span>
          <span
            className="font-bold px-1.5 py-0.5 rounded"
            style={{ background: "#fef3c7", color: "#b45309" }}
          >
            SHIFT {shift}
          </span>
          <span>·</span>
          <span
            className="font-bold px-1.5 py-0.5 rounded"
            style={{ background: "#f0fdf4", color: "#15803d" }}
          >
            {period.toUpperCase()}
          </span>
          <span>·</span>
          <span className="font-mono" style={{ color: "#3b82f6" }}>
            LIVE
          </span>
        </div>
        <div className="text-[9px]" style={{ color: "#64748b" }}>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[#334155] transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FilterProvider>
      <AppInner />
    </FilterProvider>
  );
}
