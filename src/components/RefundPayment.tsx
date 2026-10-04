"use client";

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

export default function RefundPayment({
  paymentId,
}: {
  paymentId: bigint;
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

  const payer = payment?.[0];
  const deadline = payment?.[5];
  const status = payment?.[6];

  const isPayer =
    address &&
    payer &&
    isAddressEqual(address, payer);

  const deadlinePassed =
    deadline !== undefined &&
    BigInt(Math.floor(Date.now() / 1000)) > deadline;

  const refundableStatus =
    status === 1 || status === 2;

  const canRefund =
    isConnected &&
    isPayer &&
    refundableStatus &&
    deadlinePassed &&
    !isWriting &&
    !isConfirming;

  function refundPayment() {
    if (!canRefund) return;

    writeContract({
      address: ARC_PROOF_ADDRESS,
      abi: arcProofAbi,
      functionName: "refund",
      args: [paymentId],
    });
  }

  const deadlineText =
    deadline !== undefined
      ? new Date(Number(deadline) * 1000).toLocaleString()
      : "Loading...";

  return (
    <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-emerald-600">
        PAYMENT SAFETY
      </div>

      <h2 className="mt-2 text-xl font-bold">
        Refund protection
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        If payment is not released before the deadline, the payer can
        recover the locked USDC.
      </p>

      <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <div className="text-gray-500">Status</div>
          <div className="mt-1 font-medium">
            {status !== undefined
              ? paymentStatus[Number(status)]
              : "Loading..."}
          </div>
        </div>

        <div>
          <div className="text-gray-500">Deadline</div>
          <div className="mt-1 font-medium">
            {deadlineText}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={refundPayment}
        disabled={!canRefund}
        className="mt-5 w-full rounded-xl border border-gray-300 px-5 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!isConnected
          ? "Connect payer wallet"
          : !isPayer
            ? "Switch to payer wallet"
            : !refundableStatus
              ? status === 4
                ? "Payment already refunded"
                : "Refund unavailable"
              : !deadlinePassed
                ? "Refund available after deadline"
                : isWriting
                  ? "Confirm refund in wallet..."
                  : isConfirming
                    ? "Refunding on Arc..."
                    : isConfirmed
                      ? "Payment refunded ✓"
                      : "Refund locked USDC"}
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
          Refresh refund status
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
