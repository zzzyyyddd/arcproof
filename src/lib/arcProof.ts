export const ARC_PROOF_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

// Temporary zero address.
// Replace with the real Arc Mainnet contract address after deployment.

export const arcProofAbi = [
  {
    type: "function",
    name: "nextPaymentId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "payments",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "payer", type: "address" },
      { name: "recipient", type: "address" },
      { name: "verifier", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "proofHash", type: "bytes32" },
      { name: "deadline", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
  },
  {
    type: "function",
    name: "createPayment",
    stateMutability: "payable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "verifier", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "paymentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "submitProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "paymentId", type: "uint256" },
      { name: "proofHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "verifyAndRelease",
    stateMutability: "nonpayable",
    inputs: [{ name: "paymentId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [{ name: "paymentId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const paymentStatus = [
  "None",
  "Locked",
  "Proof Submitted",
  "Released",
  "Refunded",
] as const;
