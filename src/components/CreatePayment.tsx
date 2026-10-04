"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isAddress, parseEther } from "viem";
import {
  ARC_PROOF_ADDRESS,
  arcProofAbi,
} from "@/lib/arcProof";

export default function CreatePayment() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  const [recipient, setRecipient] = useState("");
  const [verifier, setVerifier] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("24");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: hash,
    error: writeError,
    isPending: isWriting,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const amountNumber = Number(amount);

  const formValid =
    mounted &&
    isConnected &&
    isAddress(recipient) &&
    isAddress(verifier) &&
    Number.isFinite(amountNumber) &&
    amountNumber > 0;

  function handleCreatePayment() {
    setErrorMessage("");

    if (!formValid) return;

    try {
      const deadlineTimestamp =
        BigInt(Math.floor(Date.now() / 1000)) +
        BigInt(deadline) * 60n * 60n;

      writeContract({
        address: ARC_PROOF_ADDRESS,
        abi: arcProofAbi,
        functionName: "createPayment",
        args: [
          recipient as `0x${string}`,
          verifier as `0x${string}`,
          deadlineTimestamp,
        ],
        value: parseEther(amount),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create payment."
      );
    }
  }

  const transactionError =
    errorMessage ||
    (writeError instanceof Error ? writeError.message : "");

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
          onClick={handleCreatePayment}
          disabled={!formValid || isWriting || isConfirming}
          className="w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!mounted || !isConnected
            ? "Connect wallet first"
            : isWriting
              ? "Confirm in wallet..."
              : isConfirming
                ? "Confirming on Arc..."
                : isConfirmed
                  ? "Payment locked ✓"
                  : formValid
                    ? "Lock USDC"
                    : "Complete payment details"}
        </button>

        {hash && (
          <div className="break-all rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
            Transaction: {hash}
          </div>
        )}

        {isConfirmed && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            Payment successfully locked on Arc Mainnet.
          </div>
        )}

        {transactionError && (
          <div className="max-h-32 overflow-auto rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {transactionError}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Funds are locked by the ArcProof smart contract on Arc Mainnet.
        </p>
      </div>
    </div>
  );
}
