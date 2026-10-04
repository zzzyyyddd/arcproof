import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, parseEther, stringToBytes, zeroHash } from "viem";

describe("ArcProof", async function () {
  const { viem } = await network.connect();

  async function deployFixture() {
    const [payer, recipient, verifier, stranger] =
      await viem.getWalletClients();

    const publicClient = await viem.getPublicClient();
    const arcProof = await viem.deployContract("ArcProof");

    const latestBlock = await publicClient.getBlock();
    const deadline = latestBlock.timestamp + 3600n;

    const amount = parseEther("1");
    const proofHash = keccak256(
      stringToBytes("ipfs://arcproof-demo-delivery"),
    );

    return {
      payer,
      recipient,
      verifier,
      stranger,
      publicClient,
      arcProof,
      deadline,
      amount,
      proofHash,
    };
  }

  async function createPayment() {
    const f = await deployFixture();

    await f.arcProof.write.createPayment(
      [
        f.recipient.account.address,
        f.verifier.account.address,
        f.deadline,
      ],
      {
        account: f.payer.account,
        value: f.amount,
      },
    );

    return f;
  }

  async function submitProof() {
    const f = await createPayment();

    await f.arcProof.write.submitProof(
      [0n, f.proofHash],
      {
        account: f.recipient.account,
      },
    );

    return f;
  }

  it("creates and locks a payment", async function () {
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

    assert.equal(
      payment[2].toLowerCase(),
      f.verifier.account.address.toLowerCase(),
    );

    assert.equal(payment[3], f.amount);
    assert.equal(payment[4], zeroHash);
    assert.equal(payment[5], f.deadline);
    assert.equal(payment[6], 1);
  });

  it("allows recipient to submit proof", async function () {
    const f = await submitProof();
    const payment = await f.arcProof.read.payments([0n]);

    assert.equal(payment[4], f.proofHash);
    assert.equal(payment[6], 2);
  });

  it("rejects proof submission from unauthorized wallet", async function () {
    const f = await createPayment();

    await assert.rejects(
      f.arcProof.write.submitProof(
        [0n, f.proofHash],
        {
          account: f.stranger.account,
        },
      ),
    );

    const payment = await f.arcProof.read.payments([0n]);
    assert.equal(payment[6], 1);
  });

  it("rejects an empty proof hash", async function () {
    const f = await createPayment();

    await assert.rejects(
      f.arcProof.write.submitProof(
        [0n, zeroHash],
        {
          account: f.recipient.account,
        },
      ),
    );
  });

  it("allows verifier to verify and release payment", async function () {
    const f = await submitProof();

    const contractBalanceBefore =
      await f.publicClient.getBalance({
        address: f.arcProof.address,
      });

    assert.equal(contractBalanceBefore, f.amount);

    await f.arcProof.write.verifyAndRelease(
      [0n],
      {
        account: f.verifier.account,
      },
    );

    const payment = await f.arcProof.read.payments([0n]);

    const contractBalanceAfter =
      await f.publicClient.getBalance({
        address: f.arcProof.address,
      });

    assert.equal(payment[6], 3);
    assert.equal(contractBalanceAfter, 0n);
  });

  it("rejects verification from unauthorized wallet", async function () {
    const f = await submitProof();

    await assert.rejects(
      f.arcProof.write.verifyAndRelease(
        [0n],
        {
          account: f.stranger.account,
        },
      ),
    );

    const payment = await f.arcProof.read.payments([0n]);
    assert.equal(payment[6], 2);
  });

  it("cannot release a payment twice", async function () {
    const f = await submitProof();

    await f.arcProof.write.verifyAndRelease(
      [0n],
      {
        account: f.verifier.account,
      },
    );

    await assert.rejects(
      f.arcProof.write.verifyAndRelease(
        [0n],
        {
          account: f.verifier.account,
        },
      ),
    );
  });

  it("allows payer to refund after deadline", async function () {
    const f = await createPayment();

    const testClient = await viem.getTestClient();

    await testClient.setNextBlockTimestamp({
      timestamp: f.deadline + 1n,
    });

    await f.arcProof.write.refund(
      [0n],
      {
        account: f.payer.account,
      },
    );

    const payment = await f.arcProof.read.payments([0n]);

    assert.equal(payment[6], 4);
  });

  it("allows refund after proof submission if deadline expires", async function () {
    const f = await submitProof();

    const testClient = await viem.getTestClient();

    await testClient.setNextBlockTimestamp({
      timestamp: f.deadline + 1n,
    });

    await f.arcProof.write.refund(
      [0n],
      {
        account: f.payer.account,
      },
    );

    const payment = await f.arcProof.read.payments([0n]);

    assert.equal(payment[6], 4);
  });

  it("rejects refund before deadline", async function () {
    const f = await createPayment();

    await assert.rejects(
      f.arcProof.write.refund(
        [0n],
        {
          account: f.payer.account,
        },
      ),
    );
  });

  it("rejects refund from unauthorized wallet", async function () {
    const f = await createPayment();

    const testClient = await viem.getTestClient();

    await testClient.setNextBlockTimestamp({
      timestamp: f.deadline + 1n,
    });

    await assert.rejects(
      f.arcProof.write.refund(
        [0n],
        {
          account: f.stranger.account,
        },
      ),
    );
  });
});
