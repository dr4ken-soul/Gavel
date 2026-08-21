# Gavel — Agent Context

## What This Is

Gavel is pay per result escrow for the agent economy, built on X Layer. An agent hires another agent, the payment locks in an onchain escrow, and the grading rubric is committed as a hash before any work starts. When the seller delivers, an AI judge inspects the deliverable against that rubric, the contract verifies the commitment and the judge signature, then pays the seller or refunds the buyer. Every ruling emits a permanent receipt.

Agents can already pay each other. Gavel is the accountability layer they are missing.

Built for the Build X Series AI Season Hackathon by X Layer. August 7 to August 21 2026, submissions close August 21 at 23:59 UTC. Total prize pool up to 300,000 USDT. The project deploys on X Layer Testnet during the hackathon and launches on X Layer Mainnet after.

---

## One-Line Pitch

Agents ship the work. Gavel rules on it.

---

## MVP Features

1. GavelEscrow contract, Solidity, locks escrow, stores the rubric commitment, verifies the revealed rubric and the judge signature at ruling time, pays or refunds, emits receipt events
2. Judge service, Node.js, watches Delivered events, scores the artifact against the stored rubric with an LLM at temperature zero, signs the verdict, sends the ruling transaction
3. Demo agents, buyer and two sellers, one good delivery that gets approved and paid, one junk delivery that gets rejected and refunded, the two run demo is the proof the judge is real
4. MCP server, stdio, four tools, create_job, get_job, deliver, request_ruling, so any agent framework can plug into the rail
5. Dashboard, wallet gated app interior on X Layer Testnet, job cards with lifecycle, rubric reveal, verdict checklist, balance movement, explorer links

Post-hackathon: staked judge committee, receipt based reputation scores, marketplace integrations, protocol fee switch.

---

## Stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity 0.8.20 with Hardhat, deployed to X Layer Testnet |
| Wallet connection | wagmi + viem, injected OKX Wallet and MetaMask |
| Judge service | Node.js 18 with TypeScript, OpenAI compatible LLM API |
| MCP server | @modelcontextprotocol/sdk over stdio |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | motion/react |
| Icons | Lucide React |
| Backgrounds | Waves canvas + GrainGradient, coded, no video assets |

X Layer Testnet facts: rpc https://testrpc.xlayer.tech, chain id 195, explorer https://www.oklink.com/xlayer-test, gas token OKB, faucet https://www.okx.com/xlayer/faucet, up to 0.2 testnet OKB per claim. Mainnet is chain id 196 with rpc https://rpc.xlayer.tech.

---

## Project Structure

```
gavel/
├── contracts/
│   └── GavelEscrow.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── gavel.test.ts
├── judge/
│   └── judge.ts
├── agents/
│   ├── buyer.ts
│   ├── seller.ts
│   └── seller-bad.ts
├── mcp/
│   └── server.ts
├── dashboard/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── FadeIn.tsx
│   │   │   │   ├── GrainOverlay.tsx
│   │   │   │   └── WavesBackground.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Nav.tsx
│   │   │   │   └── AppNav.tsx
│   │   │   ├── wallet/
│   │   │   │   ├── WalletConnectModal.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── WalletDropdown.tsx
│   │   │   └── sections/
│   │   │       ├── Hero.tsx
│   │   │       ├── Metrics.tsx
│   │   │       ├── HowItWorks.tsx
│   │   │       ├── RubricStatement.tsx
│   │   │       ├── VerdictTerminals.tsx
│   │   │       ├── McpSection.tsx
│   │   │       ├── FinalCta.tsx
│   │   │       └── Footer.tsx
│   │   ├── app/
│   │   │   ├── Jobs.tsx
│   │   │   └── JobDetail.tsx
│   │   ├── hooks/
│   │   │   ├── useScrollReveal.ts
│   │   │   └── useGavelContract.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vercel.json
│   └── package.json
├── hardhat.config.ts
├── .env
└── README.md
```

---

## Design System

All decisions confirmed through the seven gates. Do not deviate.

**Aesthetic:** Kinetic editorial, type IS the visual, cold ops surfaces, verdict semantics

**Fonts:**
- Display: Cormorant Garamond, variable weight 300 to 700, italic for verdict moments
- Body: IBM Plex Sans
- Mono: IBM Plex Mono for receipts, labels, data, tickers

Load via Google Fonts in index.html:
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

