import { createConfig, http } from "wagmi";
import { arc } from "viem/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [arc],
  connectors: [injected()],
  transports: {
    [arc.id]: http(),
  },
});
