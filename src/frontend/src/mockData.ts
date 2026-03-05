// Mock data for MES Executive Dashboard

import type { Period, Shift } from "./context/FilterContext";

export interface PressData {
  id: string;
  name: string;
  tonnage: number;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  oee: number;
  plan: number;
  actual: number;
  downtime: number;
  scrap: number;
  dieNumber: string;
  alloyGrade: string;
  operator: string;
  shift: string;
  workOrder: string;
  billetTemp: number;
  ramPressure: number;
  extrusionSpeed: number;
  kgPerHour: number;
  dieTarget: number;
  // New Press Fleet Performance fields
  dieKgH: number; // Die Kg/H
  ppPlan: number; // PP Plan (Kg/H) - kept for legacy
  ppAct: number; // PP Actual (Kg/H) - kept for legacy
  ppPlanBillets: number; // Production Plan – planned billet/shot count
  ppActBillets: number; // Production Plan – actual billet/shot count extruded
  dieLoad: number; // Die Load time (min)
  dieUnload: number; // Die Unload time (min)
  contactTime: number; // Contact Time (sec)
  recovery: number; // Recovery %
}

// ─── Deterministic seeded variation ───────────────────────────────────────────
// Each shift/period combo produces a stable multiplier so data is consistent
// but distinct for each combination.

interface ShiftSeed {
  oeeMultiplier: number;
  kgHrMultiplier: number;
  downtimeMultiplier: number;
  scrapMultiplier: number;
  recoveryMultiplier: number;
  tempOffset: number;
  pressureMultiplier: number;
  speedMultiplier: number;
  statuses: Array<"Running" | "Idle" | "Breakdown" | "Setup">;
  operators: string[];
}

const SHIFT_SEEDS: Record<Shift, ShiftSeed> = {
  A: {
    oeeMultiplier: 1.0,
    kgHrMultiplier: 1.0,
    downtimeMultiplier: 1.0,
    scrapMultiplier: 1.0,
    recoveryMultiplier: 1.0,
    tempOffset: 0,
    pressureMultiplier: 1.0,
    speedMultiplier: 1.0,
    statuses: ["Running", "Breakdown", "Running", "Running", "Running"],
    operators: ["Raj Kumar", "Suresh M", "Amit Patel", "Priya S", "Vikas N"],
  },
  B: {
    oeeMultiplier: 0.92,
    kgHrMultiplier: 0.95,
    downtimeMultiplier: 1.25,
    scrapMultiplier: 1.18,
    recoveryMultiplier: 0.97,
    tempOffset: -5,
    pressureMultiplier: 0.98,
    speedMultiplier: 0.94,
    statuses: ["Running", "Setup", "Idle", "Running", "Running"],
    operators: ["Deepak V", "Mohan R", "Sunil K", "Kavya P", "Rajan S"],
  },
  C: {
    oeeMultiplier: 0.85,
    kgHrMultiplier: 0.88,
    downtimeMultiplier: 1.55,
    scrapMultiplier: 1.35,
    recoveryMultiplier: 0.93,
    tempOffset: -12,
    pressureMultiplier: 0.95,
    speedMultiplier: 0.87,
    statuses: ["Running", "Idle", "Breakdown", "Setup", "Running"],
    operators: ["Nikhil A", "Ravi G", "Arun T", "Meena B", "Kiran D"],
  },
};

const PERIOD_MULTIPLIERS: Record<
  Period,
  {
    input: number;
    output: number;
    energy: number;
    fgs: number;
    wip: number;
    backlog: number;
  }
> = {
  Today: { input: 1, output: 1, energy: 1, fgs: 1, wip: 1, backlog: 1 },
  Week: {
    input: 6.8,
    output: 6.5,
    energy: 6.9,
    fgs: 6.2,
    wip: 1.4,
    backlog: 0.95,
  },
  Month: {
    input: 27.5,
    output: 26.8,
    energy: 28.1,
    fgs: 25.4,
    wip: 1.8,
    backlog: 0.9,
  },
};

// ─── Base press data (Shift A baseline) ───────────────────────────────────────

