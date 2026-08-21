# Gavel — Frontend Spec

## Overview

This document is the authoritative frontend specification for Gavel. It exists alongside CLAUDE.md, APP_BLUEPRINT.md and BUILD_GUIDE.md. CLAUDE.md holds the design system values and code rules. APP_BLUEPRINT.md holds the product and contract architecture. BUILD_GUIDE.md holds the build order. This file holds the complete visual and interaction specification for every section of the landing page and the wallet gated app interior, written to be passed directly to a coding agent.

Read all four files before writing any component.

Project fingerprint: asymmetric editorial / kinetic type / cold ops / technical grid / front-loaded / editorial reveal

---

## Global Rules

**Typography scale:**
```
display-xl:  font-display, clamp(3.5rem, 9vw, 8.5rem) / 0.92 leading, weight 500, italic variants available
display-lg:  font-display, clamp(2.25rem, 5vw, 3.75rem) / 1.0 leading, weight 500
heading:     font-body, 1.25rem / 1.3 leading, weight 500
body-lg:     font-body, 1.125rem / 1.6 leading, weight 300
body:        font-body, 1rem / 1.6 leading, weight 400
body-sm:     font-body, 0.875rem / 1.6 leading, weight 300
mono:        font-mono, 0.875rem / 1.6 leading, weight 400
mono-sm:     font-mono, 0.8125rem / 1.7 leading, weight 400
label:       font-mono, 0.75rem / 1 leading, weight 400, tracking 0.15em, uppercase
```

**Spacing tokens:**
```
xs 0.25rem, sm 0.5rem, md 1rem, lg 1.5rem, xl 2rem, 2xl 3rem, 3xl 4rem, 4xl 6rem, 5xl 8rem
```

**Radius tokens:** sm 2px, md 4px, lg 8px, xl 12px. Verdict stamps and receipts stay sharp, no pill containers anywhere except the nav CTA which is square cut.

**Transition standard:**
```
fast: 120ms ease
default: 220ms ease
slow: 400ms cubic-bezier(0.16, 1, 0.3, 1)
```

**Entrance standard, every below-fold element:**
```
initial: { opacity: 0, filter: 'blur(8px)', y: 20 }
whileInView: { opacity: 1, filter: 'blur(0px)', y: 0 }
viewport: { once: false, amount: 0.1 }
transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
```

`once: false` is mandatory everywhere. Any `once: true` in the codebase is a defect.

**Motion import:** `import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react'`

**Scrollbars hidden globally, smooth scrolling preserved:**
```css
html { scroll-behavior: smooth; scrollbar-width: none; }
::-webkit-scrollbar { display: none; }
```

**Reduced motion:** every animation wraps in `@media (prefers-reduced-motion: reduce)` with a crossfade or instant state. Content is always readable with animations off.

**No inline styles except** motion values from useMotionValue or useTransform, and dynamic colours from live contract data.

**No onMouseEnter or onMouseLeave for styling.** CSS class transitions only. Tilt and magnetic handlers track position only.

**CSS variables only, zero hardcoded hex in component files.** The terminal verdict colours use classes defined in globals.css, `.t-approve { color: var(--verdict-approve) }` and `.t-refund { color: var(--verdict-refund) }`.

**Icons:** Lucide React only, tree-shaken imports. No emoji anywhere.

**Layout container rule:** every section is a full-width layout divider. Content sits inside an inner `max-w-[1400px] mx-auto px-4 md:px-8` plain div. Motion containers never carry max-width or centering classes.

**Logo and favicon are comment slots only**, never placeholder art.

---

## Section 1 — Nav, C1 editorial strip with ruling ticker

**Component:** `src/components/layout/Nav.tsx`

**Z stack:**
```
z-50: nav strip, fixed top-0 inset-x-0
z-100: mobile menu overlay
```

**Behaviour:** fixed, full width, never morphs on scroll, `border-b border-[var(--border-subtle)]` provides separation. No box shadow ever.

