# ArcProof

**Proof-verified USDC payments on Arc.**

> Don't trust completion. Verify it. Then pay.

ArcProof is a lightweight payment escrow protocol built on **Arc Mainnet**. A payer locks native USDC for a recipient, the recipient submits an on-chain proof fingerprint, and an authorized verifier releases the payment only after verifying the exact proof.

No backend, database, admin, or always-on server is required. The settlement logic lives entirely on-chain.

## Live Demo

**[Launch ArcProof](https://arcproof-woad.vercel.app/)**

The production frontend is deployed on Vercel and connects directly to Arc Mainnet.

## Arc Mainnet Deployment

- **Network:** Arc Mainnet
- **Chain ID:** `5042`
- **Asset:** Native USDC
- **Contract:** [`0x417dc5f887a23b82de7f706face8f4d8affa56a8`](https://explorer.arc.io/address/0x417dc5f887a23b82de7f706face8f4d8affa56a8)
- **Explorer:** [Arc Explorer](https://explorer.arc.io)

## The Problem

Many digital payments depend on an off-chain promise:

> "I completed the work. Please pay me."

The payer must either trust that claim or manually coordinate settlement.

ArcProof introduces a simple verification layer between **completion** and **payment**.

## How It Works

```text
Payer
  │
  │ Lock native USDC
  ▼
ArcProof Contract
  │
  │ Payment = Locked
  ▼
Recipient
  │
  │ Submit proof fingerprint
  ▼
Proof Submitted
  │
  │ Exact proof checked by verifier
  ▼
Verifier
  │
  │ Verify + release
  ▼
Recipient receives USDC
  │
  ▼
On-chain settlement receipt
```

### 1. Create Payment

The payer defines:

- recipient
- verifier
- USDC amount
- payment deadline

The native USDC is locked directly in the ArcProof contract.

### 2. Submit Proof

The recipient provides proof of completed delivery.

ArcProof does **not** store the plaintext proof on-chain. The frontend computes a `keccak256` fingerprint and stores only the resulting `bytes32` hash.

The exact proof content can be shared directly with the verifier.

### 3. Verify & Release

The verifier receives the original proof and enters it into ArcProof.

The frontend hashes the supplied proof and compares it with the immutable fingerprint stored on-chain.

If the fingerprints match, the authorized verifier can release the locked USDC to the recipient.

### 4. Refund Protection

If settlement does not happen before the deadline, the payer can recover the locked USDC.

Refund is available when the payment is still:

- `Locked`, or
- `ProofSubmitted`

and the deadline has expired.

## Payment Lifecycle

```text
None
  │
  ▼
Locked
  │
  ├──────── deadline expires ────────► Refunded
  │
  ▼
ProofSubmitted
  │
  ├──────── deadline expires ────────► Refunded
  │
  ▼
Released
```

## Roles

### Payer

Creates the payment, locks native USDC, and can reclaim funds after an expired deadline if settlement has not completed.

### Recipient

Receives the payment and is the only address allowed to submit the proof fingerprint.

### Verifier

Reviews the original proof and is the only address authorized by the contract to release payment.

The verifier can be the payer, an independent third party, or another verification system.

## Security Model

ArcProof keeps the protocol deliberately small.

The smart contract enforces:

- recipient-only proof submission
- verifier-only payment release
- payer-only refund
- deadline enforcement
- non-zero proof fingerprints
- payment state transitions
- prevention of double release
- checks-effects-interactions before native USDC transfers

There is no owner or admin role controlling user payments.

### Proof Integrity

The on-chain contract stores the proof fingerprint:

```text
keccak256(exact proof content)
```

The verifier independently recreates this fingerprint before releasing funds.

The frontend proof comparison is a verification aid. The contract's on-chain authorization boundary remains the designated verifier address.

## On-Chain Receipt

Completed payments expose an on-chain receipt containing:

- payment ID
- settlement status
- amount
- payer
- recipient
- verifier
- deadline
- proof fingerprint
- ArcProof contract

Addresses link directly to Arc Explorer for independent verification.

## Mainnet Evidence

ArcProof has completed real end-to-end settlement flows on Arc Mainnet.

### Payment #0

- **Amount:** `0.0001 USDC`
- **Status:** `Released`
- **Proof fingerprint:** `0xf3b959e0e1277b65471a478ab892be94e2dc04fb7bd72745fe9a768c33e1c62a`

### Payment #1

- **Amount:** `0.0001 USDC`
- **Status:** `Released`
- **Proof fingerprint:** `0x37787779dde6a92d18063bbb096a43cef6f3f9e8def4fdbbdc2eb958b715fb03`
- **Release transaction:** [`0x8779b436e7efb6761dfa25a732a496b3fd9e266befd5496cee2f0b24e7b2d468`](https://explorer.arc.io/tx/0x8779b436e7efb6761dfa25a732a496b3fd9e266befd5496cee2f0b24e7b2d468)

The frontend also rejects mismatched proof content before enabling the release action.

## Smart Contract Tests

The ArcProof contract currently covers **11 passing tests**:

1. creates and locks a payment
2. allows recipient proof submission
3. rejects unauthorized proof submission
4. rejects an empty proof fingerprint
5. allows verifier release
6. rejects unauthorized verification
7. prevents double release
8. allows payer refund after deadline
9. allows refund after proof submission when deadline expires
10. rejects refund before deadline
11. rejects unauthorized refund

Run the production-profile tests with:

```bash
npx hardhat test nodejs --build-profile production
```

## Tech Stack

- **Arc Mainnet**
- **Solidity 0.8.34**
- **Hardhat 3**
- **Next.js**
- **TypeScript**
- **React**
- **wagmi**
- **viem**
- **TanStack Query**
- **Tailwind CSS**
- **Vercel**

## Architecture

```text
Browser / Wallet
      │
      │ wagmi + viem
      ▼
ArcProof Frontend
      │
      │ JSON-RPC
      ▼
Arc Mainnet
      │
      ▼
ArcProof.sol
```

ArcProof does not require a custom backend for its core payment flow.

The browser communicates directly with Arc Mainnet through the connected wallet and public RPC infrastructure.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Run smart contract tests:

```bash
npx hardhat test nodejs --build-profile production
```

## Contract Development

The production Solidity profile targets the `paris` EVM configuration with optimizer enabled.

The deployed ArcProof contract uses native USDC through payable contract calls, so the payment flow does not require ERC-20 approvals.

## Status

ArcProof is a working mainnet prototype built for the Arc ecosystem.

Current functionality:

- [x] Wallet connection
- [x] Arc Mainnet network handling
- [x] Native USDC payment locking
- [x] Recipient proof submission
- [x] On-chain proof fingerprint
- [x] Independent proof matching
- [x] Verifier-authorized release
- [x] Deadline-based payer refund
- [x] Shareable payment workspace
- [x] On-chain settlement receipt
- [x] Arc Explorer integration
- [x] Mainnet end-to-end settlement
- [x] Public Vercel deployment

## License

MIT