const BASE_PRESSES = [
  {
    id: "P3300",
    name: "Titan",
    tonnage: 3300,
    oee: 88.9,
    plan: 20,
    actual: 2.6,
    downtime: 3,
    scrap: 1.4,
    dieNumber: "2003064",
    alloyGrade: "6063",
    workOrder: "WO-2026-0301",
    billetTemp: 480,
    ramPressure: 285,
    extrusionSpeed: 8.2,
    kgPerHour: 2100,
    dieTarget: 2400,
    dieKgH: 2380,
    ppPlan: 2400,
    ppAct: 2100,
    ppPlanBillets: 120,
    ppActBillets: 104,
    dieLoad: 12,
    dieUnload: 8,
    contactTime: 42,
    recovery: 91.5,
  },
  {
    id: "P2500",
    name: "Atlas",
    tonnage: 2500,
    oee: 51.0,
    plan: 20,
    actual: 0.3,
    downtime: 180,
    scrap: 2.3,
    dieNumber: "2001005",
    alloyGrade: "6082",
    workOrder: "WO-2026-0302",
    billetTemp: 0,
    ramPressure: 0,
    extrusionSpeed: 0,
    kgPerHour: 800,
    dieTarget: 2000,
    dieKgH: 0,
    ppPlan: 2000,
    ppAct: 800,
    ppPlanBillets: 100,
    ppActBillets: 14,
    dieLoad: 0,
    dieUnload: 0,
    contactTime: 0,
    recovery: 68.2,
  },
  {
    id: "P1800",
    name: "Vulcan",
    tonnage: 1800,
    oee: 80.9,
    plan: 20,
    actual: 2.4,
    downtime: 3,
    scrap: 1.6,
    dieNumber: "2002010",
    alloyGrade: "7075",
    workOrder: "WO-2026-0303",
    billetTemp: 475,
    ramPressure: 260,
    extrusionSpeed: 7.8,
    kgPerHour: 1900,
    dieTarget: 2200,
    dieKgH: 2140,
    ppPlan: 2200,
    ppAct: 1900,
    ppPlanBillets: 110,
    ppActBillets: 92,
    dieLoad: 14,
    dieUnload: 10,
    contactTime: 38,
    recovery: 88.7,
  },
  {
    id: "P1460",
    name: "Hermes",
    tonnage: 1460,
    oee: 85.6,
    plan: 20,
    actual: 2.3,
    downtime: 3,
    scrap: 1.5,
    dieNumber: "2004056",
    alloyGrade: "6061",
    workOrder: "WO-2026-0304",
    billetTemp: 470,
    ramPressure: 240,
    extrusionSpeed: 7.1,
    kgPerHour: 1600,
    dieTarget: 1800,
    dieKgH: 1760,
    ppPlan: 1800,
    ppAct: 1600,
    ppPlanBillets: 95,
    ppActBillets: 84,
    dieLoad: 11,
    dieUnload: 7,
    contactTime: 35,
    recovery: 90.1,
  },
  {
    id: "P1100",
    name: "Swift",
    tonnage: 1100,
    oee: 94.2,
    plan: 20,
    actual: 2.8,
    downtime: 3,
    scrap: 1.3,
    dieNumber: "2000061",
    alloyGrade: "6063",
    workOrder: "WO-2026-0305",
    billetTemp: 465,
    ramPressure: 210,
    extrusionSpeed: 9.5,
    kgPerHour: 2500,
    dieTarget: 2600,
    dieKgH: 2560,
    ppPlan: 2600,
    ppAct: 2500,
    ppPlanBillets: 130,
    ppActBillets: 126,
    dieLoad: 9,
    dieUnload: 6,
    contactTime: 30,
    recovery: 94.8,
  },
];

// ─── Work orders per shift ─────────────────────────────────────────────────────
const WORK_ORDERS: Record<Shift, string[]> = {
  A: [
    "WO-2026-0301",
    "WO-2026-0302",
    "WO-2026-0303",
    "WO-2026-0304",
    "WO-2026-0305",
  ],
  B: [
    "WO-2026-0311",
    "WO-2026-0312",
    "WO-2026-0313",
    "WO-2026-0314",
    "WO-2026-0315",
  ],
  C: [
    "WO-2026-0321",
    "WO-2026-0322",
    "WO-2026-0323",
    "WO-2026-0324",
    "WO-2026-0325",
  ],
};

// ─── Main filtered data generator ─────────────────────────────────────────────

