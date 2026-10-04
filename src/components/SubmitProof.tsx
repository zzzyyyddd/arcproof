"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isAddressEqual } from "viem";
import {
  ARC_PROOF_ADDRESS,
  arcProofAbi,
  paymentStatus,
} from "@/lib/arcProof";
import { hashProof } from "@/lib/proof";

export default function SubmitProof({
  paymentId = 0n,
}: {
  paymentId?: bigint;
}) {
  const { address, isConnected } = useAccount();
  const [proof, setProof] = useState("");

  const {
    data: payment,
    refetch,
  } = useReadContract({
    address: ARC_PROOF_ADDRESS,
    abi: arcProofAbi,
    functionName: "payments",
    args: [paymentId],
  });

  const {
    data: hash,
    error,
    isPending: isWriting,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: Boolean(hash),
    },
  });

  const recipient = payment?.[1];
  const status = payment?.[6];

  const isRecipient =
    address &&
    recipient &&
    isAddressEqual(address, recipient);

  const canSubmit =
    isConnected &&
    isRecipient &&
    status === 1 &&
    proof.trim().length > 0 &&
    !isWriting &&
    !isConfirming;

  function submitProof() {
    if (!canSubmit) return;

    writeContract({
      address: ARC_PROOF_ADDRESS,
      abi: arcProofAbi,
      functionName: "submitProof",
      args: [paymentId, hashProof(proof)],
    });
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-emerald-600">
        SUBMIT PROOF
      </div>

      <h2 className="mt-2 text-2xl font-bold">
        Prove delivery
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Payment #{paymentId.toString()} ·{" "}
        {status !== undefined
          ? paymentStatus[Number(status)]
          : "Loading..."}
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">
          Delivery proof
        </label>

        <textarea
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Describe the completed delivery or paste a proof URL..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      {recipient && (
        <div className="mt-4 break-all rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
          Recipient: {recipient}
        </div>
      )}

      <button
        type="button"
        onClick={submitProof}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!isConnected
          ? "Connect recipient wallet"
          : !isRecipient
            ? "Switch to recipient wallet"
            : status !== 1
              ? "Proof unavailable"
              : isWriting
                ? "Confirm in wallet..."
                : isConfirming
                  ? "Submitting on Arc..."
                  : isConfirmed
                    ? "Proof submitted ✓"
                    : "Submit Proof"}
      </button>

      {hash && (
        <div className="mt-4 break-all rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
          Transaction: {hash}
        </div>
      )}

      {isConfirmed && (
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-medium"
        >
          Refresh payment status
        </button>
      )}

      {error && (
        <div className="mt-4 max-h-32 overflow-auto rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error.message}
        </div>
      )}
    </div>
  );
}
