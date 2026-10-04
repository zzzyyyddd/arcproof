import { createPublicClient, http, formatGwei } from "viem";
import { arc } from "viem/chains";

const client = createPublicClient({
  chain: arc,
  transport: http("https://rpc.mainnet.arc.io"),
});

const chainId = await client.getChainId();
const blockNumber = await client.getBlockNumber();
const gasPrice = await client.getGasPrice();

console.log("=== Arc Mainnet Check ===");
console.log("Chain ID:", chainId);
console.log("Latest block:", blockNumber.toString());
console.log("Gas price:", gasPrice.toString(), "wei");
console.log("Gas price:", formatGwei(gasPrice), "gwei");

if (chainId !== 5042) {
  throw new Error(`Wrong network. Expected 5042, received ${chainId}`);
}

console.log("Arc Mainnet RPC: OK");