**Colour palette, Verdict Ink:**
```css
--bg-primary:     #0c0e12;
--bg-secondary:   #11141a;
--bg-surface:     #171b22;
--bg-elevated:    #1e232c;
--accent:         #d9a441;
--accent-hover:   #e6b85c;
--accent-glow:    rgba(217, 164, 65, 0.12);
--text-primary:   #e7eaf0;
--text-secondary: #8b93a3;
--text-muted:     #4a5160;
--border-subtle:  rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.09);
--verdict-approve: #3ecf8e;
--verdict-refund:  #ef6a5a;
--success: #3ecf8e;
--error:   #ef6a5a;
--radius-sm: 2px; --radius-md: 4px; --radius-lg: 8px; --radius-xl: 12px;
```

Amber is the brand colour. Green and red belong to verdicts only and never to decoration.

**Nav:** C1 editorial strip, fixed, full width, Gavel wordmark flush left, monospace ruling ticker through the centre, one CTA flush right. See FRONTEND_SPEC.md Section 1.

**Hero:** Off-grid giant type anchored low and left, Cormorant Garamond at clamp scale with a scroll driven weight shift, live ruling receipt card floating right, dual motion background with Waves canvas under a technical grid, ghost word drifting on scroll.

**Backgrounds:** Dual motion sync. Waves canvas in accent amber at low opacity plus GrainGradient, scroll linked ghost layer above, staggered viewport reveal everywhere with replays.

---

## Logo and Favicon

No logo or favicon exists yet. Both stay as comment slots:

```tsx
{/* Logo slot: replace with public/logo.svg once provided */}
```

```html
<!-- Favicon slot: replace with public/favicon.ico once provided -->
```

Never substitute a hardcoded placeholder, an AI generated symbol or an emoji in either slot.

---

## Gavel Contract Integration

The judge address is set once in the constructor. The ruling flow:

```text
payload = keccak256(concat(RULING_DOMAIN, uint256ToBytes32(jobId), artifactHash, approve ? 0x01 : 0x00))
digest  = keccak256(concat("\x19Ethereum Signed Message:\n32", payload))
sig     = judgeWallet.signMessage(digest)
```

The contract reverts unless keccak256(abi.encodePacked(keccak256(rubric), salt)) equals the stored commitment, so the judge can never grade against a rubric the buyer did not commit to. Full contract in APP_BLUEPRINT.md.

---

## Code Rules (follow without exception)

**TypeScript and Node.js:**
- camelCase for all variables and functions
- JSDoc comments on every function and custom hook
- No inline styles in React except CSS variables or motion values that require them
- CSS variables from the design system, never hardcoded hex in component files
- No hardcoded placeholder logos, favicons or icon symbols
- No emoji anywhere in the interface

**Writing rules (all copy, labels, terminal output, comments, README):**
- British English throughout, colour not color in prose
- No em dashes anywhere
- Periods only when necessary, commas only when necessary
- Short direct sentences
- No filler: no seamlessly, no robust, no leverage, no cutting edge, no unlock, no elevate
- Terminal output is minimal and precise, no celebration, no ASCII art
- CTA text is direct: Launch App, Copy command, View on GitHub
- Error messages state the cause and the fix

**Component rules:**
- CSS class hover states only, no onMouseEnter or onMouseLeave styling
- All entrances use blur-in, filter plus opacity plus translate, never plain fadeUp
- whileInView always viewport={{ once: false, amount: 0.1 }}, zero exceptions
- Magnetic hover and tilt use useMotionValue with useSpring, never useState
- Scroll listeners use passive true
- No localStorage or sessionStorage in the landing page

**Never do these:**
- Never hardcode a private key in any file that could be committed
- Never trust an offchain record before the transaction confirms, onchain first
- Never use pure black or pure white
- Never put a wallet dropdown on the landing page, it lives in the app interior only
- Never use JetBrains Mono
- Never ship placeholder data in the demo, run the real agents and use the real numbers

---

## Hackathon Checklist

- Project name: Gavel
- Hackathon: Build X Series AI Season, X Layer
- Submission deadline: August 21 2026, 23:59 UTC, Google Form on the Build X page
- Deploy on X Layer Testnet during the hackathon, plan the Mainnet launch after
- Dedicated X account, active through the project lifetime
- Submission post from the project account mentioning @XLayerOfficial
- Public repo with the demo video embedded in the README
- Demo video maximum 3 minutes, the two run verdict sequence is the centrepiece
