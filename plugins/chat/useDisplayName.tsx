import { useState, useEffect } from "preact/hooks";

const {
  network: {
    faucet,
    network: { connectedAddressChecksummed },
  },
} = window.layers;

const truncateAddress = (address: string) => address.replace(/^(0x[0-9A-F]{3})[0-9A-F]+([0-9A-F]{4})$/i, "$1…$2");

export const useDisplayName = () => {
  const [username, setUsername] = useState<string | null>(null);

  const address = connectedAddressChecksummed.get();

  // TODO: look this up from somewhere in the ECS instead of fetching?
  useEffect(() => {
    if (!address) return;
    const fetchUsername = async () => {
      const res = await faucet?.getLinkedTwitterForAddress({ address });
      if (res?.username) {
        setUsername(res.username);
      }
    };
    fetchUsername();
  }, []);

  const displayName = username || truncateAddress(address || "0x0");

  return { displayName };
};
