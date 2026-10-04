import { network } from "hardhat";

const { viem } = await network.connect();

console.log("Deploying ArcProof...");

const arcProof = await viem.deployContract("ArcProof");

console.log("ArcProof deployed!");
console.log("Contract address:", arcProof.address);
