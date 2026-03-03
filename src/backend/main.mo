import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  // Type Declarations
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

  // Storage Maps
  let presses = Map.empty<Text, Press>();
  let productionMetrics = Map.empty<Text, ProductionMetrics>();
  let oeeData = Map.empty<Text, OEEData>();
  let machineParameters = Map.empty<Text, MachineParameters>();
  let alarms = Map.empty<Text, Alarm>();
  let orders = Map.empty<Text, Order>();
  let dieMaintenance = Map.empty<Text, DieMaintenance>();
  let qualityRecords = Map.empty<Text, QualityRecord>();
  let downtimeEvents = Map.empty<Text, DowntimeEvent>();
  let costMetrics = Map.empty<Text, CostMetrics>();
  let plants = Map.empty<Text, Plant>();

  // Comparison functions
  module MachineParameters {
    public func compare(mp1 : MachineParameters, mp2 : MachineParameters) : Order.Order {
      switch (Text.compare(mp1.pressId, mp2.pressId)) {
        case (#equal) { Int.compare(mp1.timestamp, mp2.timestamp) };
        case (order) { order };
      };
    };

    public func compareByTimestamp(mp1 : MachineParameters, mp2 : MachineParameters) : Order.Order {
      Int.compare(mp1.timestamp, mp2.timestamp);
    };
  };

  // Core Data CRUD Functions
  public shared ({ caller }) func addPress(press : Press) : async () {
    presses.add(press.id, press);
  };

  public shared ({ caller }) func updatePress(press : Press) : async () {
    presses.add(press.id, press);
  };

  public shared ({ caller }) func deletePress(id : Text) : async () {
    presses.remove(id);
  };

  public query ({ caller }) func getPress(id : Text) : async Press {
    switch (presses.get(id)) {
      case (null) { Runtime.trap("Press not found") };
      case (?press) { press };
    };
  };

  public query ({ caller }) func getAllPresses() : async [Press] {
    presses.values().toArray();
  };

  public query ({ caller }) func getPressesByPlant(plantId : Text) : async [Press] {
    presses.values().toArray().filter(func(p) { p.plant == plantId });
  };

  // Production Metrics CRUD
  public shared ({ caller }) func addProductionMetrics(metrics : ProductionMetrics) : async () {
    productionMetrics.add(metrics.pressId, metrics);
  };

  public query ({ caller }) func getProductionMetrics(pressId : Text) : async [ProductionMetrics] {
    let metrics = List.empty<ProductionMetrics>();
    switch (productionMetrics.get(pressId)) {
      case (null) {
        Runtime.trap("No production metrics found for press: " # pressId);
      };
      case (?m) {
        metrics.add(m);
      };
    };
    metrics.toArray();
  };

  // OEE Data CRUD
  public shared ({ caller }) func addOEEData(data : OEEData) : async () {
    oeeData.add(data.pressId, data);
  };

  public query ({ caller }) func getOEEData(pressId : Text) : async [OEEData] {
    let data = List.empty<OEEData>();
    switch (oeeData.get(pressId)) {
      case (null) {
        Runtime.trap("No OEE data found for press: " # pressId);
      };
      case (?d) {
        data.add(d);
      };
    };
    data.toArray();
  };

  // Machine Parameters CRUD
  public shared ({ caller }) func addMachineParameters(params : MachineParameters) : async () {
    machineParameters.add(params.pressId, params);
  };

  public query ({ caller }) func getMachineParameters(pressId : Text) : async MachineParameters {
    switch (machineParameters.get(pressId)) {
      case (null) { Runtime.trap("Machine parameters not found for press: " # pressId) };
      case (?params) { params };
    };
  };

  // Alarm CRUD
  public shared ({ caller }) func addAlarm(alarm : Alarm) : async () {
    alarms.add(alarm.id, alarm);
  };

  public query ({ caller }) func getActiveAlarms() : async [Alarm] {
    alarms.values().toArray().filter(func(a) { a.isActive });
  };

  // Order CRUD
  public shared ({ caller }) func addOrder(order : Order) : async () {
    orders.add(order.id, order);
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    orders.values().toArray().filter(func(o) { o.status == status });
  };

  // Die Maintenance CRUD
  public shared ({ caller }) func addDieMaintenance(maintenance : DieMaintenance) : async () {
    dieMaintenance.add(maintenance.dieNo, maintenance);
  };

  public query ({ caller }) func getOverdueDies(currentTime : Time.Time) : async [DieMaintenance] {
    dieMaintenance.values().toArray().filter(func(d) { d.maintenanceDue < currentTime });
  };

  // Quality Record CRUD
  public shared ({ caller }) func addQualityRecord(record : QualityRecord) : async () {
    qualityRecords.add(record.pressId # record.dieNo, record);
  };

  public query ({ caller }) func getQualityRecordsByAlloy(alloy : Text) : async [QualityRecord] {
    qualityRecords.values().toArray().filter(func(q) { q.alloyGrade == alloy });
  };

  // Downtime Event CRUD
  public shared ({ caller }) func addDowntimeEvent(event : DowntimeEvent) : async () {
    downtimeEvents.add(event.id, event);
  };

  public query ({ caller }) func getDowntimeEventsByCategory(category : DowntimeCategory) : async [DowntimeEvent] {
    downtimeEvents.values().toArray().filter(func(e) { e.category == category });
  };

  // Cost Metrics CRUD
  public shared ({ caller }) func addCostMetrics(metrics : CostMetrics) : async () {
    costMetrics.add(metrics.pressId, metrics);
  };

  // Plant CRUD
  public shared ({ caller }) func addPlant(plant : Plant) : async () {
    plants.add(plant.id, plant);
  };

  public query ({ caller }) func getPlant(id : Text) : async Plant {
    switch (plants.get(id)) {
      case (null) { Runtime.trap("Plant not found") };
      case (?plant) { plant };
    };
  };

  public query ({ caller }) func getAllPlants() : async [Plant] {
    plants.values().toArray();
  };

  // Seed Sample Data Function
  public shared ({ caller }) func seedSampleData() : async () {
    let press1 : Press = {
      id = "P1";
      name = "Press 1";
      plant = "PlantA";
      status = #running;
      activeDie = "DIE1";
      alloyGrade = "6063";
      currentOrder = "ORD1";
      shift = "A";
      operatorName = "John Doe";
    };

    let press2 : Press = {
      id = "P2";
      name = "Press 2";
      plant = "PlantA";
      status = #idle;
      activeDie = "DIE2";
      alloyGrade = "6061";
      currentOrder = "ORD2";
      shift = "B";
      operatorName = "Jane Smith";
    };

    let plantA : Plant = {
      id = "PlantA";
      name = "Plant A";
      location = "Location A";
      activePresses = 2;
      totalCapacityMT = 1000.0;
      oeePct = 85.0;
      capacityUtilizationPct = 75.0;
    };

    presses.add(press1.id, press1);
    presses.add(press2.id, press2);
    plants.add(plantA.id, plantA);
  };
};
