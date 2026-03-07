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
  dieLoadCount: number; // Number of dies loaded
  dieUnloadCount: number; // Number of dies unloaded
  contactTime: number; // Contact Time (sec)
  recovery: number; // Recovery %
  inputMt: number; // Input in Metric Tonnes
  outputMt: number; // Output in Metric Tonnes
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
  All: {
    oeeMultiplier: 0.96,
    kgHrMultiplier: 0.96,
    downtimeMultiplier: 1.27,
    scrapMultiplier: 1.18,
    recoveryMultiplier: 0.97,
    tempOffset: -6,
    pressureMultiplier: 0.98,
    speedMultiplier: 0.94,
    statuses: ["Running", "Running", "Running", "Running", "Running"],
    operators: ["Raj Kumar", "Deepak V", "Nikhil A", "Kavya P", "Vikas N"],
  },
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
    wip: number;
    backlog: number;
  }
> = {
  Today: { input: 1, output: 1, energy: 1, wip: 1, backlog: 1 },
  Week: {
    input: 6.8,
    output: 6.5,
    energy: 6.9,
    wip: 1.4,
    backlog: 0.95,
  },
  Month: {
    input: 27.5,
    output: 26.8,
    energy: 28.1,
    wip: 1.8,
    backlog: 0.9,
  },
};

// ─── Base press data (Shift A baseline) ───────────────────────────────────────

const BASE_PRESSES = [
  {
    id: "P3300",
    name: "P3300",
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
    dieLoadCount: 3,
    dieUnloadCount: 3,
    contactTime: 42,
    recovery: 91.5,
    inputMt: 42.6,
    outputMt: 38.9,
  },
  {
    id: "P2500",
    name: "P2500",
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
    dieLoadCount: 1,
    dieUnloadCount: 2,
    contactTime: 0,
    recovery: 68.2,
    inputMt: 16.0,
    outputMt: 10.9,
  },
  {
    id: "P1800",
    name: "P1800",
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
    dieLoadCount: 2,
    dieUnloadCount: 2,
    contactTime: 38,
    recovery: 88.7,
    inputMt: 38.0,
    outputMt: 33.7,
  },
  {
    id: "P1460",
    name: "P1460",
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
    dieLoadCount: 2,
    dieUnloadCount: 2,
    contactTime: 35,
    recovery: 90.1,
    inputMt: 32.0,
    outputMt: 28.8,
  },
  {
    id: "P1100",
    name: "P1100",
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
    dieLoadCount: 4,
    dieUnloadCount: 4,
    contactTime: 30,
    recovery: 94.8,
    inputMt: 50.0,
    outputMt: 47.4,
  },
];

// ─── Work orders per shift ─────────────────────────────────────────────────────
const WORK_ORDERS: Record<Shift, string[]> = {
  All: [
    "WO-2026-0301",
    "WO-2026-0311",
    "WO-2026-0321",
    "WO-2026-0302",
    "WO-2026-0312",
  ],
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

    const inputMt = Number.parseFloat(
      (base.inputMt * seed.kgHrMultiplier * pm.input).toFixed(2),
    );
    const outputMt = Number.parseFloat(
      (base.outputMt * seed.oeeMultiplier * pm.output).toFixed(2),
    );

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
      inputMt,
      outputMt,
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
    totalGas: Number.parseFloat(
      (18400 * seed.kgHrMultiplier * pm.energy).toFixed(2),
    ),
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
  { press: "P3300", oee: 88.9, quality: 95.2 },
  { press: "P2500", oee: 51.0, quality: 72.1 },
  { press: "P1800", oee: 80.9, quality: 91.5 },
  { press: "P1460", oee: 85.6, quality: 93.8 },
  { press: "P1100", oee: 94.2, quality: 97.1 },
];

export const outputRatesData = [
  { press: "P3300", dieTarget: 2400, pressActual: 2100 },
  { press: "P2500", dieTarget: 2000, pressActual: 800 },
  { press: "P1800", dieTarget: 2200, pressActual: 1900 },
  { press: "P1460", dieTarget: 1800, pressActual: 1600 },
  { press: "P1100", dieTarget: 2600, pressActual: 2500 },
];

export function applyLiveDelta(value: number, deltaPercent = 0.03): number {
  const delta = value * deltaPercent * (Math.random() * 2 - 1);
  return Math.max(0, value + delta);
}

// ─── Backend-typed mock data (used as fallbacks when canister is empty) ────────

