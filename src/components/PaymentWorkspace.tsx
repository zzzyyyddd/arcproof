"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import SubmitProof from "@/components/SubmitProof";
import VerifyRelease from "@/components/VerifyRelease";
import RefundPayment from "@/components/RefundPayment";
import {
  ARC_PROOF_ADDRESS,
  arcProofAbi,
} from "@/lib/arcProof";

function getInitialPaymentId() {
  if (typeof window === "undefined") return 0n;

  const value = new URLSearchParams(window.location.search).get("payment");

  if (!value || !/^\d+$/.test(value)) return 0n;

  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

export default function PaymentWorkspace() {
  const [paymentId, setPaymentId] = useState<bigint | null>(null);
  const [paymentIdInput, setPaymentIdInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initial = getInitialPaymentId();
    setPaymentId(initial);
    setPaymentIdInput(initial.toString());
  }, []);

  const {
    data: nextPaymentId,
    isLoading,
    refetch,
  } = useReadContract({
    address: ARC_PROOF_ADDRESS,
    abi: arcProofAbi,
    functionName: "nextPaymentId",
  });

  function selectPayment(id: bigint) {
    setPaymentId(id);
    setPaymentIdInput(id.toString());

    const url = new URL(window.location.href);
    url.searchParams.set("payment", id.toString());
    window.history.replaceState({}, "", url);

    refetch();
  }

  function loadPayment() {
    setError("");

    const value = paymentIdInput.trim();

    if (!/^\d+$/.test(value)) {
      setError("Enter a valid payment ID.");
      return;
    }

    try {
      selectPayment(BigInt(value));
    } catch {
      setError("Enter a valid payment ID.");
    }
  }

  if (paymentId === null) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading payment workspace...
        </div>
      </section>
    );
  }

  const paymentExists =
    nextPaymentId !== undefined &&
    paymentId < nextPaymentId;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl border border-gray-200 bg-gray-50 p-6">
          <div className="text-sm font-medium text-emerald-600">
            PAYMENT WORKSPACE
          </div>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                Payment ID
              </label>

              <input
                value={paymentIdInput}
                onChange={(e) => setPaymentIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadPayment();
                }}
                inputMode="numeric"
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <button
              type="button"
              onClick={loadPayment}
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              Load Payment
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            {isLoading
              ? "Reading Arc Mainnet..."
              : paymentExists
                ? `Viewing Payment #${paymentId.toString()}`
                : `Payment #${paymentId.toString()} does not exist`}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500">
            Loading payment from Arc Mainnet...
          </div>
        ) : paymentExists ? (
          <div key={paymentId.toString()}>
            <div className="grid gap-6 lg:grid-cols-2">
              <SubmitProof paymentId={paymentId} />
              <VerifyRelease paymentId={paymentId} />
            </div>

            <RefundPayment paymentId={paymentId} />
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <div className="text-lg font-semibold">
              Payment #{paymentId.toString()} not found
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Create a new payment above or enter an existing ArcProof payment ID.
            </p>

            {nextPaymentId !== undefined && nextPaymentId > 0n && (
              <button
                type="button"
                onClick={() => selectPayment(nextPaymentId - 1n)}
                className="mt-5 rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium"
              >
                Open latest payment #{(nextPaymentId - 1n).toString()}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
