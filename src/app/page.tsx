import ConnectWallet from "@/components/ConnectWallet";
import CreatePayment from "@/components/CreatePayment";
import SubmitProof from "@/components/SubmitProof";
import VerifyRelease from "@/components/VerifyRelease";

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
          <div className="mb-6 inline-flex rounded-full border px-4 py-2 text-sm">
            Arc Mainnet · Chain ID 5042
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

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <SubmitProof paymentId={0n} />
          <VerifyRelease paymentId={0n} />
        </div>
      </section>
    </main>
  );
}