import {
  type DieMaintenance,
  DowntimeCategory,
  type DowntimeEvent,
  type OEEData,
  type Order,
  OrderStatus,
  type Press,
  PressStatus,
  type ProductionMetrics,
  type QualityRecord,
} from "./backend.d";

// ─── Mock backend presses ─────────────────────────────────────────────────────
export const MOCK_BACKEND_PRESSES: Press[] = [
  {
    id: "P3300",
    name: "P3300",
    status: PressStatus.running,
    activeDie: "2003064",
    operatorName: "Raj Kumar",
    shift: "A",
    currentOrder: "WO-2026-0301",
    alloyGrade: "6063",
    plant: "Plant-1",
  },
  {
    id: "P2500",
    name: "P2500",
    status: PressStatus.breakdown,
    activeDie: "2001005",
    operatorName: "Suresh M",
    shift: "A",
    currentOrder: "WO-2026-0302",
    alloyGrade: "6082",
    plant: "Plant-1",
  },
  {
    id: "P1800",
    name: "P1800",
    status: PressStatus.running,
    activeDie: "2002010",
    operatorName: "Amit Patel",
    shift: "A",
    currentOrder: "WO-2026-0303",
    alloyGrade: "7075",
    plant: "Plant-1",
  },
  {
    id: "P1460",
    name: "P1460",
    status: PressStatus.running,
    activeDie: "2004056",
    operatorName: "Priya S",
    shift: "A",
    currentOrder: "WO-2026-0304",
    alloyGrade: "6061",
    plant: "Plant-1",
  },
  {
    id: "P1100",
    name: "P1100",
    status: PressStatus.running,
    activeDie: "2000061",
    operatorName: "Vikas N",
    shift: "A",
    currentOrder: "WO-2026-0305",
    alloyGrade: "6063",
    plant: "Plant-1",
  },
];

const NOW = BigInt(Date.now()) * BigInt(1_000_000); // nanoseconds

// ─── Mock production metrics ──────────────────────────────────────────────────
export const MOCK_PRODUCTION_DATA: Record<string, ProductionMetrics[]> = {
  P3300: [
    {
      pressId: "P3300",
      timestamp: NOW,
      totalProductionMT: 2.6,
      dailyProductionMT: 2.6,
      dailyTargetMT: 3.0,
      shiftProductionA: 2.6,
      shiftProductionB: 2.4,
      shiftProductionC: 2.1,
      pressKgPerHour: 2100,
      billetCount: BigInt(104),
      cycleTimePerBillet: 38,
      extrusionSpeed: 8.2,
      pullerSpeed: 7.9,
      sawCycleTime: 16,
      containerChangeTime: 11,
      recoveryPct: 91.5,
    },
  ],
  P2500: [
    {
      pressId: "P2500",
      timestamp: NOW,
      totalProductionMT: 0.3,
      dailyProductionMT: 0.3,
      dailyTargetMT: 2.5,
      shiftProductionA: 0.3,
      shiftProductionB: 0.0,
      shiftProductionC: 0.0,
      pressKgPerHour: 800,
      billetCount: BigInt(14),
      cycleTimePerBillet: 0,
      extrusionSpeed: 0,
      pullerSpeed: 0,
      sawCycleTime: 0,
      containerChangeTime: 0,
      recoveryPct: 68.2,
    },
  ],
  P1800: [
    {
      pressId: "P1800",
      timestamp: NOW,
      totalProductionMT: 2.4,
      dailyProductionMT: 2.4,
      dailyTargetMT: 2.75,
      shiftProductionA: 2.4,
      shiftProductionB: 2.2,
      shiftProductionC: 1.9,
      pressKgPerHour: 1900,
      billetCount: BigInt(92),
      cycleTimePerBillet: 41,
      extrusionSpeed: 7.8,
      pullerSpeed: 7.5,
      sawCycleTime: 18,
      containerChangeTime: 12,
      recoveryPct: 88.7,
    },
  ],
  P1460: [
    {
      pressId: "P1460",
      timestamp: NOW,
      totalProductionMT: 2.3,
      dailyProductionMT: 2.3,
      dailyTargetMT: 2.5,
      shiftProductionA: 2.3,
      shiftProductionB: 2.1,
      shiftProductionC: 1.8,
      pressKgPerHour: 1600,
      billetCount: BigInt(84),
      cycleTimePerBillet: 35,
      extrusionSpeed: 7.1,
      pullerSpeed: 6.8,
      sawCycleTime: 15,
      containerChangeTime: 10,
      recoveryPct: 90.1,
    },
  ],
  P1100: [
    {
      pressId: "P1100",
      timestamp: NOW,
      totalProductionMT: 2.8,
      dailyProductionMT: 2.8,
      dailyTargetMT: 2.9,
      shiftProductionA: 2.8,
      shiftProductionB: 2.6,
      shiftProductionC: 2.3,
      pressKgPerHour: 2500,
      billetCount: BigInt(126),
      cycleTimePerBillet: 30,
      extrusionSpeed: 9.5,
      pullerSpeed: 9.1,
      sawCycleTime: 14,
      containerChangeTime: 9,
      recoveryPct: 94.8,
    },
  ],
};

