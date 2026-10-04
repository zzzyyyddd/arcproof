"use client";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, isAddressEqual } from "viem";
import {
  ARC_PROOF_ADDRESS,
  arcProofAbi,
  paymentStatus,
} from "@/lib/arcProof";

export default function VerifyRelease({
  paymentId = 0n,
}: {
  paymentId?: bigint;
}) {
  const { address, isConnected } = useAccount();

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

  const verifier = payment?.[2];
  const amount = payment?.[3];
  const proofHash = payment?.[4];
  const status = payment?.[6];

  const isVerifier =
    address &&
    verifier &&
    isAddressEqual(address, verifier);

  const canRelease =
    isConnected &&
    isVerifier &&
    status === 2 &&
    !isWriting &&
    !isConfirming;

  function verifyAndRelease() {
    if (!canRelease) return;

    writeContract({
      address: ARC_PROOF_ADDRESS,
      abi: arcProofAbi,
      functionName: "verifyAndRelease",
      args: [paymentId],
    });
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-emerald-600">
        VERIFY & RELEASE
      </div>

      <h2 className="mt-2 text-2xl font-bold">
        Approve proof and pay
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Payment #{paymentId.toString()} ·{" "}
        {status !== undefined
          ? paymentStatus[Number(status)]
          : "Loading..."}
      </p>

      <div className="mt-6 space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Amount</span>
          <span className="font-medium">
            {amount !== undefined
              ? `${formatEther(amount)} USDC`
              : "Loading..."}
          </span>
        </div>

        <div>
          <div className="text-gray-500">Proof hash</div>
          <div className="mt-1 break-all font-mono text-xs">
            {proofHash ?? "Loading..."}
          </div>
        </div>

        {verifier && (
          <div>
            <div className="text-gray-500">Verifier</div>
            <div className="mt-1 break-all font-mono text-xs">
              {verifier}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={verifyAndRelease}
        disabled={!canRelease}
        className="mt-5 w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!isConnected
          ? "Connect verifier wallet"
          : !isVerifier
            ? "Switch to verifier wallet"
            : status !== 2
              ? "Release unavailable"
              : isWriting
                ? "Confirm in wallet..."
                : isConfirming
                  ? "Releasing on Arc..."
                  : isConfirmed
                    ? "Payment released ✓"
                    : "Verify & Release USDC"}
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
