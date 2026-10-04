// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title ArcProof
/// @notice Proof-verified native USDC payments on Arc.
contract ArcProof {
    enum Status {
        None,
        Locked,
        ProofSubmitted,
        Released,
        Refunded
    }

    struct Payment {
        address payer;
        address recipient;
        address verifier;
        uint256 amount;
        bytes32 proofHash;
        uint256 deadline;
        Status status;
    }

    uint256 public nextPaymentId;

    mapping(uint256 => Payment) public payments;

    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed payer,
        address indexed recipient,
        address verifier,
        uint256 amount,
        uint256 deadline
    );

    event ProofSubmitted(
        uint256 indexed paymentId,
        address indexed recipient,
        bytes32 proofHash
    );

    event PaymentVerified(
        uint256 indexed paymentId,
        address indexed verifier
    );

    event PaymentReleased(
        uint256 indexed paymentId,
        address indexed recipient,
        uint256 amount
    );

    event PaymentRefunded(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    error ZeroValue();
    error InvalidRecipient();
    error InvalidVerifier();
    error InvalidDeadline();
    error InvalidProofHash();
    error InvalidStatus();
    error Unauthorized();
    error DeadlinePassed();
    error DeadlineNotReached();
    error TransferFailed();

    /// @notice Create and fund a proof-verified payment.
    function createPayment(
        address recipient,
        address verifier,
        uint256 deadline
    ) external payable returns (uint256 paymentId) {
        if (msg.value == 0) revert ZeroValue();
        if (recipient == address(0)) revert InvalidRecipient();
        if (verifier == address(0)) revert InvalidVerifier();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        paymentId = nextPaymentId++;

        payments[paymentId] = Payment({
            payer: msg.sender,
            recipient: recipient,
            verifier: verifier,
            amount: msg.value,
            proofHash: bytes32(0),
            deadline: deadline,
            status: Status.Locked
        });

        emit PaymentCreated(
            paymentId,
            msg.sender,
            recipient,
            verifier,
            msg.value,
            deadline
        );
    }

    /// @notice Recipient commits proof of completed work on-chain.
    function submitProof(
        uint256 paymentId,
        bytes32 proofHash
    ) external {
        Payment storage payment = payments[paymentId];

        if (payment.status != Status.Locked) revert InvalidStatus();
        if (msg.sender != payment.recipient) revert Unauthorized();
        if (block.timestamp > payment.deadline) revert DeadlinePassed();
        if (proofHash == bytes32(0)) revert InvalidProofHash();

        payment.proofHash = proofHash;
        payment.status = Status.ProofSubmitted;

        emit ProofSubmitted(
            paymentId,
            payment.recipient,
            proofHash
        );
    }

    /// @notice Verifier approves submitted proof and releases payment.
    function verifyAndRelease(uint256 paymentId) external {
        Payment storage payment = payments[paymentId];

        if (payment.status != Status.ProofSubmitted) revert InvalidStatus();
        if (msg.sender != payment.verifier) revert Unauthorized();
        if (block.timestamp > payment.deadline) revert DeadlinePassed();

        payment.status = Status.Released;

        emit PaymentVerified(paymentId, payment.verifier);

        (bool success, ) = payable(payment.recipient).call{
            value: payment.amount
        }("");

        if (!success) revert TransferFailed();

        emit PaymentReleased(
            paymentId,
            payment.recipient,
            payment.amount
        );
    }

    /// @notice Payer can reclaim funds after the deadline.
    function refund(uint256 paymentId) external {
        Payment storage payment = payments[paymentId];

        if (
            payment.status != Status.Locked &&
            payment.status != Status.ProofSubmitted
        ) revert InvalidStatus();

        if (msg.sender != payment.payer) revert Unauthorized();
        if (block.timestamp <= payment.deadline) revert DeadlineNotReached();

        payment.status = Status.Refunded;

        (bool success, ) = payable(payment.payer).call{
            value: payment.amount
        }("");

        if (!success) revert TransferFailed();

        emit PaymentRefunded(
            paymentId,
            payment.payer,
            payment.amount
        );
    }
}
