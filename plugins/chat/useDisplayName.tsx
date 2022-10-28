import { formatEntityID } from "@latticexyz/network";
import { getComponentValue } from "@latticexyz/recs";
import { useState, useEffect } from "preact/hooks";

const {
  network: {
    world,
    components: { Name },
    faucet,
    network: { connectedAddressChecksummed },
  },
} = window.layers;

const truncateAddress = (address: string) => address.replace(/^(0x[0-9A-F]{3})[0-9A-F]+([0-9A-F]{4})$/i, "$1…$2");

export const useDisplayName = () => {
  const address = connectedAddressChecksummed.get();
  const entityIndex = address ? world.entityToIndex.get(formatEntityID(address.toLowerCase())) : null;
  const initialUsername = entityIndex != null ? getComponentValue(Name, entityIndex)?.value ?? null : null;

  const [username, setUsername] = useState<string | null>(initialUsername);

  useEffect(() => {
    if (!entityIndex) return;

    const subscription = Name.update$.subscribe((update) => {
      console.log("got name update", update, entityIndex);
      if (update.entity === entityIndex) {
        console.log("entity matched!");
        const componentValue = getComponentValue(Name, entityIndex);
        if (componentValue?.value) {
          setUsername(componentValue.value);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName = username || initialUsername || truncateAddress(address || "0x0");

  return { displayName };
};