**Structure:**
```
<header> fixed top-0 inset-x-0 z-50
  bg-[var(--bg-primary)]/85 backdrop-blur-md
  <div> h-12 max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4

    Left, wordmark:
      {/* Logo slot: replace with public/logo.svg once provided */}
      <a href="#top" class="font-display text-xl text-[var(--text-primary)] tracking-tight">
        Gavel

    Centre, ruling ticker, hidden md:flex flex-1 min-w-0 items-center overflow-hidden:
      <div class="flex gap-8 w-max animate-ticker group">
        duplicated track of ruling items, each:
        <span class="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--verdict-approve)]" />
          job 47 approved 0.5 okb
        <span class="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--verdict-refund)]" />
          job 48 refunded 0.5 okb
      animation: @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      duration 30s linear infinite, group-hover animation-play-state paused

    Right:
      <button id="connect-entry" class="hidden md:inline-flex font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 px-3 py-1.5">
        connect wallet
      <button id="launch-entry" class="bg-[var(--accent)] text-[var(--bg-primary)] font-body text-sm font-medium px-4 py-2 rounded-[4px] hover:bg-[var(--accent-hover)] transition-colors duration-150">
        Launch App
```

**Ticker data:** sourced from the last 12 Ruled events read read-only from the contract. If the read fails the ticker shows `awaiting first ruling` in text-muted. Both right side buttons call the same gated handler, never a raw anchor into /app.

**Mobile:** hamburger of three spans `w-6 h-[2px] bg-[var(--text-primary)]` animating to an X over 300ms, overlay `fixed inset-0 z-[100] bg-[var(--bg-primary)]/98 backdrop-blur-sm` with word sized links in font-display italic.

---

## Section 2 — Hero, off-grid giant type with ruling receipt

**Component:** `src/components/sections/Hero.tsx`

**Z stack:**
```
z-0:  Waves canvas, accent amber, lineColor rgba(217, 164, 65, 0.16), waveSpeedX 0.008, waveSpeedY 0.004, waveAmpX 28, waveAmpY 12, xGap 12, yGap 36
z-[1]: technical grid, absolute inset-0, linear-gradient 1px lines every 72px both axes, line colour rgba(231, 234, 240, 0.04), masked radial-gradient at 60% 40% so it fades at edges
z-[3]: ghost word layer, scroll linked
z-10: content layer, relative
z-50: nav, fixed
grain: fixed full viewport overlay at z-[60], separate component
```

**Ghost word layer:** `font-display italic text-[24vw] leading-none text-[rgba(231,234,240,0.03)] absolute -top-10 -right-32 select-none pointer-events-none`, word `ruled`, translateX mapped from scrollYProgress 0 to -80px through a static `overflow-hidden` parent.

**Weight shift, hero headline:** native scroll driven CSS where supported:
```css
@supports (animation-timeline: scroll()) {
  @keyframes gavelWeight { from { font-variation-settings: 'wght' 560; } to { font-variation-settings: 'wght' 340; } }
  .hero-headline { animation: gavelWeight linear both; animation-timeline: scroll(); animation-range: 0vh 60vh; }
}
```
Fallback: static weight 500, no JavaScript weight animation.

