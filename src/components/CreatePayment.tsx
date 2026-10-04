"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";

export default function CreatePayment() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [recipient, setRecipient] = useState("");
  const [verifier, setVerifier] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("24");

  const amountNumber = Number(amount);

  const formValid =
    mounted &&
    isConnected &&
    isAddress(recipient) &&
    isAddress(verifier) &&
    Number.isFinite(amountNumber) &&
    amountNumber > 0;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="text-sm font-medium text-emerald-600">
          CREATE PAYMENT
        </div>

        <h2 className="mt-2 text-2xl font-bold">
          Lock USDC against verified delivery
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Funds stay locked in ArcProof until the assigned verifier
          approves the submitted proof.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Recipient
          </label>

          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">
              Verifier
            </label>

            {mounted && address && (
              <button
                type="button"
                onClick={() => setVerifier(address)}
                className="text-xs font-medium text-emerald-600"
              >
                Use my wallet
              </button>
            )}
          </div>

          <input
            value={verifier}
            onChange={(e) => setVerifier(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-black"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount
            </label>

            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0.10"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-20 outline-none focus:border-black"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                USDC
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Deadline
            </label>

            <select
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black"
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="24">24 hours</option>
              <option value="72">3 days</option>
              <option value="168">7 days</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Network</span>
            <span className="font-medium text-black">Arc Mainnet</span>
          </div>

          <div className="mt-2 flex justify-between">
            <span>Settlement</span>
            <span className="font-medium text-black">
              Proof verified
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!formValid}
          className="w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!mounted || !isConnected
            ? "Connect wallet first"
            : formValid
              ? "Lock USDC"
              : "Complete payment details"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Contract interaction will activate after ArcProof deployment.
        </p>
      </div>
    </div>
  );
}
