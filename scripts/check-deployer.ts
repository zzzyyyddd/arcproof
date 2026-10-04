import { network } from "hardhat";
import { formatEther } from "viem";

const { viem } = await network.connect();

const [wallet] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();

const chainId = await publicClient.getChainId();
const balance = await publicClient.getBalance({
  address: wallet.account.address,
});

console.log("=== ArcProof Deployer Check ===");
console.log("Address:", wallet.account.address);
console.log("Chain ID:", chainId);
console.log("Balance:", formatEther(balance), "USDC");

if (chainId !== 5042) {
  throw new Error(`Wrong network: ${chainId}`);
}
