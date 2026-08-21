// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// Gavel, pay per result escrow for agent to agent work
/// the rubric is committed before work starts and revealed at ruling time
/// so the goalposts can never move, every state change emits a receipt
contract GavelEscrow {
    enum Status { Open, Accepted, Delivered, Paid, Refunded }

    struct Job {
        address buyer;
        address seller;
        uint256 amount;
        bytes32 specHash;
        bytes32 rubricCommit;
        bytes32 artifactHash;
        string  artifactURI;
        Status  status;
        uint64  deliveryDeadline;
        uint64  rulingWindow;
        uint64  rulingDeadline;
    }

    bytes32 public constant RULING_DOMAIN = keccak256("GavelV1");

    address public immutable judge;
    uint256 public nextJobId = 1;
    mapping(uint256 => Job) private jobs_;

    event JobCreated(uint256 indexed jobId, address indexed buyer, uint256 amount, bytes32 specHash, bytes32 rubricCommit);
    event JobAccepted(uint256 indexed jobId, address indexed seller);
    event Delivered(uint256 indexed jobId, bytes32 artifactHash, string artifactURI);
    event Ruled(uint256 indexed jobId, bool approved, bytes32 rubricHash, bytes32 salt);
    event Refunded(uint256 indexed jobId, string reason);

    constructor(address judge_) {
        judge = judge_;
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs_[jobId];
    }

    /// buyer locks payment and commits to spec hash plus rubric hash
    /// rubricCommit = keccak256(abi.encodePacked(keccak256(rubric), salt))
    function createJob(
        bytes32 specHash,
        bytes32 rubricCommit,
        uint64 deliveryWindow,
        uint64 rulingWindow
    ) external payable returns (uint256) {
        require(msg.value > 0, "empty escrow");
        uint256 jobId = nextJobId++;
        Job storage j = jobs_[jobId];
        j.buyer = msg.sender;
        j.amount = msg.value;
        j.specHash = specHash;
        j.rubricCommit = rubricCommit;
        j.deliveryDeadline = uint64(block.timestamp) + deliveryWindow;
        j.rulingWindow = rulingWindow;
        j.status = Status.Open;
        emit JobCreated(jobId, msg.sender, msg.value, specHash, rubricCommit);
        return jobId;
    }

    function accept(uint256 jobId) external {
        Job storage j = jobs_[jobId];
        require(j.status == Status.Open, "not open");
        require(block.timestamp < j.deliveryDeadline, "window closed");
        j.seller = msg.sender;
        j.status = Status.Accepted;
        emit JobAccepted(jobId, msg.sender);
    }

    function deliver(uint256 jobId, bytes32 artifactHash, string calldata artifactURI) external {
        Job storage j = jobs_[jobId];
        require(j.status == Status.Accepted, "not accepted");
        require(msg.sender == j.seller, "not seller");
        require(block.timestamp < j.deliveryDeadline, "late");
        j.artifactHash = artifactHash;
        j.artifactURI = artifactURI;
        j.status = Status.Delivered;
        j.rulingDeadline = uint64(block.timestamp) + j.rulingWindow;
        emit Delivered(jobId, artifactHash, artifactURI);
    }

    /// judge reveals rubric and salt, contract verifies the commitment,
    /// verifies the signature over job id, artifact hash and verdict,
    /// approve pays the seller, reject refunds the buyer
    function rule(
        uint256 jobId,
        bytes calldata rubric,
        bytes32 salt,
        bool approve,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Job storage j = jobs_[jobId];
        require(j.status == Status.Delivered, "nothing to rule on");
        require(block.timestamp < j.rulingDeadline, "ruling window closed");
        require(keccak256(abi.encodePacked(keccak256(rubric), salt)) == j.rubricCommit, "rubric mismatch");
        bytes32 payload = keccak256(abi.encodePacked(RULING_DOMAIN, bytes32(jobId), j.artifactHash, approve ? uint8(1) : uint8(0)));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", payload));
        address recovered = ecrecover(digest, v, r, s);
        require(recovered == judge, "not the judge");
        if (approve) {
            j.status = Status.Paid;
            _pay(j.seller, j.amount);
        } else {
            j.status = Status.Refunded;
            _pay(j.buyer, j.amount);
        }
        emit Ruled(jobId, approve, keccak256(rubric), salt);
    }

    /// safety valve, seller ghosted or judge went offline
    function reclaim(uint256 jobId) external {
        Job storage j = jobs_[jobId];
        require(msg.sender == j.buyer, "buyer only");
        if (j.status == Status.Open || j.status == Status.Accepted) {
            require(block.timestamp >= j.deliveryDeadline, "too early");
        } else if (j.status == Status.Delivered) {
            require(block.timestamp >= j.rulingDeadline, "too early");
        } else {
            revert("job finished");
        }
        j.status = Status.Refunded;
        _pay(j.buyer, j.amount);
        emit Refunded(jobId, "timeout");
    }

    function _pay(address to, uint256 amount) private {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "pay failed");
    }
}
