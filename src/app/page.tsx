import ConnectWallet from "@/components/ConnectWallet";
import CreatePayment from "@/components/CreatePayment";
import PaymentWorkspace from "@/components/PaymentWorkspace";
import { ARC_PROOF_ADDRESS } from "@/lib/arcProof";
import { arcAddressUrl } from "@/lib/explorer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <div className="text-xl font-bold">ArcProof</div>
          <div className="text-xs text-gray-500">
            Proof-verified payments on Arc
          </div>
        </div>

        <ConnectWallet />
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_480px] lg:items-start">
        <div className="pt-8">
          <div className="mb-6">
            <div className="inline-flex rounded-full border px-4 py-2 text-sm">
              Arc Mainnet · Chain ID 5042
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Contract:{" "}
              <a
                href={arcAddressUrl(ARC_PROOF_ADDRESS)}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-medium text-emerald-600 hover:underline"
              >
                {ARC_PROOF_ADDRESS.slice(0, 8)}...
                {ARC_PROOF_ADDRESS.slice(-6)} ↗
              </a>
            </div>
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight lg:text-6xl">
            Don&apos;t trust completion.
            <br />
            Verify it. Then pay.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Lock USDC on Arc, let the recipient submit proof of delivery,
            and release payment only after verification.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-400">01</div>
              <div className="mt-2 font-semibold">Lock</div>
              <div className="mt-1 text-xs text-gray-500">
                Fund payment
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-400">02</div>
              <div className="mt-2 font-semibold">Prove</div>
              <div className="mt-1 text-xs text-gray-500">
                Submit delivery
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-400">03</div>
              <div className="mt-2 font-semibold">Release</div>
              <div className="mt-1 text-xs text-gray-500">
                Verify & pay
              </div>
            </div>
          </div>
        </div>

        <CreatePayment />
      </section>

      <PaymentWorkspace />
    </main>
  );
}
