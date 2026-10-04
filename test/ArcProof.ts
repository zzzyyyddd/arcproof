import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, parseEther, stringToBytes, zeroHash } from "viem";

describe("ArcProof", async function () {
  const { viem } = await network.connect();

  async function deployFixture() {
    const [payer, recipient, stranger] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();
    const arcProof = await viem.deployContract("ArcProof");

    const latestBlock = await publicClient.getBlock();
    const deadline = latestBlock.timestamp + 3600n;

    const proof = "ARC-PROOF-4821";
    const proofHash = keccak256(stringToBytes(proof));
    const amount = parseEther("1");

    return {
      payer,
      recipient,
      stranger,
      publicClient,
      arcProof,
      deadline,
      proof,
      proofHash,
      amount,
    };
  }

  async function createPayment() {
    const fixture = await deployFixture();

    await fixture.arcProof.write.createPayment(
      [
        fixture.recipient.account.address,
        fixture.proofHash,
        fixture.deadline,
      ],
      {
        account: fixture.payer.account,
        value: fixture.amount,
      },
    );

    return fixture;
  }

  it("locks a payment", async function () {
    const f = await createPayment();
    const payment = await f.arcProof.read.payments([0n]);

    assert.equal(
      payment[0].toLowerCase(),
      f.payer.account.address.toLowerCase(),
    );
    assert.equal(
      payment[1].toLowerCase(),
      f.recipient.account.address.toLowerCase(),
    );
    assert.equal(payment[2], f.amount);
    assert.equal(payment[3], f.proofHash);
    assert.equal(payment[4], f.deadline);
    assert.equal(payment[5], 1);
  });

  it("releases payment when recipient submits correct proof", async function () {
    const f = await createPayment();

    const contractBalanceBefore = await f.publicClient.getBalance({
      address: f.arcProof.address,
    });

    assert.equal(contractBalanceBefore, f.amount);

    await f.arcProof.write.submitProof([0n, f.proof], {
      account: f.recipient.account,
    });

    const contractBalanceAfter = await f.publicClient.getBalance({
      address: f.arcProof.address,
    });

    const payment = await f.arcProof.read.payments([0n]);

    assert.equal(payment[5], 2);
    assert.equal(contractBalanceAfter, 0n);
  });

  it("rejects an incorrect proof", async function () {
    const f = await createPayment();

    await assert.rejects(
      f.arcProof.write.submitProof([0n, "WRONG-PROOF"], {
        account: f.recipient.account,
      }),
    );

    const payment = await f.arcProof.read.payments([0n]);
    assert.equal(payment[5], 1);
  });

  it("rejects proof submission from an unauthorized wallet", async function () {
    const f = await createPayment();

    await assert.rejects(
      f.arcProof.write.submitProof([0n, f.proof], {
        account: f.stranger.account,
      }),
    );

    const payment = await f.arcProof.read.payments([0n]);
    assert.equal(payment[5], 1);
  });

  it("prevents a payment from being released twice", async function () {
    const f = await createPayment();

    await f.arcProof.write.submitProof([0n, f.proof], {
      account: f.recipient.account,
    });

    await assert.rejects(
      f.arcProof.write.submitProof([0n, f.proof], {
        account: f.recipient.account,
      }),
    );
  });

  it("refunds payer after deadline", async function () {
    const f = await createPayment();

    await viem.getTestClient().then((client) =>
      client.setNextBlockTimestamp({
        timestamp: f.deadline + 1n,
      }),
    );

    await f.arcProof.write.refund([0n], {
      account: f.payer.account,
    });

    const payment = await f.arcProof.read.payments([0n]);
    assert.equal(payment[5], 3);
  });

  it("rejects refund from an unauthorized wallet", async function () {
    const f = await createPayment();

    await viem.getTestClient().then((client) =>
      client.setNextBlockTimestamp({
        timestamp: f.deadline + 1n,
      }),
    );

    await assert.rejects(
      f.arcProof.write.refund([0n], {
        account: f.stranger.account,
      }),
    );

    const payment = await f.arcProof.read.payments([0n]);
    assert.equal(payment[5], 1);
  });

  it("rejects an empty proof hash", async function () {
    const f = await deployFixture();

    await assert.rejects(
      f.arcProof.write.createPayment(
        [
          f.recipient.account.address,
          zeroHash,
          f.deadline,
        ],
        {
          account: f.payer.account,
          value: f.amount,
        },
      ),
    );
  });
});
