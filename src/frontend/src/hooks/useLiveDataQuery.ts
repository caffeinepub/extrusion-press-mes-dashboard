import { useQuery } from "@tanstack/react-query";
import type { LivePressRecord } from "../backend.d";
import { useActor } from "./useActor";

/**
 * Fetches live press data from the canister and also loads the stored
 * API endpoint on mount. Refetches every 30 seconds.
 */
export function useLiveDataQuery() {
  const { actor, isFetching } = useActor();

  return useQuery<LivePressRecord[]>({
    queryKey: ["livePressList"],
    queryFn: async () => {
      if (!actor) return [];
      // Load both endpoint config and live press data in parallel
      const [records] = await Promise.all([
        actor.getLivePressData(),
        actor.getApiEndpoint(),
      ]);
      return records;
    },
    enabled: !!actor && !isFetching,
    staleTime: 25_000,
    refetchInterval: 30_000,
  });
}

/**
 * Returns last fetch status from the canister.
 */
export function useLastFetchStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, bigint]>({
    queryKey: ["lastFetchStatus"],
    queryFn: async () => {
      if (!actor) return ["Never fetched", BigInt(0)];
      return actor.getLastFetchStatus();
    },
    enabled: !!actor && !isFetching,
    staleTime: 25_000,
    refetchInterval: 30_000,
  });
}