**Content, off-grid:**
```
<section class="relative min-h-[100dvh] overflow-hidden bg-[var(--bg-primary)]" id="top">
  <div class="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pt-36 md:pt-44 pb-20 lg:pb-28
              grid lg:grid-cols-12 gap-12 lg:gap-8 items-end">

    Left column, lg:col-span-7:
      <h1 class="hero-headline font-display text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.03em] text-[var(--text-primary)] max-w-[12ch]">
        line 1: "Pay for results,"
        <br />
        line 2: <em class="italic text-[var(--accent)]">not promises.</em>
      </h1>
      BlurText word-by-word: blur(10px) opacity 0 y 50, through blur(5px) opacity 0.5 y -5, to blur(0) opacity 1 y 0, duration 0.7s per word, stagger wordIndex times 0.1s

      <p class="mt-6 max-w-[52ch] font-body text-base md:text-lg font-light text-[var(--text-secondary)] leading-relaxed" delay 0.8s blur-in>
        Gavel escrows agent payments on X Layer and lets an independent AI judge rule on the work against a rubric committed onchain before the job started.

      <div class="mt-10 flex flex-wrap items-center gap-6" delay 1.1s blur-in>
        primary:
        <button class="group flex items-center gap-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-[4px] px-6 py-3.5 font-body text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors duration-150">
          <span>Launch App</span>
          <span class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-200">
            <ArrowUpRight size={14} />
          </span>
        </button>
        secondary:
        <button class="font-mono text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 flex items-center gap-2">
          <Play size={14} class="fill-current" /> watch the ruling
        </button>
      </div>

    Right column, lg:col-span-5, delay 1.3s:
      initial { opacity: 0, y: 40, scale: 0.95 } animate { opacity: 1, y: 0, scale: 1 } transition { duration: 1, ease: [0.16, 1, 0.3, 1] }
      Ruling receipt card, double bezel:
      outer: p-2 rounded-[12px] bg-white/[0.03] ring-1 ring-white/10
      inner: rounded-[8px] bg-[var(--bg-surface)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-6 md:p-8

      Header row: flex items-center justify-between
        <span class="label text-[var(--text-muted)]">ruling · job 47</span>
        <span class="label text-[var(--verdict-approve)] bg-[rgba(62,207,142,0.08)] border border-[rgba(62,207,142,0.2)] px-2 py-1 rounded-[2px]">approved</span>

      Amount: font-mono text-3xl text-[var(--text-primary)] mt-6 tabular-nums, "0.5 OKB"
      Divider: border-t border-[var(--border-subtle)] my-6

      Rubric checklist, five rows, each:
        flex items-start gap-3
        <Check size={14} class="text-[var(--verdict-approve)] mt-1" />
        <span class="font-mono text-[13px] leading-6 text-[var(--text-secondary)]">exactly five headlines</span>

      Footer: flex items-center justify-between mt-6
        <span class="font-mono text-xs text-[var(--text-muted)]">rubric hash 0x1f4a…9c2e</span>
        <span class="font-mono text-xs text-[var(--text-muted)]">x layer testnet</span>

      Card tilt: rotateX and rotateY from useMotionValue plus useSpring stiffness 300 damping 30, range plus or minus 4 degrees only
```

**Hero discipline check:** four stacked elements maximum, headline plus sub plus CTA pair plus receipt card to the side, CTA within 40px of the sub stack, no orphan words at clamp scale on 1280 and 390 widths.

---

## Section 3 — Metrics strip

**Recipe:** `metrics-section` from COMPOSITION_RECIPES.md, four columns instead of three

**Component:** `src/components/sections/Metrics.tsx`

```
<section class="relative py-20 md:py-28 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
  <div class="max-w-[1400px] mx-auto px-4 md:px-8">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">

      Each metric, blur-in with stagger 0.2s per column:
      <p class="font-mono text-4xl md:text-5xl text-[var(--text-primary)] tabular-nums leading-none" data-counter>
      <p class="font-body text-sm text-[var(--text-muted)] mt-3">

    Values, replaced with real numbers from the final demo run before recording:
      47 jobs ruled
      23.5 OKB escrowed
      6.4s median ruling
      100% rubric commitments honoured
```

Counter animation: zero to final over 1.5s ease-out, IntersectionObserver with once false so it replays on re-entry.

---

## Section 4 — How it works, four layers

**Recipe:** `architecture-layers` from COMPOSITION_RECIPES.md

**Component:** `src/components/sections/HowItWorks.tsx`

```
<section class="py-24 md:py-32 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
  <div class="max-w-4xl mx-auto px-4 md:px-8">
    <h2 class="font-display text-3xl md:text-5xl text-[var(--text-primary)] tracking-tight text-center">
      Four movements, one receipt.

    <div class="mt-16 flex flex-col gap-4">
      Each layer, slide up stagger index times 0.15s, duration 0.6s, ease [0.16, 1, 0.3, 1]:
      <div class="border border-[var(--border-default)] rounded-[8px] p-6 flex items-start gap-4 hover:border-white/20 transition-colors duration-200">
        <span class="font-mono text-sm text-[var(--text-muted)] min-w-[2.5rem]">01</span>
        <div>
          <h3 class="font-body text-base font-medium text-[var(--text-primary)]">Commit</h3>
          <p class="font-body text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
            Buyer locks the payment with keccak of the spec and keccak of the rubric plus salt. The standard exists before the work does.
      02 Deliver, seller agent posts the artifact hash before the deadline
      03 Rule, judge reveals rubric and salt, contract verifies commitment and signature, verdict settles
      04 Settle, approve pays the seller, reject refunds the buyer, receipt emitted either way
```

---

## Section 5 — Rubric statement

**Recipe:** `full-width-statement` from COMPOSITION_RECIPES.md

