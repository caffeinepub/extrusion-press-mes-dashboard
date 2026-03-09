import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DieMaintenance {
    shotsCompleted: bigint;
    changeFrequency: bigint;
    maintenanceDue: Time;
    dieNo: string;
    shotLife: bigint;
    lastMaintenanceDate: Time;
}
export interface Alarm {
    id: string;
    pressId: string;
    description: string;
    isActive: boolean;
    timestamp: Time;
    severity: AlarmSeverity;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Plant {
    id: string;
    capacityUtilizationPct: number;
    totalCapacityMT: number;
    name: string;
    oeePct: number;
    location: string;
    activePresses: bigint;
}
export interface ProductionMetrics {
    recoveryPct: number;
    containerChangeTime: number;
    pressId: string;
    cycleTimePerBillet: number;
    pullerSpeed: number;
    totalProductionMT: number;
    pressKgPerHour: number;
    dailyTargetMT: number;
    sawCycleTime: number;
    timestamp: Time;
    shiftProductionA: number;
    shiftProductionB: number;
    shiftProductionC: number;
    extrusionSpeed: number;
    dailyProductionMT: number;
    billetCount: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    completedMT: number;
    totalMT: number;
    dueDate: Time;
    workOrderNo: string;
    plantId: string;
    alloyGrade: string;
    dieNo: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Press {
    id: string;
    status: PressStatus;
    activeDie: string;
    name: string;
    operatorName: string;
    shift: string;
    currentOrder: string;
    alloyGrade: string;
    plant: string;
}
export interface MachineParameters {
    exitTemp: number;
    billetTemp: number;
    pressId: string;
    mainRamPressure: number;
    containerTemp: number;
    dieTemp: number;
    timestamp: Time;
    extrusionPressure: number;
    ramSpeed: number;
    pullerForce: number;
    breakthroughPressure: number;
}
export interface DowntimeEvent {
    id: string;
    mtbfHours: number;
    pressId: string;
    durationMinutes: bigint;
    timestamp: Time;
    category: DowntimeCategory;
    mttrHours: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface LivePressRecord {
    id: string;
    oee: number;
    status: string;
    downtimeMinutes: bigint;
    contactTime: number;
    ppPlanBillets: bigint;
    kgPerHour: number;
    dieUnloadCount: bigint;
    dieLoadCount: bigint;
    ppActBillets: bigint;
    recovery: number;
    dieKgH: number;
    inputMt: number;
    outputMt: number;
}
export interface OEEData {
    rejectionPct: number;
    reworkPct: number;
    scrapKg: number;
    dieChangeTime: number;
    pressId: string;
    standardSpeed: number;
    idleTime: number;
    pressEfficiencyPct: number;
    breakdownTime: number;
    outputVsRatedCapacityPct: number;
    firstPassYieldPct: number;
    qualityPct: number;
    timestamp: Time;
    availabilityPct: number;
    setupTime: number;
    plannedRunTime: number;
    oeePct: number;
    actualRunTime: number;
    actualSpeed: number;
    performancePct: number;
}
export interface CostMetrics {
    powerConsumptionKwh: number;
    pressId: string;
    date: Time;
    labourEfficiencyPct: number;
    energyCostPerMT: number;
    revenuePerPressPerDay: number;
    productionCostPerMT: number;
    scrapCost: number;
}
export interface QualityRecord {
    rejectionPctByAlloy: number;
    customerComplaints: bigint;
    scrapCostImpact: number;
    pressId: string;
    dimensionalFailurePct: number;
    alloyGrade: string;
    timestamp: Time;
    rejectionPctByDie: number;
    dieNo: string;
    rootCauseSummary: string;
    surfaceDefectCount: bigint;
}
export enum AlarmSeverity {
    warning = "warning",
    info = "info",
    critical = "critical"
}
export enum DowntimeCategory {
    dieFailure = "dieFailure",
    other = "other",
    operatorDelay = "operatorDelay",
    billetQuality = "billetQuality",
    powerFailure = "powerFailure",
    mechanicalFailure = "mechanicalFailure"
}
export enum OrderStatus {
    delayed = "delayed",
    open = "open",
    completed = "completed",
    inProgress = "inProgress"
}
export enum PressStatus {
    idle = "idle",
    breakdown = "breakdown",
    setup = "setup",
    running = "running"
}
export interface backendInterface {
    addAlarm(alarm: Alarm): Promise<void>;
    addCostMetrics(metrics: CostMetrics): Promise<void>;
    addDieMaintenance(maintenance: DieMaintenance): Promise<void>;
    addDowntimeEvent(event: DowntimeEvent): Promise<void>;
    addMachineParameters(params: MachineParameters): Promise<void>;
    addOEEData(data: OEEData): Promise<void>;
    addOrder(order: Order): Promise<void>;
    addPlant(plant: Plant): Promise<void>;
    addPress(press: Press): Promise<void>;
    addProductionMetrics(metrics: ProductionMetrics): Promise<void>;
    addQualityRecord(record: QualityRecord): Promise<void>;
    deletePress(id: string): Promise<void>;
    fetchLiveData(): Promise<[boolean, string]>;
    getActiveAlarms(): Promise<Array<Alarm>>;
    getAllPlants(): Promise<Array<Plant>>;
    getAllPresses(): Promise<Array<Press>>;
    getApiEndpoint(): Promise<[string, boolean]>;
    getDowntimeEventsByCategory(category: DowntimeCategory): Promise<Array<DowntimeEvent>>;
    getLastFetchStatus(): Promise<[string, bigint]>;
    getLivePressData(): Promise<Array<LivePressRecord>>;
    getMachineParameters(pressId: string): Promise<MachineParameters>;
    getOEEData(pressId: string): Promise<Array<OEEData>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getOverdueDies(currentTime: Time): Promise<Array<DieMaintenance>>;
    getPlant(id: string): Promise<Plant>;
    getPress(id: string): Promise<Press>;
    getPressesByPlant(plantId: string): Promise<Array<Press>>;
    getProductionMetrics(pressId: string): Promise<Array<ProductionMetrics>>;
    getQualityRecordsByAlloy(alloy: string): Promise<Array<QualityRecord>>;
    seedSampleData(): Promise<void>;
    setApiEndpoint(url: string, enabled: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePress(press: Press): Promise<void>;
}
