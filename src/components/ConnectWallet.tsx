"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { arc } from "viem/chains";
import { formatUnits } from "viem";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const { data: balance } = useBalance({
    address,
    chainId: arc.id,
    query: {
      enabled: mounted && Boolean(address && chainId === arc.id),
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[68px] w-[250px]" aria-hidden="true" />
    );
  }

  const connector = connectors[0];

  if (!isConnected) {
    return (
      <button
        onClick={() => connector && connect({ connector })}
        disabled={!connector || isPending}
        className="rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  if (chainId !== arc.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: arc.id })}
        disabled={isSwitching}
        className="rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {isSwitching ? "Switching..." : "Switch to Arc Mainnet"}
      </button>
    );
  }

  const formattedBalance = balance
    ? Number(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : "0.0000";

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
        <div className="text-xs font-semibold text-emerald-700">
          ARC MAINNET ●
        </div>

        <div className="font-mono text-sm text-black">
          {address && shortAddress(address)}
        </div>

        <div className="mt-1 text-xs text-gray-600">
          {formattedBalance} USDC
        </div>
      </div>

      <button
        onClick={() => disconnect()}
        className="rounded-xl border px-4 py-3 text-sm font-medium"
      >
        Disconnect
      </button>
    </div>
  );
}
