# Gavel — App Blueprint

## Product Summary

Gavel is AI judged escrow for agent to agent payments on X Layer. A buyer agent creates a job, commits a payment and a hashed rubric onchain, a seller agent delivers work, then an independent judge model scores the deliverable against the revealed rubric. The GavelEscrow contract verifies that the revealed rubric matches the original commitment and that the verdict carries the judge signature, then settles. Approved work pays the seller, rejected work refunds the buyer, and either way the ruling is emitted as a permanent onchain receipt.

The core insight is the rubric precommit. Payment rails for agents already exist. Verifying delivered work is the missing layer, and it only has integrity if the standard cannot change after the work is done. Gavel hashes the rubric plus a salt at job creation and the contract refuses any ruling graded against a different rubric.

Built for the Build X Series AI Season Hackathon on X Layer. Testnet during the hackathon, Mainnet launch after.

---

## Market Context

**Who this is for:**

1. Agent developers who hire other agents through MCP markets and have no recourse when the output is garbage
2. Agent service providers who need provable quality signals to win work over cheaper rivals
3. Marketplaces and frameworks that need a neutral settlement rail with built in dispute resolution

**What they currently use:** trust, reputation scores maintained by the platform, or escrow released by the counterparty. None of these let a stranger agent hire a stranger agent without a platform in the middle holding both the money and the judgement.

**Why they switch:** pay per result instead of pay per call. The seller earns faster because instant judgement removes the dispute window, the buyer risks nothing because a failed rubric means an automatic refund, and both sides get an onchain receipt that compounds into reputation.

---

## MVP Feature Set

### Feature 1: GavelEscrow contract

**User story:** As a buyer agent I want my payment and my grading standard locked onchain before work starts so that neither side can move the goalposts.

**How it works:** createJob stores the escrow value, the spec hash, the rubric commitment and a delivery window. accept locks the seller. deliver stores the artifact hash. rule verifies the revealed rubric against the commitment, verifies the judge signature over job id, artifact hash and verdict, then pays or refunds. reclaim is the timeout safety valve.

**Acceptance criteria:** all state transitions emit events, a tampered rubric reverts, a wrong judge signature reverts, late delivery reverts, both timeout paths refund the buyer, six Hardhat tests pass.

**Complexity:** Medium

### Feature 2: Judge service

**User story:** As either agent I want an independent machine ruling on the delivered work so that neither of us adjudicates our own dispute.

**How it works:** the service watches Delivered events, loads the rubric and salt it stored at job creation, fetches the artifact, prompts the LLM at temperature zero with a binary checklist, signs the verdict digest and submits the ruling transaction through a relayer key.

**Acceptance criteria:** verdict json prints as a readable checklist, ruling lands onchain within 20 seconds of delivery, full transcript saved to the run folder as a receipt.

**Complexity:** Medium

### Feature 3: Demo agents

**User story:** As a judge watching the demo I want to see the rail approve real work and reject junk so that I know the judge is not theatre.

**How it works:** buyer.ts creates a headline writing job with a five item rubric. seller.ts fulfils it with an LLM. seller-bad.ts submits lorem ipsum. The judge approves the first and refunds the second.

**Acceptance criteria:** two runs, one APPROVED with payment moving to the seller, one REFUNDED with the buyer made whole, both visible on the explorer.

**Complexity:** Low

### Feature 4: MCP server

**User story:** As an agent framework operator I want Gavel as a set of MCP tools so that my agents can hire verified work without custom integration.

**How it works:** stdio server exposing create_job, get_job, deliver and request_ruling. Any MCP client can join the rail.

**Acceptance criteria:** one real job created through an external MCP client lands onchain.

**Complexity:** Medium

### Feature 5: Dashboard

**User story:** As an observer I want to watch jobs move through their lifecycle so that the product proves itself without narration.

**How it works:** wallet gated interior reading contract events, job cards with lifecycle timeline, rubric reveal at ruling, verdict checklist, balance ticks, explorer links.

**Acceptance criteria:** a job card animates through its states live during the demo recording.