// ─── Mock OEE data ────────────────────────────────────────────────────────────
export const MOCK_OEE_DATA: Record<string, OEEData[]> = {
  P3300: [
    {
      pressId: "P3300",
      timestamp: NOW,
      oeePct: 88.9,
      availabilityPct: 94.2,
      performancePct: 96.1,
      qualityPct: 98.1,
      plannedRunTime: 480,
      actualRunTime: 452,
      breakdownTime: 28,
      setupTime: 18,
      dieChangeTime: 14,
      idleTime: 8,
      actualSpeed: 8.2,
      standardSpeed: 8.5,
      pressEfficiencyPct: 96.5,
      outputVsRatedCapacityPct: 87.5,
      rejectionPct: 1.4,
      reworkPct: 0.5,
      firstPassYieldPct: 98.1,
      scrapKg: 36.4,
    },
  ],
  P2500: [
    {
      pressId: "P2500",
      timestamp: NOW,
      oeePct: 51.0,
      availabilityPct: 56.2,
      performancePct: 92.3,
      qualityPct: 98.3,
      plannedRunTime: 480,
      actualRunTime: 270,
      breakdownTime: 180,
      setupTime: 45,
      dieChangeTime: 30,
      idleTime: 135,
      actualSpeed: 6.1,
      standardSpeed: 7.5,
      pressEfficiencyPct: 81.3,
      outputVsRatedCapacityPct: 40.0,
      rejectionPct: 2.3,
      reworkPct: 1.1,
      firstPassYieldPct: 96.6,
      scrapKg: 6.9,
    },
  ],
  P1800: [
    {
      pressId: "P1800",
      timestamp: NOW,
      oeePct: 80.9,
      availabilityPct: 89.2,
      performancePct: 92.4,
      qualityPct: 98.0,
      plannedRunTime: 480,
      actualRunTime: 428,
      breakdownTime: 38,
      setupTime: 22,
      dieChangeTime: 18,
      idleTime: 14,
      actualSpeed: 7.8,
      standardSpeed: 8.4,
      pressEfficiencyPct: 92.9,
      outputVsRatedCapacityPct: 86.4,
      rejectionPct: 1.6,
      reworkPct: 0.6,
      firstPassYieldPct: 97.8,
      scrapKg: 38.4,
    },
  ],
  P1460: [
    {
      pressId: "P1460",
      timestamp: NOW,
      oeePct: 85.6,
      availabilityPct: 91.5,
      performancePct: 94.8,
      qualityPct: 98.7,
      plannedRunTime: 480,
      actualRunTime: 439,
      breakdownTime: 22,
      setupTime: 14,
      dieChangeTime: 12,
      idleTime: 5,
      actualSpeed: 7.1,
      standardSpeed: 7.5,
      pressEfficiencyPct: 94.7,
      outputVsRatedCapacityPct: 88.9,
      rejectionPct: 1.5,
      reworkPct: 0.4,
      firstPassYieldPct: 98.1,
      scrapKg: 34.5,
    },
  ],
  P1100: [
    {
      pressId: "P1100",
      timestamp: NOW,
      oeePct: 94.2,
      availabilityPct: 96.8,
      performancePct: 97.8,
      qualityPct: 99.4,
      plannedRunTime: 480,
      actualRunTime: 465,
      breakdownTime: 8,
      setupTime: 7,
      dieChangeTime: 6,
      idleTime: 0,
      actualSpeed: 9.5,
      standardSpeed: 9.7,
      pressEfficiencyPct: 97.9,
      outputVsRatedCapacityPct: 96.2,
      rejectionPct: 1.3,
      reworkPct: 0.3,
      firstPassYieldPct: 98.4,
      scrapKg: 36.4,
    },
  ],
};

