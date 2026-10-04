import { createPublicClient, http, formatEther } from "viem";
import { arc } from "viem/chains";
import artifact from "../artifacts/contracts/ArcProof.sol/ArcProof.json" with { type: "json" };

const deployer = process.argv[2] as `0x${string}` | undefined;

if (!deployer) {
  throw new Error(
    "Usage: npx tsx scripts/estimate-deploy.ts 0xYOUR_WALLET_ADDRESS"
  );
}

const client = createPublicClient({
  chain: arc,
  transport: http("https://rpc.mainnet.arc.io"),
});

const [gas, gasPrice] = await Promise.all([
  client.estimateGas({
    account: deployer,
    data: artifact.bytecode as `0x${string}`,
  }),
  client.getGasPrice(),
]);

const estimatedCost = gas * gasPrice;
const bufferedGas = (gas * 120n) / 100n;
const bufferedCost = bufferedGas * gasPrice;

console.log("=== ArcProof Deployment Estimate ===");
console.log("Gas estimate:", gas.toString());
console.log("Gas price:", gasPrice.toString(), "wei");
console.log("Estimated cost:", formatEther(estimatedCost), "USDC");
console.log("20% safety buffer:", formatEther(bufferedCost), "USDC");
