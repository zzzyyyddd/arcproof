// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title ArcProof
/// @notice Proof-verified native USDC payments on Arc.
contract ArcProof {
    enum Status {
        None,
        Locked,
        Released,
        Refunded
    }

    struct Payment {
        address payer;
        address recipient;
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
        uint256 amount,
        bytes32 proofHash,
        uint256 deadline
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
    error InvalidProofHash();
    error InvalidDeadline();
    error Unauthorized();
    error PaymentNotLocked();
    error InvalidProof();
    error DeadlinePassed();
    error DeadlineNotReached();
    error TransferFailed();

    /// @notice Lock native USDC against a proof hash.
    function createPayment(
        address recipient,
        bytes32 proofHash,
        uint256 deadline
    ) external payable returns (uint256 paymentId) {
        if (msg.value == 0) revert ZeroValue();
        if (recipient == address(0)) revert InvalidRecipient();
        if (proofHash == bytes32(0)) revert InvalidProofHash();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        paymentId = nextPaymentId++;

        payments[paymentId] = Payment({
            payer: msg.sender,
            recipient: recipient,
            amount: msg.value,
            proofHash: proofHash,
            deadline: deadline,
            status: Status.Locked
        });

        emit PaymentCreated(
            paymentId,
            msg.sender,
            recipient,
            msg.value,
            proofHash,
            deadline
        );
    }

    /// @notice Reveal the secret proof and release payment if it matches.
    function submitProof(
        uint256 paymentId,
        string calldata proof
    ) external {
        Payment storage payment = payments[paymentId];

        if (payment.status != Status.Locked) revert PaymentNotLocked();
        if (msg.sender != payment.recipient) revert Unauthorized();
        if (block.timestamp > payment.deadline) revert DeadlinePassed();

        bytes32 submittedHash = keccak256(bytes(proof));

        if (submittedHash != payment.proofHash) revert InvalidProof();

        payment.status = Status.Released;

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

    /// @notice Refund payer after deadline if no valid proof was submitted.
    function refund(uint256 paymentId) external {
        Payment storage payment = payments[paymentId];

        if (payment.status != Status.Locked) revert PaymentNotLocked();
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
