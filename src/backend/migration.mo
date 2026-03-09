import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Time "mo:core/Time";

module {
  type OldActor = {
    presses : Map.Map<Text, Press>;
    productionMetrics : Map.Map<Text, ProductionMetrics>;
    oeeData : Map.Map<Text, OEEData>;
    machineParameters : Map.Map<Text, MachineParameters>;
    alarms : Map.Map<Text, Alarm>;
    orders : Map.Map<Text, Order>;
    dieMaintenance : Map.Map<Text, DieMaintenance>;
    qualityRecords : Map.Map<Text, QualityRecord>;
    downtimeEvents : Map.Map<Text, DowntimeEvent>;
    costMetrics : Map.Map<Text, CostMetrics>;
    plants : Map.Map<Text, Plant>;
  };

  public type PressStatus = { #running; #idle; #breakdown; #setup };
  public type AlarmSeverity = { #critical; #warning; #info };
  public type OrderStatus = { #open; #inProgress; #completed; #delayed };
  public type DowntimeCategory = {
    #powerFailure;
    #dieFailure;
    #billetQuality;
    #operatorDelay;
    #mechanicalFailure;
    #other;
  };

  public type Press = {
    id : Text;
    name : Text;
    plant : Text;
    status : PressStatus;
    activeDie : Text;
    alloyGrade : Text;
    currentOrder : Text;
    shift : Text;
    operatorName : Text;
  };

  public type ProductionMetrics = {
    pressId : Text;
    totalProductionMT : Float;
    shiftProductionA : Float;
    shiftProductionB : Float;
    shiftProductionC : Float;
    dailyProductionMT : Float;
    dailyTargetMT : Float;
    pressKgPerHour : Float;
    billetCount : Int;
    recoveryPct : Float;
    cycleTimePerBillet : Float;
    extrusionSpeed : Float;
    pullerSpeed : Float;
    sawCycleTime : Float;
    containerChangeTime : Float;
    timestamp : Time.Time;
  };

  public type OEEData = {
    pressId : Text;
    plannedRunTime : Float;
    actualRunTime : Float;
    breakdownTime : Float;
    setupTime : Float;
    dieChangeTime : Float;
    idleTime : Float;
    actualSpeed : Float;
    standardSpeed : Float;
    pressEfficiencyPct : Float;
    outputVsRatedCapacityPct : Float;
    rejectionPct : Float;
    reworkPct : Float;
    firstPassYieldPct : Float;
    scrapKg : Float;
    availabilityPct : Float;
    performancePct : Float;
    qualityPct : Float;
    oeePct : Float;
    timestamp : Time.Time;
  };

  public type MachineParameters = {
    pressId : Text;
    billetTemp : Float;
    containerTemp : Float;
    dieTemp : Float;
    exitTemp : Float;
    mainRamPressure : Float;
    breakthroughPressure : Float;
    extrusionPressure : Float;
    ramSpeed : Float;
    pullerForce : Float;
    timestamp : Time.Time;
  };

  public type Alarm = {
    id : Text;
    pressId : Text;
    severity : AlarmSeverity;
    description : Text;
    isActive : Bool;
    timestamp : Time.Time;
  };

  public type Order = {
    id : Text;
    workOrderNo : Text;
    alloyGrade : Text;
    dieNo : Text;
    customerName : Text;
    totalMT : Float;
    completedMT : Float;
    status : OrderStatus;
    dueDate : Time.Time;
    plantId : Text;
  };

  public type DieMaintenance = {
    dieNo : Text;
    shotsCompleted : Int;
    shotLife : Int;
    maintenanceDue : Time.Time;
    lastMaintenanceDate : Time.Time;
    changeFrequency : Int;
  };

  public type QualityRecord = {
    pressId : Text;
    alloyGrade : Text;
    dieNo : Text;
    rejectionPctByAlloy : Float;
    rejectionPctByDie : Float;
    surfaceDefectCount : Int;
    dimensionalFailurePct : Float;
    customerComplaints : Int;
    rootCauseSummary : Text;
    scrapCostImpact : Float;
    timestamp : Time.Time;
  };

  public type DowntimeEvent = {
    id : Text;
    pressId : Text;
    category : DowntimeCategory;
    durationMinutes : Int;
    mtbfHours : Float;
    mttrHours : Float;
    timestamp : Time.Time;
  };

  public type CostMetrics = {
    pressId : Text;
    productionCostPerMT : Float;
    scrapCost : Float;
    energyCostPerMT : Float;
    powerConsumptionKwh : Float;
    labourEfficiencyPct : Float;
    revenuePerPressPerDay : Float;
    date : Time.Time;
  };

  public type Plant = {
    id : Text;
    name : Text;
    location : Text;
    activePresses : Int;
    totalCapacityMT : Float;
    oeePct : Float;
    capacityUtilizationPct : Float;
  };

  public type StrategicKPI = {
    dailyProductionTotal : Float;
    dailyTargetTotal : Float;
    oeeAvg : Float;
    rejectionAvg : Float;
    onTimeDeliveryPct : Float;
  };

  // New Actor Type
  type NewActor = {
    presses : Map.Map<Text, Press>;
    productionMetrics : Map.Map<Text, ProductionMetrics>;
    oeeData : Map.Map<Text, OEEData>;
    machineParameters : Map.Map<Text, MachineParameters>;
    alarms : Map.Map<Text, Alarm>;
    orders : Map.Map<Text, Order>;
    dieMaintenance : Map.Map<Text, DieMaintenance>;
    qualityRecords : Map.Map<Text, QualityRecord>;
    downtimeEvents : Map.Map<Text, DowntimeEvent>;
    costMetrics : Map.Map<Text, CostMetrics>;
    plants : Map.Map<Text, Plant>;
    livePressData : Map.Map<Text, LivePressRecord>;
    apiEndpoint : Text;
    apiEnabled : Bool;
    lastFetchStatus : Text;
    lastFetchTimestamp : Int;
  };

  public type LivePressRecord = {
    id : Text;
    status : Text;
    kgPerHour : Float;
    oee : Float;
    recovery : Float;
    inputMt : Float;
    outputMt : Float;
    contactTime : Float;
    dieKgH : Float;
    ppPlanBillets : Int;
    ppActBillets : Int;
    dieLoadCount : Int;
    dieUnloadCount : Int;
    downtimeMinutes : Int;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      livePressData = Map.empty<Text, LivePressRecord>();
      apiEndpoint = "";
      apiEnabled = false;
      lastFetchStatus = "Never";
      lastFetchTimestamp = 0;
    };
  };
};