export function getFilteredMockData(
  shift: Shift,
  period: Period,
  _date: string,
) {
  const seed = SHIFT_SEEDS[shift];
  const pm = PERIOD_MULTIPLIERS[period];

  const presses: PressData[] = BASE_PRESSES.map((base, idx) => {
    const status = seed.statuses[idx];
    const isDown = status === "Breakdown" || status === "Idle";

    const oee = Math.min(99, Math.max(15, base.oee * seed.oeeMultiplier));
    const kgHr = isDown
      ? status === "Idle"
        ? base.kgPerHour * 0.2
        : 0
      : base.kgPerHour * seed.kgHrMultiplier;
    const downtime =
      base.downtime * seed.downtimeMultiplier * (isDown ? 3.5 : 1);
    const scrap = base.scrap * seed.scrapMultiplier;
    const recovery = Math.min(99, base.recovery * seed.recoveryMultiplier);
    const billetTemp = isDown
      ? 0
      : Math.max(0, base.billetTemp + seed.tempOffset);
    const ramPressure = isDown
      ? 0
      : Math.max(0, base.ramPressure * seed.pressureMultiplier);
    const extSpeed = isDown
      ? 0
      : Math.max(0, base.extrusionSpeed * seed.speedMultiplier);
    const ppAct = isDown ? base.ppAct * 0.15 : base.ppAct * seed.kgHrMultiplier;
    const dieKgH = isDown ? 0 : base.dieKgH * seed.kgHrMultiplier;
    // Production plan billet/shot counts — scale actual by OEE, keep plan fixed
    const ppPlanBillets = base.ppPlanBillets; // plan stays fixed
    const ppActBillets = isDown
      ? Math.round(base.ppPlanBillets * 0.12)
      : Math.round(base.ppActBillets * seed.oeeMultiplier);
    // Period scaling for "actual" output column
    const actualMT = base.actual * seed.oeeMultiplier * pm.output;

    return {
      ...base,
      status,
      shift,
      operator: seed.operators[idx],
      workOrder: WORK_ORDERS[shift][idx],
      oee,
      actual: Number.parseFloat(actualMT.toFixed(2)),
      downtime: Number.parseFloat(downtime.toFixed(1)),
      scrap: Number.parseFloat(scrap.toFixed(2)),
      recovery: Number.parseFloat(recovery.toFixed(1)),
      kgPerHour: Number.parseFloat(kgHr.toFixed(0)),
      billetTemp: Number.parseFloat(billetTemp.toFixed(0)),
      ramPressure: Number.parseFloat(ramPressure.toFixed(0)),
      extrusionSpeed: Number.parseFloat(extSpeed.toFixed(1)),
      ppAct: Number.parseFloat(ppAct.toFixed(0)),
      dieKgH: Number.parseFloat(dieKgH.toFixed(0)),
      ppPlanBillets,
      ppActBillets,
    };
  });

  // KPI ribbon values
  const avgContactTime = Number.parseFloat(
    (
      presses
        .filter((p) => p.status === "Running")
        .reduce((sum, p) => sum + p.contactTime, 0) /
      Math.max(1, presses.filter((p) => p.status === "Running").length)
    ).toFixed(1),
  );
  const avgPressKgH = Number.parseFloat(
    (presses.reduce((sum, p) => sum + p.kgPerHour, 0) / presses.length).toFixed(
      0,
    ),
  );
  const avgRecovery = Number.parseFloat(
    (presses.reduce((sum, p) => sum + p.recovery, 0) / presses.length).toFixed(
      1,
    ),
  );

  const kpis = {
    totalInput: Number.parseFloat(
      (10.6 * seed.kgHrMultiplier * pm.input).toFixed(2),
    ),
    totalOutput: Number.parseFloat(
      (10.4 * seed.oeeMultiplier * pm.output).toFixed(2),
    ),
    totalScrap: Number.parseFloat((1.6 * seed.scrapMultiplier).toFixed(2)),
    totalRecovery: avgRecovery,
    totalFGS: Number.parseFloat(
      (450.0 * seed.oeeMultiplier * pm.fgs).toFixed(2),
    ),
    totalWIP: Number.parseFloat((125.0 * pm.wip).toFixed(2)),
    contactTime: avgContactTime,
    totalDelay: Number.parseFloat((334 * seed.downtimeMultiplier).toFixed(0)),
    pressKgH: avgPressKgH,
    fleetOEE: Number.parseFloat((80.1 * seed.oeeMultiplier).toFixed(1)),
    totalUtil: Number.parseFloat((85.2 * seed.oeeMultiplier).toFixed(1)),
    totalEnergy: Number.parseFloat(
      (275 * seed.kgHrMultiplier * pm.energy).toFixed(2),
    ),
    totalBacklog: Number.parseFloat((3500 * pm.backlog).toFixed(0)),
  };

  // Downtime categories — scaled by shift downtime multiplier
  const dtMul = seed.downtimeMultiplier;
  const downtimeCategories = [
    {
      name: "Die Change",
      percentage: Number.parseFloat(
        (25.3 * (shift === "B" ? 1.1 : shift === "C" ? 0.9 : 1)).toFixed(1),
      ),
      color: "#3b82f6",
    },
    {
      name: "PP Break",
      percentage: Number.parseFloat(
        (21.3 * (shift === "B" ? 1.2 : shift === "C" ? 1.4 : 1)).toFixed(1),
      ),
      color: "#ef4444",
    },
    {
      name: "Die Failure",
      percentage: Number.parseFloat(
        (12.4 * (shift === "C" ? 1.3 : 1)).toFixed(1),
      ),
      color: "#f97316",
    },
    {
      name: "Maintenance",
      percentage: Number.parseFloat((11.2 * dtMul * 0.8).toFixed(1)),
      color: "#14b8a6",
    },
    {
      name: "Die Mgmt",
      percentage: Number.parseFloat((8.4 * dtMul * 0.9).toFixed(1)),
      color: "#8b5cf6",
    },
    {
      name: "Prev Maint",
      percentage: Number.parseFloat(
        (6.7 * (shift === "B" ? 0.8 : shift === "C" ? 1.2 : 1)).toFixed(1),
      ),
      color: "#06b6d4",
    },
    {
      name: "No Planning",
      percentage: Number.parseFloat((5.6 * dtMul).toFixed(1)),
      color: "#f59e0b",
    },
    {
      name: "Power Out",
      percentage: Number.parseFloat(
        (4.5 * (shift === "C" ? 1.8 : 1)).toFixed(1),
      ),
      color: "#ec4899",
    },
    {
      name: "IT Down",
      percentage: Number.parseFloat((2.8 * dtMul * 0.7).toFixed(1)),
      color: "#64748b",
    },
    {
      name: "Proj & Dev",
      percentage: Number.parseFloat((1.7 * dtMul * 0.6).toFixed(1)),
      color: "#84cc16",
    },
  ];

  // Top dies — total kg varies by period
  const topDies = [
    {
      rank: 1,
      dieNo: "2003064",
      totalKg: Math.round(1096 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 2,
      dieNo: "2001005",
      totalKg: Math.round(1095 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 3,
      dieNo: "2002010",
      totalKg: Math.round(1095 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 4,
      dieNo: "2004056",
      totalKg: Math.round(1095 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 5,
      dieNo: "2000061",
      totalKg: Math.round(1093 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 6,
      dieNo: "2001057",
      totalKg: Math.round(1093 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 7,
      dieNo: "2003089",
      totalKg: Math.round(1092 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 8,
      dieNo: "2002234",
      totalKg: Math.round(1091 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 9,
      dieNo: "2001178",
      totalKg: Math.round(1090 * pm.output * seed.kgHrMultiplier),
    },
    {
      rank: 10,
      dieNo: "2004001",
      totalKg: Math.round(1089 * pm.output * seed.kgHrMultiplier),
    },
  ];

  // Top alloys — total kg varies by period
  const alloyMul = pm.output * seed.kgHrMultiplier;
  const topAlloys = [
    { rank: 1, alloy: "7075", totalKg: Math.round(50168 * alloyMul) },
    { rank: 2, alloy: "6063", totalKg: Math.round(47347 * alloyMul) },
    { rank: 3, alloy: "E91E", totalKg: Math.round(43324 * alloyMul) },
    { rank: 4, alloy: "6082", totalKg: Math.round(41104 * alloyMul) },
    { rank: 5, alloy: "19501", totalKg: Math.round(40015 * alloyMul) },
    { rank: 6, alloy: "6005A", totalKg: Math.round(39274 * alloyMul) },
    { rank: 7, alloy: "6061", totalKg: Math.round(37890 * alloyMul) },
    { rank: 8, alloy: "2024", totalKg: Math.round(35621 * alloyMul) },
    { rank: 9, alloy: "6463", totalKg: Math.round(33890 * alloyMul) },
    { rank: 10, alloy: "6060", totalKg: Math.round(31245 * alloyMul) },
  ];

  // WIP aging — worse at night shifts
  const wipBase = period === "Month" ? 1.8 : period === "Week" ? 1.35 : 1;
  const wipAgingData = [
    {
      label: "< 24 HR",
      value: Number.parseFloat(
        (65.0 * wipBase * seed.recoveryMultiplier).toFixed(1),
      ),
      color: "#22c55e",
    },
    {
      label: "24-72 HR",
      value: Number.parseFloat(
        (41.3 * wipBase * (shift === "C" ? 1.2 : 1)).toFixed(1),
      ),
      color: "#f59e0b",
    },
    {
      label: "> 72 HR",
      value: Number.parseFloat(
        (
          18.8 *
          wipBase *
          (shift === "C" ? 1.5 : shift === "B" ? 1.1 : 1)
        ).toFixed(1),
      ),
      color: "#ef4444",
    },
  ];

  // Strategic KPIs — vary by shift/period
  const prodActual = Math.round(
    108 *
      seed.oeeMultiplier *
      (period === "Month" ? 28 : period === "Week" ? 7 : 1),
  );
  const prodTarget = Math.round(
    120 * (period === "Month" ? 28 : period === "Week" ? 7 : 1),
  );
  const oeeActual = Number.parseFloat((78 * seed.oeeMultiplier).toFixed(1));
  const rejActual = Number.parseFloat((1.6 * seed.scrapMultiplier).toFixed(1));
  const otdActual = Number.parseFloat(
    (91 * seed.recoveryMultiplier).toFixed(0),
  );

  const strategicKPIs = [
    {
      kpi:
        period === "Today"
          ? "Daily Production"
          : period === "Week"
            ? "Weekly Production"
            : "Monthly Production",
      target: `${prodTarget} MT`,
      actual: `${prodActual} MT`,
      status: (prodActual / prodTarget >= 0.95
        ? "green"
        : prodActual / prodTarget >= 0.85
          ? "yellow"
          : "red") as "green" | "yellow" | "red",
    },
    {
      kpi: "OEE",
      target: "85%",
      actual: `${oeeActual}%`,
      status: (oeeActual >= 85
        ? "green"
        : oeeActual >= 75
          ? "yellow"
          : "red") as "green" | "yellow" | "red",
    },
    {
      kpi: "Rejection",
      target: "<2%",
      actual: `${rejActual}%`,
      status: (rejActual < 2 ? "green" : rejActual < 2.5 ? "yellow" : "red") as
        | "green"
        | "yellow"
        | "red",
    },
    {
      kpi: "On-Time Delivery",
      target: "95%",
      actual: `${otdActual}%`,
      status: (Number(otdActual) >= 95
        ? "green"
        : Number(otdActual) >= 90
          ? "yellow"
          : "red") as "green" | "yellow" | "red",
    },
    {
      kpi: "Energy per MT",
      target: "28 kWh",
      actual: `${Number.parseFloat((26 * seed.kgHrMultiplier).toFixed(1))} kWh`,
      status: "green" as const,
    },
    {
      kpi: "Revenue/Press/Day",
      target: "$18,000",
      actual: `$${Math.round(15400 * seed.oeeMultiplier).toLocaleString()}`,
      status: (seed.oeeMultiplier >= 0.95
        ? "green"
        : seed.oeeMultiplier >= 0.9
          ? "yellow"
          : "red") as "green" | "yellow" | "red",
    },
  ];

  const totalDowntimeHrs = Number.parseFloat(
    (17.8 * seed.downtimeMultiplier).toFixed(1),
  );

  return {
    presses,
    kpis,
    downtimeCategories,
    topDies,
    topAlloys,
    wipAgingData,
    strategicKPIs,
    totalDowntimeHrs,
  };
}

// ─── Static initial data (Shift A / Today) ────────────────────────────────────

const _initial = getFilteredMockData("A", "Today", "");

export const initialPresses: PressData[] = _initial.presses;
export const kpiData = _initial.kpis;
export const downtimeCategories = _initial.downtimeCategories;
export const topDies = _initial.topDies;
export const topAlloys = _initial.topAlloys;
export const wipAgingData = _initial.wipAgingData;
export const strategicKPIs = _initial.strategicKPIs;

export const oeeQualityData = [
  { press: "P3300 (Titan)", oee: 88.9, quality: 95.2 },
  { press: "P2500 (Atlas)", oee: 51.0, quality: 72.1 },
  { press: "P1800 (Vulcan)", oee: 80.9, quality: 91.5 },
  { press: "P1460 (Hermes)", oee: 85.6, quality: 93.8 },
  { press: "P1100 (Swift)", oee: 94.2, quality: 97.1 },
];

export const outputRatesData = [
  { press: "P3300 (Titan)", dieTarget: 2400, pressActual: 2100 },
  { press: "P2500 (Atlas)", dieTarget: 2000, pressActual: 800 },
  { press: "P1800 (Vulcan)", dieTarget: 2200, pressActual: 1900 },
  { press: "P1460 (Hermes)", dieTarget: 1800, pressActual: 1600 },
  { press: "P1100 (Swift)", dieTarget: 2600, pressActual: 2500 },
];

export function applyLiveDelta(value: number, deltaPercent = 0.03): number {
  const delta = value * deltaPercent * (Math.random() * 2 - 1);
  return Math.max(0, value + delta);
}