// ─── Mock downtime events ─────────────────────────────────────────────────────
export const MOCK_DOWNTIME_EVENTS: DowntimeEvent[] = [
  {
    id: "DT-001",
    pressId: "P2500",
    category: DowntimeCategory.mechanicalFailure,
    durationMinutes: BigInt(180),
    timestamp: NOW - BigInt(3_600_000_000_000),
    mtbfHours: 48.2,
    mttrHours: 3.0,
  },
  {
    id: "DT-002",
    pressId: "P3300",
    category: DowntimeCategory.dieFailure,
    durationMinutes: BigInt(28),
    timestamp: NOW - BigInt(7_200_000_000_000),
    mtbfHours: 72.5,
    mttrHours: 0.5,
  },
  {
    id: "DT-003",
    pressId: "P1800",
    category: DowntimeCategory.operatorDelay,
    durationMinutes: BigInt(22),
    timestamp: NOW - BigInt(10_800_000_000_000),
    mtbfHours: 60.1,
    mttrHours: 0.4,
  },
  {
    id: "DT-004",
    pressId: "P1460",
    category: DowntimeCategory.dieFailure,
    durationMinutes: BigInt(18),
    timestamp: NOW - BigInt(14_400_000_000_000),
    mtbfHours: 84.3,
    mttrHours: 0.3,
  },
  {
    id: "DT-005",
    pressId: "P1100",
    category: DowntimeCategory.billetQuality,
    durationMinutes: BigInt(12),
    timestamp: NOW - BigInt(18_000_000_000_000),
    mtbfHours: 96.0,
    mttrHours: 0.2,
  },
  {
    id: "DT-006",
    pressId: "P3300",
    category: DowntimeCategory.powerFailure,
    durationMinutes: BigInt(15),
    timestamp: NOW - BigInt(21_600_000_000_000),
    mtbfHours: 36.8,
    mttrHours: 0.25,
  },
  {
    id: "DT-007",
    pressId: "P2500",
    category: DowntimeCategory.mechanicalFailure,
    durationMinutes: BigInt(95),
    timestamp: NOW - BigInt(86_400_000_000_000),
    mtbfHours: 52.1,
    mttrHours: 1.6,
  },
  {
    id: "DT-008",
    pressId: "P1800",
    category: DowntimeCategory.dieFailure,
    durationMinutes: BigInt(35),
    timestamp: NOW - BigInt(90_000_000_000_000),
    mtbfHours: 65.4,
    mttrHours: 0.6,
  },
  {
    id: "DT-009",
    pressId: "P1460",
    category: DowntimeCategory.operatorDelay,
    durationMinutes: BigInt(20),
    timestamp: NOW - BigInt(93_600_000_000_000),
    mtbfHours: 78.2,
    mttrHours: 0.33,
  },
  {
    id: "DT-010",
    pressId: "P3300",
    category: DowntimeCategory.billetQuality,
    durationMinutes: BigInt(10),
    timestamp: NOW - BigInt(97_200_000_000_000),
    mtbfHours: 120.5,
    mttrHours: 0.17,
  },
  {
    id: "DT-011",
    pressId: "P1100",
    category: DowntimeCategory.dieFailure,
    durationMinutes: BigInt(8),
    timestamp: NOW - BigInt(172_800_000_000_000),
    mtbfHours: 144.0,
    mttrHours: 0.13,
  },
  {
    id: "DT-012",
    pressId: "P2500",
    category: DowntimeCategory.powerFailure,
    durationMinutes: BigInt(45),
    timestamp: NOW - BigInt(176_400_000_000_000),
    mtbfHours: 40.0,
    mttrHours: 0.75,
  },
];