**Complexity:** Medium

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Contracts | Solidity 0.8.20, Hardhat | X Layer is EVM, standard tooling, oklink verification plugin |
| Chain | X Layer Testnet, chain id 1952 | Hackathon requirement, OKB gas, near zero fees |
| Frontend | React 18, Vite, TypeScript | Single page plus interior, static deploy, fastest path in one day. Chosen over Next.js because there is no SSR or SEO requirement and the SPA rewrite pattern is fully specified |
| Wallet | wagmi + viem | Best EVM library pair, injected OKX Wallet and MetaMask |
| Judge | Node 18, TypeScript, OpenAI compatible API | One small service, signs with ethers v6 |
| MCP | @modelcontextprotocol/sdk | The standard agent surface |
| Styling | Tailwind CSS v3 | Utility first, exact spec classes |
| Motion | motion/react | Current package name, blur-in entrances |

X Layer Testnet: rpc https://testrpc.xlayer.tech, chain id 1952, explorer https://www.oklink.com/xlayer-test, faucet https://www.okx.com/xlayer/faucet. Fund three wallets from the faucet, buyer, seller, judge plus relayer.

---

## Smart Contract

```solidity
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
        uint256 jobId = nextJob++;
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
```

Ruling digest computed offchain:

```text
payload = keccak256(concat(RULING_DOMAIN, uint256ToBytes32(jobId), artifactHash, approve ? 0x01 : 0x00))
digest  = keccak256(concat("\x19Ethereum Signed Message:\n32", payload))
sig     = judgeWallet.signMessage(digest)
```

---

## Judge Prompt

System: you are a strict neutral evaluator, you receive a rubric of binary checks and a deliverable, answer only with json of the form {"pass": boolean, "results": [{"item": string, "ok": boolean, "note": string}], "summary": string}

User: RUBRIC followed by the checklist, DELIVERABLE followed by the artifact text

Temperature zero, one retry on parse failure, transcript saved per job to the run folder.

Demo rubric, five binary checks: exactly five headlines, brand name Somno appears, every headline is eight words or fewer, no medical claims, each headline is a complete phrase.

---

## MCP Tools

| Tool | Input | Output |
|---|---|---|
| create_job | spec, rubric items, amount in okb | job id plus explorer link |
| get_job | job id | status, amounts, deadlines, links |
| deliver | job id, artifact text | artifact hash plus tx link |
| request_ruling | job id | judge verdict json |

---

## Environment Variables

```
RPC_URL=https://testrpc.xlayer.tech
CHAIN_ID=1952
CONTRACT_ADDRESS=
JUDGE_KEY=
RELAYER_KEY=
BUYER_KEY=
SELLER_KEY=
GROQ_API_KEY=
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=openai/gpt-oss-120b
```

Keys live in .env which is gitignored. Judge and relayer keys are hot wallets holding testnet OKB only. Before any Mainnet launch the keys move to a secrets manager and rulings above a threshold require human review.

---

## Fees and Treasury

V1 charges no protocol fee, the escrow amount passes through in full. Post hackathon a fee in basis points routes to a treasury EOA at settlement, stored as an environment variable, never hardcoded. Contracts should be audited before the Mainnet fee switch is enabled.

---

## Routes

Landing page at / with no client side routing beyond anchors. App interior behind ProtectedRoute: /app for the jobs board, /app/job/:id for detail. SPA rewrites handled by vercel.json.

---

## What Is Not Being Built in MVP

- Judge committee, v1 is one operator key constrained by the precommit
- Onchain fee collection
- Receipt NFTs and reputation scores
- Fiat or stablecoin escrow, v1 escrows native OKB
- Appeals process

---

## Build Priority

Deadline is August 21 2026 at 23:59 UTC.

1. Contract, tests green, deployed to X Layer Testnet
2. Judge service ruling a mocked delivery end to end
3. Buyer and both sellers, two runs settled onchain
4. Landing page deployed
5. Dashboard interior reading live events
6. MCP server, one external client call creates a real job
7. Demo video recorded, README, X post, Google Form submitted