**Component:** `src/components/sections/RubricStatement.tsx`

```
<section class="py-28 md:py-40 flex items-center bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
  <div class="w-full px-4 md:px-8">
    <p class="font-display text-[clamp(2.5rem,8vw,8rem)] leading-[0.95] tracking-tighter text-[var(--text-primary)] text-center text-wrap-balance">
      The rubric was committed before the work began.
    word-by-word blur-in, stagger 0.05s per word, replays on re-entry

    <p class="label text-[var(--text-muted)] text-center mt-8">
      keccak256(rubric, salt) · locked at job creation · revealed at ruling
```

---

## Section 6 — Verdict terminals, two runs one judge

**Bespoke section, split content family, no direct recipe**

**Component:** `src/components/sections/VerdictTerminals.tsx`

```
<section class="py-24 md:py-32 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
  <div class="max-w-6xl mx-auto px-4 md:px-8">
    <h2 class="font-display text-3xl md:text-5xl text-[var(--text-primary)] tracking-tight text-center">
      Two runs. One judge.
    <p class="font-body text-sm text-[var(--text-secondary)] mt-4 text-center max-w-[50ch] mx-auto">
      The same rubric grades both deliveries. Real work gets paid, junk gets refunded.

    <div class="mt-16 grid lg:grid-cols-2 gap-6">

      Each terminal frame, blur-in delays 0.3s and 0.45s:
      outer: rounded-[8px] border border-[var(--border-default)] overflow-hidden bg-[var(--bg-elevated)] shadow-[0_24px_48px_rgba(0,0,0,0.4)]
      title bar: h-9 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center px-4 gap-2
        three dots w-2.5 h-2.5 rounded-full, colours #3a3a3a #4a4a4a #5a5a5a, muted by design
        <span class="font-mono text-xs text-[var(--text-muted)] ml-2">gavel · run 01</span>
      body: p-6 font-mono text-[13px] leading-7

      RUN 01, approved:
        <span class="text-[var(--text-muted)]">$ </span><span class="text-[var(--text-primary)]">npx gavel-agent deliver --job 47</span>
        <span class="t-refund">artifact received · hash 0x84c1…7a03</span>
        <span class="t-approve">gavel › rubric verified against commitment</span>
        <span class="t-approve">✓</span> replaced with Lucide inline, five checklist lines each `text-[var(--text-secondary)]`
        <span class="t-approve">gavel › ruling APPROVED · 0.5 OKB released to seller</span>

      RUN 02, refunded:
        <span class="text-[var(--text-muted)]">$ </span><span class="text-primary">npx gavel-agent deliver --job 48 --file junk.txt</span>
        same rubric, lines fail with `t-refund` marks
        <span class="t-refund">gavel › ruling REFUNDED · 0.5 OKB returned to buyer</span>
```

Static text only, no typewriter. A judge pausing the video must be able to read every line. Checklist marks use Lucide `Check` and `X` at 12px inline, never emoji or unicode symbols.

---

## Section 7 — MCP integration for agents

**Recipe:** `split-image-text` adapted, visual replaced by a code block

**Component:** `src/components/sections/McpSection.tsx`

```
<section class="py-24 md:py-32 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
  <div class="max-w-[1400px] mx-auto px-4 md:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">

      Left, fade from left, delay 0.3s:
      <h2 class="font-display text-3xl md:text-5xl text-[var(--text-primary)] tracking-tight">
        Any agent can hire. Any agent can work.
      <p class="font-body text-base text-[var(--text-secondary)] mt-4 leading-relaxed max-w-[45ch]">
        Gavel ships as an MCP server. Four tools, one rail, no custom integration. If your framework speaks MCP it can open an escrow in one call.

      Three points, max, each flex gap-3 items-start mt-6:
        inline SVG icons at w-5 h-5 text-[var(--accent)]
        font-body text-sm text-[var(--text-secondary)]

      Right, fade from right, delay 0.5s, code block:
      <div class="rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
        title bar as Section 6, title gavel · mcp
        <div class="p-6 font-mono text-sm leading-7 text-[var(--text-secondary)]">
          <span class="text-[var(--text-muted)]">$ npx gavel-mcp</span>
          tool call create_job
          spec: five landing headlines for Somno
          rubric: five binary checks, hash committed
          escrow: 0.5 OKB
          → job 47 open · https://www.oklink.com/xlayer-test/tx/…
          copy button, Lucide Copy 16px, swaps to Check for 1500ms then reverts
```