// ─── Mock orders ──────────────────────────────────────────────────────────────
const DAY = BigInt(86_400_000_000_000);
export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    workOrderNo: "WO-2026-0301",
    customerName: "AeroTech India",
    alloyGrade: "6063",
    dieNo: "2003064",
    totalMT: 12.5,
    completedMT: 10.2,
    status: OrderStatus.inProgress,
    dueDate: NOW + DAY * BigInt(2),
    plantId: "Plant-1",
  },
  {
    id: "ORD-002",
    workOrderNo: "WO-2026-0302",
    customerName: "BuildCraft Ltd",
    alloyGrade: "6082",
    dieNo: "2001005",
    totalMT: 8.0,
    completedMT: 0.3,
    status: OrderStatus.delayed,
    dueDate: NOW - DAY * BigInt(1),
    plantId: "Plant-1",
  },
  {
    id: "ORD-003",
    workOrderNo: "WO-2026-0303",
    customerName: "AutoFrame Co",
    alloyGrade: "7075",
    dieNo: "2002010",
    totalMT: 15.0,
    completedMT: 14.8,
    status: OrderStatus.inProgress,
    dueDate: NOW + DAY * BigInt(1),
    plantId: "Plant-1",
  },
  {
    id: "ORD-004",
    workOrderNo: "WO-2026-0304",
    customerName: "RailComponents",
    alloyGrade: "6061",
    dieNo: "2004056",
    totalMT: 9.5,
    completedMT: 8.1,
    status: OrderStatus.inProgress,
    dueDate: NOW + DAY * BigInt(3),
    plantId: "Plant-1",
  },
  {
    id: "ORD-005",
    workOrderNo: "WO-2026-0305",
    customerName: "SpeedExtrusions",
    alloyGrade: "6063",
    dieNo: "2000061",
    totalMT: 11.0,
    completedMT: 11.0,
    status: OrderStatus.completed,
    dueDate: NOW - DAY * BigInt(1),
    plantId: "Plant-1",
  },
  {
    id: "ORD-006",
    workOrderNo: "WO-2026-0311",
    customerName: "StructurePlus",
    alloyGrade: "6082",
    dieNo: "2001057",
    totalMT: 7.5,
    completedMT: 7.5,
    status: OrderStatus.completed,
    dueDate: NOW - DAY * BigInt(2),
    plantId: "Plant-1",
  },
  {
    id: "ORD-007",
    workOrderNo: "WO-2026-0312",
    customerName: "TechMetals",
    alloyGrade: "6063",
    dieNo: "2003089",
    totalMT: 18.0,
    completedMT: 0,
    status: OrderStatus.open,
    dueDate: NOW + DAY * BigInt(5),
    plantId: "Plant-1",
  },
  {
    id: "ORD-008",
    workOrderNo: "WO-2026-0313",
    customerName: "AlloyCraft Inc",
    alloyGrade: "7075",
    dieNo: "2002234",
    totalMT: 6.0,
    completedMT: 0,
    status: OrderStatus.open,
    dueDate: NOW + DAY * BigInt(4),
    plantId: "Plant-1",
  },
  {
    id: "ORD-009",
    workOrderNo: "WO-2026-0314",
    customerName: "PrecisionExtrude",
    alloyGrade: "6061",
    dieNo: "2001178",
    totalMT: 10.5,
    completedMT: 3.2,
    status: OrderStatus.delayed,
    dueDate: NOW - DAY * BigInt(1),
    plantId: "Plant-1",
  },
  {
    id: "ORD-010",
    workOrderNo: "WO-2026-0315",
    customerName: "ModernFrames",
    alloyGrade: "6082",
    dieNo: "2004001",
    totalMT: 14.0,
    completedMT: 14.0,
    status: OrderStatus.completed,
    dueDate: NOW - DAY * BigInt(3),
    plantId: "Plant-1",
  },
  {
    id: "ORD-011",
    workOrderNo: "WO-2026-0321",
    customerName: "SolarStructures",
    alloyGrade: "6063",
    dieNo: "2003064",
    totalMT: 5.5,
    completedMT: 0,
    status: OrderStatus.open,
    dueDate: NOW + DAY * BigInt(7),
    plantId: "Plant-1",
  },
  {
    id: "ORD-012",
    workOrderNo: "WO-2026-0322",
    customerName: "CivilCraft",
    alloyGrade: "6082",
    dieNo: "2001005",
    totalMT: 9.0,
    completedMT: 4.1,
    status: OrderStatus.inProgress,
    dueDate: NOW + DAY * BigInt(2),
    plantId: "Plant-1",
  },
  {
    id: "ORD-013",
    workOrderNo: "WO-2026-0323",
    customerName: "AeroFrame Ltd",
    alloyGrade: "7075",
    dieNo: "2002010",
    totalMT: 20.0,
    completedMT: 8.5,
    status: OrderStatus.inProgress,
    dueDate: NOW + DAY * BigInt(6),
    plantId: "Plant-1",
  },
  {
    id: "ORD-014",
    workOrderNo: "WO-2026-0324",
    customerName: "TransportCo",
    alloyGrade: "6061",
    dieNo: "2004056",
    totalMT: 3.5,
    completedMT: 3.5,
    status: OrderStatus.completed,
    dueDate: NOW - DAY * BigInt(1),
    plantId: "Plant-1",
  },
  {
    id: "ORD-015",
    workOrderNo: "WO-2026-0325",
    customerName: "InfraMet",
    alloyGrade: "6063",
    dieNo: "2000061",
    totalMT: 16.0,
    completedMT: 2.1,
    status: OrderStatus.delayed,
    dueDate: NOW - DAY * BigInt(2),
    plantId: "Plant-1",
  },
];

