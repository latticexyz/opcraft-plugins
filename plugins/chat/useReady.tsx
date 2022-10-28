import { useEffect, useState } from "react";
import { GodID, SyncState } from "@latticexyz/network";
import { getComponentValue } from "@latticexyz/recs";

const {
  network: {
    world,
    components: { LoadingState },
  },
} = window.layers;

export const useReady = () => {
  const GodEntityIndex = world.entityToIndex.get(GodID);
  const initialLoadingState = GodEntityIndex ? getComponentValue(LoadingState, GodEntityIndex) : null;

  const [ready, setReady] = useState(initialLoadingState?.state === SyncState.LIVE);

  useEffect(() => {
    const subscription = LoadingState.update$.subscribe((update) => {
      if (GodEntityIndex && GodEntityIndex === update.entity) {
        const loadingState = getComponentValue(LoadingState, GodEntityIndex);
        const nextReadyState = loadingState?.state === SyncState.LIVE;
        if (nextReadyState !== ready) {
          setReady(nextReadyState);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return ready;
};