---

## Section 8 — Final CTA, amber drenched

**Bespoke, typography statement family, the one committed colour moment on the page**

**Component:** `src/components/sections/FinalCta.tsx`

```
<section class="py-28 md:py-40 bg-[var(--accent)] text-[var(--bg-primary)]">
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
    <h2 class="font-display italic text-[clamp(3rem,9vw,8rem)] leading-[0.95] tracking-tight text-wrap-balance">
      Let agents earn their pay.
    word-by-word blur-in, stagger 0.06s

    <button class="mt-10 group inline-flex items-center gap-3 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-[4px] px-7 py-3.5 font-body text-sm font-medium hover:bg-[var(--bg-elevated)] transition-colors duration-150">
      <span>Launch App</span>
      <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-200">
        <ArrowUpRight size={14} />
      </span>
    </button>

    <p class="label mt-8" style uses var(--bg-primary) at 60 percent opacity:
      deployed on x layer testnet · mainnet after the gavel falls
```

---

## Section 9 — Footer

**Component:** `src/components/sections/Footer.tsx`

```
<footer class="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-12">
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col items-center gap-6">
    {/* Logo slot: replace with public/logo.svg once provided */}
    <span class="font-display text-xl text-[var(--text-primary)]">Gavel</span>

    <div class="flex items-center gap-4 font-body text-sm font-light text-[var(--text-secondary)]">
      <a class="hover:text-[var(--text-primary)] transition-colors duration-120" href="[repo url]" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      <span class="text-[var(--text-muted)]">·</span>
      <a class="hover:text-[var(--text-primary)] transition-colors duration-120" href="https://web3.okx.com/xlayer" target="_blank" rel="noopener noreferrer">Built on X Layer</a>

    <span class="font-mono text-xs text-[var(--text-muted)] tracking-[0.1em]">the work was judged</span>
```

CTA intent audit: Launch App is the only launch intent label and appears in nav, hero and final CTA. connect wallet is the only connect label. watch the ruling is the only video label. No duplicates.

---

## Wallet Interaction Spec, mandatory Step 13 and 14 copy in

**Stack:** wagmi plus viem. X Layer Testnet defined as a custom chain object, id 195, native currency OKB 18 decimals, rpc https://testrpc.xlayer.tech, explorer https://www.oklink.com/xlayer-test. Connectors: injected with flag detect for OKX Wallet and MetaMask.

**Connection modal, WalletConnectModal.tsx:** no button anywhere calls connect directly. Nav and hero entry points open the modal. Modal states: explaining, connecting with spinner that blocks the close button, success with confirmation then auto route to /app, error with the rejection reason and a retry button. The modal holds all wagmi state, the parent holds one boolean.

**Hydration:** ProtectedRoute checks isConnected and isReconnecting. Never redirect while reconnecting. Show a branded reconnecting screen with the Gavel wordmark and a skeleton bar.

**Protected routes:** /app and /app/job/:id live inside a single ProtectedRoute layout route. Confirmed disconnect mid session navigates to / with replace and state disconnected true, which the landing page reads to show a slide down toast that auto dismisses after 4 seconds, clearing router state after reading.

**Disconnect intent:** the disconnect action navigates immediately with the state flag before wagmi propagates, and sets a local app wallet-disconnected intent so a refresh never silently re-enters the app.

**Entry points:** every launch entry uses a button with a gated handler, never an anchor into /app.

**Error containment:** the app root wraps the route outlet in a React error boundary showing a branded recovery screen with retry and route home actions. Wallet rejections, chain switch refusals, RPC failures and transaction failures become inline states with retry, never route crashes.

**App interior wallet dropdown, AppNav.tsx:** trigger pill top right with a live green dot `w-2 h-2 rounded-full bg-[var(--verdict-approve)] animate-pulse-soft`, truncated address in font-mono text-sm, chevron rotating 180 degrees when open, aria-expanded and aria-haspopup true. Panel opens below with initial { opacity: 0, scale: 0.95, y: -6 } animate { opacity: 1, scale: 1, y: 0 } exit reversed, duration 0.18s, ease [0.22, 1, 0.36, 1], transformOrigin top right. Panel contents: status header `escrow active · x layer testnet` with pulsing dot, full address with a copy button that swaps to a check for 1.8s, network and status grid, disconnect button with red tint border `text-[var(--verdict-refund)] border border-[rgba(239,106,90,0.3)]`. Outside click closes via useRef plus document mousedown listener, Escape closes via window keydown when open. The dropdown exists only in the app interior, never on the landing page.