// ─── Mock overdue dies ────────────────────────────────────────────────────────
export const MOCK_OVERDUE_DIES: DieMaintenance[] = [
  {
    dieNo: "2001005",
    shotsCompleted: BigInt(4850),
    shotLife: BigInt(5000),
    maintenanceDue: NOW - DAY * BigInt(3),
    lastMaintenanceDate: NOW - DAY * BigInt(63),
    changeFrequency: BigInt(30),
  },
  {
    dieNo: "2002010",
    shotsCompleted: BigInt(4920),
    shotLife: BigInt(5000),
    maintenanceDue: NOW - DAY * BigInt(1),
    lastMaintenanceDate: NOW - DAY * BigInt(61),
    changeFrequency: BigInt(30),
  },
  {
    dieNo: "2003064",
    shotsCompleted: BigInt(3200),
    shotLife: BigInt(5000),
    maintenanceDue: NOW + DAY * BigInt(5),
    lastMaintenanceDate: NOW - DAY * BigInt(25),
    changeFrequency: BigInt(30),
  },
  {
    dieNo: "2004056",
    shotsCompleted: BigInt(2100),
    shotLife: BigInt(5000),
    maintenanceDue: NOW + DAY * BigInt(14),
    lastMaintenanceDate: NOW - DAY * BigInt(16),
    changeFrequency: BigInt(30),
  },
  {
    dieNo: "2000061",
    shotsCompleted: BigInt(1800),
    shotLife: BigInt(5000),
    maintenanceDue: NOW + DAY * BigInt(22),
    lastMaintenanceDate: NOW - DAY * BigInt(8),
    changeFrequency: BigInt(30),
  },
];

// ─── Mock quality records ─────────────────────────────────────────────────────
export const MOCK_QUALITY_RECORDS: QualityRecord[] = [
  {
    pressId: "P3300",
    alloyGrade: "6063",
    dieNo: "2003064",
    timestamp: NOW,
    rejectionPctByAlloy: 1.4,
    rejectionPctByDie: 1.2,
    surfaceDefectCount: BigInt(12),
    dimensionalFailurePct: 0.3,
    customerComplaints: BigInt(1),
    rootCauseSummary: "Die mark from worn guide",
    scrapCostImpact: 15600,
  },
  {
    pressId: "P2500",
    alloyGrade: "6082",
    dieNo: "2001005",
    timestamp: NOW,
    rejectionPctByAlloy: 2.3,
    rejectionPctByDie: 3.1,
    surfaceDefectCount: BigInt(8),
    dimensionalFailurePct: 1.2,
    customerComplaints: BigInt(3),
    rootCauseSummary: "Breakdown causing cold metal extrusion",
    scrapCostImpact: 9800,
  },
  {
    pressId: "P1800",
    alloyGrade: "7075",
    dieNo: "2002010",
    timestamp: NOW,
    rejectionPctByAlloy: 1.6,
    rejectionPctByDie: 1.8,
    surfaceDefectCount: BigInt(15),
    dimensionalFailurePct: 0.5,
    customerComplaints: BigInt(2),
    rootCauseSummary: "Twist defect during puller speed mismatch",
    scrapCostImpact: 18400,
  },
  {
    pressId: "P1460",
    alloyGrade: "6061",
    dieNo: "2004056",
    timestamp: NOW,
    rejectionPctByAlloy: 1.5,
    rejectionPctByDie: 1.1,
    surfaceDefectCount: BigInt(9),
    dimensionalFailurePct: 0.4,
    customerComplaints: BigInt(0),
    rootCauseSummary: "Minor surface blister, corrected via temp adjustment",
    scrapCostImpact: 12000,
  },
  {
    pressId: "P1100",
    alloyGrade: "6063",
    dieNo: "2000061",
    timestamp: NOW,
    rejectionPctByAlloy: 1.3,
    rejectionPctByDie: 0.9,
    surfaceDefectCount: BigInt(6),
    dimensionalFailurePct: 0.2,
    customerComplaints: BigInt(0),
    rootCauseSummary: "Minimal — process stable",
    scrapCostImpact: 8400,
  },
];
