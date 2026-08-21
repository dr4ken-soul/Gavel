# Gavel — Build Guide

## Before You Write a Single Line of Code

Read CLAUDE.md, APP_BLUEPRINT.md and FRONTEND_SPEC.md in full. CLAUDE.md holds the design system and code rules. APP_BLUEPRINT.md holds the contract, the judge design and the MCP tools. FRONTEND_SPEC.md holds every class, animation value and z index. This guide tells you the order.

The submission deadline is August 21 2026 at 23:59 UTC. Work the phases in order and do not polish a later phase before an earlier one passes its acceptance criteria.

---

## Prerequisites

```bash
node --version   # 18 or higher
npm --version    # 9 or higher
```

Fund three or four wallets with testnet OKB from https://www.okx.com/xlayer/faucet, up to 0.2 OKB per claim, buyer, seller, judge plus relayer. Do this first, the faucet can rate limit.

---

## Phase 1 — Contract

### 1.1 Scaffold

```bash
mkdir gavel && cd gavel && git init && npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node
npx hardhat init
mkdir -p contracts scripts test judge agents mcp dashboard
```

### 1.2 Contract

Create `contracts/GavelEscrow.sol` with the full source from APP_BLUEPRINT.md, unchanged.

### 1.3 Config

`hardhat.config.ts`:

```ts
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    hardhat: {},
    xlayer_testnet: {
      url: process.env.RPC_URL ?? 'https://testrpc.xlayer.tech',
      chainId: 1952,
      accounts: [process.env.DEPLOYER_KEY ?? ''],
    },
  },
}

export default config
```

### 1.4 Tests

`test/gavel.test.ts`, six cases minimum: happy path pays the seller, reject path refunds the buyer, tampered rubric reverts with rubric mismatch, wrong judge signature reverts, late delivery reverts, both timeout reclaims refund the buyer.

Acceptance: `npx hardhat test` green.

### 1.5 Deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network xlayer_testnet
```

Save the address to .env as CONTRACT_ADDRESS. Verify on oklink with the @okxweb3/hardhat-explorer-verify plugin if time allows, it is not a blocker.

---

## Phase 2 — Judge service

`judge/judge.ts`:

1. Poll getJob every 4 seconds for Delivered status
2. Load rubric, salt and artifact from the local run folder
3. Call the LLM with the system and user prompt from APP_BLUEPRINT.md, temperature 0, retry once on parse failure
4. Compute payload and digest exactly as the contract does
5. Sign with the judge wallet, submit rule through the relayer
6. Print the verdict checklist to the terminal line by line, approve lines in green, failures in red
7. Write rubric, salt, verdict json and the full transcript to the run folder

Acceptance: rules a hand mocked delivered job end to end and the contract pays out.

---

## Phase 3 — Agents

`agents/buyer.ts`, `agents/seller.ts`, `agents/seller-bad.ts` per APP_BLUEPRINT.md.

Acceptance: run 1 settles APPROVED with the seller balance up, run 2 settles REFUNDED with the buyer whole, both tx hashes open on oklink.

Record the real numbers from these runs, they feed the metrics strip and the ticker.

---

## Phase 4 — MCP server

`mcp/server.ts` with @modelcontextprotocol/sdk, stdio transport, the four tools from APP_BLUEPRINT.md.

Acceptance: an external MCP client creates job 47 plus onchain through one tool call.

---

## Phase 5 — Landing page

### 5.1 Scaffold

```bash
cd dashboard
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install motion lucide-react wagmi viem @paper-design/shaders-react
```

### 5.2 Tailwind config

Map the Verdict Ink tokens into the theme, font families Cormorant Garamond, IBM Plex Sans, IBM Plex Mono, colours bg, accent, text, verdict.

### 5.3 globals.css

Tailwind directives, the :root variable block from CLAUDE.md, the scrollbar hide rules, the ticker keyframes, the hero weight shift block with its @supports guard, `.t-approve` and `.t-refund` helpers, skeleton shimmer keyframes, the technical grid background utility. No unlayered star reset, Tailwind preflight handles it, an unlayered `*` reset kills every spacing utility under Tailwind v4 cascade rules.

### 5.4 Components in order

GrainOverlay, FadeIn, WavesBackground, useScrollReveal hook, Nav, Hero, Metrics, HowItWorks, RubricStatement, VerdictTerminals, McpSection, FinalCta, Footer. Every class and animation value comes from FRONTEND_SPEC.md, do not paraphrase, `rounded-[8px]` means `rounded-[8px]`.

Acceptance: full page scroll in order, every section blurs in, scrolls back up, returns, and reveals again.

---

## Phase 6 — App interior

WalletConnectModal, ProtectedRoute, disconnect toast, AppNav with the wallet dropdown, Jobs bento board, JobDetail with the lifecycle stepper and rubric reveal. Wagmi config with the X Layer Testnet chain object and injected connectors.

Run the six refresh acceptance tests from FRONTEND_SPEC.md against the production deployment, not the dev server.

Acceptance: a live job card animates through its states while the demo agents run.

---

## Phase 7 — Quality audit

**Product:**
- Two runs settle onchain, numbers in the metrics strip match the real run data
- Ticker shows real rulings or the honest fallback line
- Explorer links resolve

**Frontend, from Step 15 and Step 16:**
- Every whileInView is once false with amount 0.1
- Every entrance includes filter blur
- No hardcoded hex in components
- Focus rings visible on every interactive element
- Contrast 4.5 to 1 on body text, 3 to 1 on large text
- Touch targets 44px minimum
- Empty, loading and error states present in the interior
- Reduced motion respected
- Deep link refresh passes all six wallet tests
- No horizontal overflow at 390px

**Copy:**
- British English, no em dashes anywhere, grep the repo for the em dash character and confirm zero hits
- No banned words, no vanity numbers, no placeholder names

**Submission:**
- Public repo, README with the embedded demo video and the contract address
- X post from the project account mentioning @XLayerOfficial, drafts in MARKETING.md
- Google Form submitted before 23:59 UTC
- Testnet deployment live, Mainnet launch noted as the next step
