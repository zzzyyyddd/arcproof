export const ARC_EXPLORER_URL = "https://explorer.arc.io";

export function arcTxUrl(hash: `0x${string}`) {
  return `${ARC_EXPLORER_URL}/tx/${hash}`;
}

export function arcAddressUrl(address: `0x${string}`) {
  return `${ARC_EXPLORER_URL}/address/${address}`;
}