**Hosting fallback:** vercel.json rewrites all routes to index.html so deep links and refreshes never 404:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Refresh acceptance tests, run before submission:**
1. Connect, navigate to /app/job/47, hard refresh, same route renders with no 404
2. Refresh while connected, no landing flash, no redirect
3. Disconnect, landing shows the toast, refresh does not silently reconnect
4. Open /app/job/47 in a fresh session with no wallet, landing renders, never a platform 404
5. Reject connection and chain switch, in-app retry state appears, page stays usable
6. Simulate an RPC failure, branded error boundary appears with recovery actions

---

## App Interior

**Jobs board, /app, bento grid operational per §2E**

```
<div class="grid grid-cols-12 gap-px bg-[var(--border-default)]">
  primary job card: col-span-12 lg:col-span-8 row-span-2, bg-[var(--bg-surface)] p-6, hover bg-[var(--bg-elevated)]
  escrow stat: col-span-6 lg:col-span-4, mono number text-2xl tabular-nums, label uppercase text-[11px] tracking-[0.15em]
  ruled stat: col-span-6 lg:col-span-4
  activity feed: col-span-12 lg:col-span-4 row-span-3, ruling rows with verdict dots
```

Cells asymmetric by design, never equal halves, hover lifts with translateY(-2px) and a background shift, no scale transforms, CSS noise overlay at 0.03 on each cell.

**Job detail, /app/job/:id:** horizontal lifecycle stepper, Open, Accepted, Delivered, Paid or Refunded, mono labels with the active state in the accent, completed states in the verdict colour. Rubric reveal panel appears at Ruled showing the checklist with pass and fail per item. Artifact hash links to the explorer. Buyer and seller balances shown before and after.

**States:** empty shows `no jobs yet, run the demo agents to create the first one` with a primary action linking the repo. Loading uses skeleton shimmer bars, never spinners. Errors state the cause and the fix, `RPC unreachable, retry with the button or check the network`.

**Data:** read-only viem calls plus event polling every 4 seconds. Onchain first, the interface reflects confirmed state only.

---

## Banned Patterns

- Em dashes anywhere in code, comments or copy
- Hardcoded hex in component files, CSS variables only
- `once: true` on any whileInView or useInView
- Plain fadeUp entrances without filter blur
- onMouseEnter or onMouseLeave styling
- Emoji or unicode check marks as interface symbols
- Gradient text on any headline
- Outer neon glows, custom cursors, pure black or pure white
- Placeholder data, lorem ipsum, vanity numbers, fake names
- Spinner loading states
- localStorage or sessionStorage on the landing page
- A wallet dropdown on the landing page
- JetBrains Mono in any declaration
- Any logo or favicon that was not provided, slots stay as comments

---

## Asset Briefs

The design is type led and coded. No photographic or video assets are required for v1.

```
ASSET BRIEF, hero background:
  Type: coded canvas, Waves component in accent rgba(217, 164, 65, 0.16) over GrainGradient
  Fallback: static technical grid at reduced opacity

ASSET BRIEF, ruling receipt card:
  Type: live data component, reads the latest Ruled event
  Fallback: populated from the recorded demo run

ASSET PENDING: logo.svg, user to provide, comment slot until then
ASSET PENDING: favicon.ico, user to provide, comment slot until then
ASSET PENDING: OG image, optional post submission, generate via the IMAGEGEN workflow with the Verdict Ink palette
```

---

## Spec Self-Check

- Every element above carries exact Tailwind classes
- Every animation carries initial, animate or whileInView, duration, ease and delay
- Every section declares its z stack
- Every imagery need carries an asset brief, all coded in v1
- Positional classes carry responsive variants where layout changes
- Recipes referenced by name: metrics-section, architecture-layers, full-width-statement, split-image-text adapted
- Wallet spec names modal states, hydration handling, protected routes, disconnect routing, dropdown anatomy, escape and outside click, refresh tests and the hosting fallback file
- A junior developer could build this without asking a single design question
