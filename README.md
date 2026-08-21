# Gavel

Agents ship the work. Gavel rules on it.

Gavel is pay per result escrow for agent to agent work on X Layer. A buyer locks native OKB and commits a grading rubric before the job starts. A seller delivers an artifact hash. An independent judge reveals the rubric, signs the verdict, and the contract pays the seller or refunds the buyer.

## What is included

- `contracts/GavelEscrow.sol`, the Solidity 0.8.20 escrow with rubric precommit, signed rulings, timeout reclaim and receipt events
- `test/gavel.test.ts`, six Hardhat tests covering approval, refund, tampering, judge authentication and both timeout paths
- `judge/judge.ts`, a Groq evaluator using its OpenAI-compatible API with a deterministic local evaluator when no Groq key is configured
- `agents/`, buyer and seller demo flows for a valid and invalid delivery
- `mcp/server.ts`, stdio MCP tools for `create_job`, `get_job`, `deliver` and `request_ruling`
- `dashboard/`, the React, Vite, Tailwind and wagmi landing page plus wallet-gated jobs interior

## Local setup

Requires Node.js 18 or newer.

```bash
npm install
cd dashboard && npm install && cd ..
copy .env.example .env
npm test
npm run dashboard:build
```

The dashboard works without a contract address and shows the recorded demo receipt surface. Set `dashboard/.env` with `VITE_CONTRACT_ADDRESS` when a testnet deployment is available.

## Testnet deployment

Fund separate buyer, seller, judge and relayer wallets with testnet OKB. Keep private keys in `.env` only.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network xlayer_testnet
```

Set `CONTRACT_ADDRESS` to the confirmed deployment and set `JUDGE_KEY`, `RELAYER_KEY`, `BUYER_KEY` and `SELLER_KEY`. Set `GROQ_API_KEY` for model-backed rulings. The default model is `openai/gpt-oss-120b` through `https://api.groq.com/openai/v1`. The X Layer Testnet explorer is [OKLink](https://www.oklink.com/xlayer-test). The network uses chain id 1952 and OKB as its gas token.

Run the demo sequence after deployment:

```bash
npm run buyer
JOB_ID=1 npm run seller
JOB_ID=1 npm run judge
JOB_ID=2 npm run seller:bad
JOB_ID=2 npm run judge
```

The judge writes rubric, verdict and transcript receipts to `runs/job-{id}`. The MCP server starts with:

```bash
npm run mcp
```

## Dashboard

```bash
npm run dashboard:dev
```

The app is wallet gated at `/app` and `/app/job/:id`. Configure `VITE_CONTRACT_ADDRESS` in `dashboard/.env` for read-side contract polling. Vercel rewrites are included for deep-link refreshes.

## Submission

Project: Gavel
Tagline: Agents ship the work. Gavel rules on it.
Track: Build X Series AI Season, agent track
Network: X Layer Testnet during the hackathon, Mainnet after

Demo video: record the two-run sequence from the confirmed testnet receipts before submitting. Embed the final public video URL in this README and the hackathon form. The repository does not invent a video URL or a contract address before those external steps are complete.

## Safety

V1 escrows native OKB and charges no protocol fee. Never commit private keys. Judge and relayer keys should hold testnet funds only. A Mainnet deployment needs an audit, secret management and human review above the chosen settlement threshold.
