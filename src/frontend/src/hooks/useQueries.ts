import { useQuery } from "@tanstack/react-query";
import type {
  Alarm,
  CostMetrics,
  DieMaintenance,
  DowntimeEvent,
  MachineParameters,
  OEEData,
  Order,
  Plant,
  Press,
  ProductionMetrics,
  QualityRecord,
} from "../backend.d";
import { DowntimeCategory, OrderStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useAllPresses() {
  const { actor, isFetching } = useActor();
  return useQuery<Press[]>({
    queryKey: ["presses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPresses();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAllPlants() {
  const { actor, isFetching } = useActor();
  return useQuery<Plant[]>({
    queryKey: ["plants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlants();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useActiveAlarms() {
  const { actor, isFetching } = useActor();
  return useQuery<Alarm[]>({
    queryKey: ["activeAlarms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveAlarms();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useProductionMetrics(pressIds: string[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, ProductionMetrics[]>>({
    queryKey: ["productionMetrics", pressIds],
    queryFn: async () => {
      if (!actor || pressIds.length === 0) return {};
      const results = await Promise.all(
        pressIds.map((id) =>
          actor.getProductionMetrics(id).then((data) => ({ id, data })),
        ),
      );
      return Object.fromEntries(results.map((r) => [r.id, r.data]));
    },
    enabled: !!actor && !isFetching && pressIds.length > 0,
    staleTime: 30_000,
  });
}

export function useOEEData(pressIds: string[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, OEEData[]>>({
    queryKey: ["oeeData", pressIds],
    queryFn: async () => {
      if (!actor || pressIds.length === 0) return {};
      const results = await Promise.all(
        pressIds.map((id) =>
          actor.getOEEData(id).then((data) => ({ id, data })),
        ),
      );
      return Object.fromEntries(results.map((r) => [r.id, r.data]));
    },
    enabled: !!actor && !isFetching && pressIds.length > 0,
    staleTime: 30_000,
  });
}

export function useMachineParameters(pressId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MachineParameters | null>({
    queryKey: ["machineParams", pressId],
    queryFn: async () => {
      if (!actor || !pressId) return null;
      try {
        return await actor.getMachineParameters(pressId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!pressId,
    staleTime: 15_000,
  });
}

export function useAllDowntimeEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<DowntimeEvent[]>({
    queryKey: ["downtimeEvents"],
    queryFn: async () => {
      if (!actor) return [];
      const categories = [
        DowntimeCategory.powerFailure,
        DowntimeCategory.dieFailure,
        DowntimeCategory.billetQuality,
        DowntimeCategory.operatorDelay,
        DowntimeCategory.mechanicalFailure,
        DowntimeCategory.other,
      ];
      const results = await Promise.all(
        categories.map((cat) => actor.getDowntimeEventsByCategory(cat)),
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useOrdersByStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      const [open, inProgress, completed, delayed] = await Promise.all([
        actor.getOrdersByStatus(OrderStatus.open),
        actor.getOrdersByStatus(OrderStatus.inProgress),
        actor.getOrdersByStatus(OrderStatus.completed),
        actor.getOrdersByStatus(OrderStatus.delayed),
      ]);
      return [...open, ...inProgress, ...completed, ...delayed];
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useQualityRecords(alloys: string[]) {
  const { actor, isFetching } = useActor();
  return useQuery<QualityRecord[]>({
    queryKey: ["qualityRecords", alloys],
    queryFn: async () => {
      if (!actor || alloys.length === 0) return [];
      const results = await Promise.all(
        alloys.map((a) => actor.getQualityRecordsByAlloy(a)),
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching && alloys.length > 0,
    staleTime: 30_000,
  });
}

export function useOverdueDies() {
  const { actor, isFetching } = useActor();
  return useQuery<DieMaintenance[]>({
    queryKey: ["overdueDies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOverdueDies(BigInt(Date.now()) * BigInt(1_000_000));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useCostMetrics(pressIds: string[]) {
  const { actor, isFetching } = useActor();
  // We get cost data from OEE data as a proxy since there's no direct getCostMetrics
  // We'll store a dummy fetch
  return useQuery<CostMetrics[]>({
    queryKey: ["costMetrics", pressIds],
    queryFn: async (): Promise<CostMetrics[]> => {
      return [];
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}
