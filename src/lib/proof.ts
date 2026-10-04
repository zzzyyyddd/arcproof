import { keccak256, stringToHex } from "viem";

export function hashProof(proof: string) {
  const normalized = proof.trim();

  if (!normalized) {
    throw new Error("Proof cannot be empty.");
  }

  return keccak256(stringToHex(normalized));
}
