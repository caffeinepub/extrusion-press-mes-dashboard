// Mock data for MES Executive Dashboard

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
}

export const initialPresses: PressData[] = [
  {
    id: "P3300",
    name: "Titan",
    tonnage: 3300,
    status: "Running",
    oee: 88.9,
    plan: 20,
    actual: 2.6,
    downtime: 3,
    scrap: 1.4,
    dieNumber: "2003064",
    alloyGrade: "6063",
    operator: "Raj Kumar",
    shift: "A",
    workOrder: "WO-2026-0301",
    billetTemp: 480,
    ramPressure: 285,
    extrusionSpeed: 8.2,
    kgPerHour: 2100,
    dieTarget: 2400,
  },
  {
    id: "P2500",
    name: "Atlas",
    tonnage: 2500,
    status: "Breakdown",
    oee: 51.0,
    plan: 20,
    actual: 0.3,
    downtime: 180,
    scrap: 2.3,
    dieNumber: "2001005",
    alloyGrade: "6082",
    operator: "Suresh M",
    shift: "A",
    workOrder: "WO-2026-0302",
    billetTemp: 0,
    ramPressure: 0,
    extrusionSpeed: 0,
    kgPerHour: 800,
    dieTarget: 2000,
  },
  {
    id: "P1800",
    name: "Vulcan",
    tonnage: 1800,
    status: "Running",
    oee: 80.9,
    plan: 20,
    actual: 2.4,
    downtime: 3,
    scrap: 1.6,
    dieNumber: "2002010",
    alloyGrade: "7075",
    operator: "Amit Patel",
    shift: "A",
    workOrder: "WO-2026-0303",
    billetTemp: 475,
    ramPressure: 260,
    extrusionSpeed: 7.8,
    kgPerHour: 1900,
    dieTarget: 2200,
  },
  {
    id: "P1460",
    name: "Hermes",
    tonnage: 1460,
    status: "Running",
    oee: 85.6,
    plan: 20,
    actual: 2.3,
    downtime: 3,
    scrap: 1.5,
    dieNumber: "2004056",
    alloyGrade: "6061",
    operator: "Priya S",
    shift: "A",
    workOrder: "WO-2026-0304",
    billetTemp: 470,
    ramPressure: 240,
    extrusionSpeed: 7.1,
    kgPerHour: 1600,
    dieTarget: 1800,
  },
  {
    id: "P1100",
    name: "Swift",
    tonnage: 1100,
    status: "Running",
    oee: 94.2,
    plan: 20,
    actual: 2.8,
    downtime: 3,
    scrap: 1.3,
    dieNumber: "2000061",
    alloyGrade: "6063",
    operator: "Vikas N",
    shift: "A",
    workOrder: "WO-2026-0305",
    billetTemp: 465,
    ramPressure: 210,
    extrusionSpeed: 9.5,
    kgPerHour: 2500,
    dieTarget: 2600,
  },
];

export const kpiData = {
  totalInput: 10.6,
  totalOutput: 10.4,
  totalDelay: 334,
  totalScrap: 1.6,
  fleetOEE: 80.1,
  totalUtil: 85.2,
  totalEnergy: 275,
  totalFGS: 450.0,
  totalWIP: 125.0,
  totalBacklog: 3500,
};

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

export const downtimeCategories = [
  { name: "Die Change", percentage: 25.3, color: "#3b82f6" },
  { name: "PP Break", percentage: 21.3, color: "#ef4444" },
  { name: "Die Failure", percentage: 12.4, color: "#f97316" },
  { name: "Maintenance", percentage: 11.2, color: "#14b8a6" },
  { name: "Die Mgmt", percentage: 8.4, color: "#8b5cf6" },
  { name: "Prev Maint", percentage: 6.7, color: "#06b6d4" },
  { name: "No Planning", percentage: 5.6, color: "#f59e0b" },
  { name: "Power Out", percentage: 4.5, color: "#ec4899" },
  { name: "IT Down", percentage: 2.8, color: "#64748b" },
  { name: "Proj & Dev", percentage: 1.7, color: "#84cc16" },
];

export const topDies = [
  { rank: 1, dieNo: "2003064", totalKg: 1096 },
  { rank: 2, dieNo: "2001005", totalKg: 1095 },
  { rank: 3, dieNo: "2002010", totalKg: 1095 },
  { rank: 4, dieNo: "2004056", totalKg: 1095 },
  { rank: 5, dieNo: "2000061", totalKg: 1093 },
  { rank: 6, dieNo: "2001057", totalKg: 1093 },
  { rank: 7, dieNo: "2003089", totalKg: 1092 },
  { rank: 8, dieNo: "2002234", totalKg: 1091 },
  { rank: 9, dieNo: "2001178", totalKg: 1090 },
  { rank: 10, dieNo: "2004001", totalKg: 1089 },
];

export const topAlloys = [
  { rank: 1, alloy: "7075", totalKg: 50168 },
  { rank: 2, alloy: "6063", totalKg: 47347 },
  { rank: 3, alloy: "E91E", totalKg: 43324 },
  { rank: 4, alloy: "6082", totalKg: 41104 },
  { rank: 5, alloy: "19501", totalKg: 40015 },
  { rank: 6, alloy: "6005A", totalKg: 39274 },
  { rank: 7, alloy: "6061", totalKg: 37890 },
  { rank: 8, alloy: "2024", totalKg: 35621 },
  { rank: 9, alloy: "6463", totalKg: 33890 },
  { rank: 10, alloy: "6060", totalKg: 31245 },
];

export const wipAgingData = [
  { label: "< 24 HR", value: 65.0, color: "#22c55e" },
  { label: "24-72 HR", value: 41.3, color: "#f59e0b" },
  { label: "> 72 HR", value: 18.8, color: "#ef4444" },
];

export const strategicKPIs = [
  {
    kpi: "Daily Production",
    target: "120 MT",
    actual: "108 MT",
    status: "red" as const,
  },
  { kpi: "OEE", target: "85%", actual: "78%", status: "yellow" as const },
  { kpi: "Rejection", target: "<2%", actual: "1.6%", status: "green" as const },
  {
    kpi: "On-Time Delivery",
    target: "95%",
    actual: "91%",
    status: "yellow" as const,
  },
  {
    kpi: "Energy per MT",
    target: "28 kWh",
    actual: "26 kWh",
    status: "green" as const,
  },
  {
    kpi: "Revenue/Press/Day",
    target: "$18,000",
    actual: "$15,400",
    status: "yellow" as const,
  },
];

export function applyLiveDelta(value: number, deltaPercent = 0.03): number {
  const delta = value * deltaPercent * (Math.random() * 2 - 1);
  return Math.max(0, value + delta);
}
