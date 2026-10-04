"use client";

import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import {
  ARC_PROOF_ADDRESS,
  arcProofAbi,
  paymentStatus,
} from "@/lib/arcProof";
import {
  arcAddressUrl,
} from "@/lib/explorer";

export default function SettlementReceipt({
  paymentId,
}: {
  paymentId: bigint;
}) {
  const { data: payment } = useReadContract({
    address: ARC_PROOF_ADDRESS,
    abi: arcProofAbi,
    functionName: "payments",
    args: [paymentId],
  });

  if (!payment) return null;

  const payer = payment[0];
  const recipient = payment[1];
  const verifier = payment[2];
  const amount = payment[3];
  const proofHash = payment[4];
  const deadline = payment[5];
  const status = payment[6];

  if (status !== 3 && status !== 4) {
    return null;
  }

  const deadlineText = new Date(
    Number(deadline) * 1000
  ).toLocaleString();

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
        <div className="text-sm font-medium text-emerald-700">
          ON-CHAIN RECEIPT
        </div>

        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">
            Payment #{paymentId.toString()}
          </h2>

          <div className="text-sm font-semibold text-emerald-700">
            {paymentStatus[Number(status)]} ✓
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Amount
            </div>
            <div className="mt-1 text-lg font-bold">
              {formatEther(amount)} USDC
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Deadline
            </div>
            <div className="mt-1 text-sm font-medium">
              {deadlineText}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Payer
            </div>
            <a
              href={arcAddressUrl(payer)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all font-mono text-xs text-emerald-700 hover:underline"
            >
              {payer} ↗
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Recipient
            </div>
            <a
              href={arcAddressUrl(recipient)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all font-mono text-xs text-emerald-700 hover:underline"
            >
              {recipient} ↗
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Verifier
            </div>
            <a
              href={arcAddressUrl(verifier)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all font-mono text-xs text-emerald-700 hover:underline"
            >
              {verifier} ↗
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Contract
            </div>
            <a
              href={arcAddressUrl(ARC_PROOF_ADDRESS)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all font-mono text-xs text-emerald-700 hover:underline"
            >
              {ARC_PROOF_ADDRESS} ↗
            </a>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-400">
            Proof fingerprint
          </div>

          <div className="mt-2 break-all font-mono text-xs">
            {proofHash}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
          <div className="text-xs text-gray-500">
            Verified on Arc Mainnet · Chain ID 5042
          </div>

          <a
            href={arcAddressUrl(ARC_PROOF_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            Verify on Arc Explorer ↗
          </a>
        </div>
      </div>
    </div>
  );
}
