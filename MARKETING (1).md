# MARKETING.md: Gavel

## Goal

Get Gavel in front of the X Layer judges and the agent builder audience during the Build X AI Season window without sounding like a pitch deck.

The story is simple: agents can pay each other but nobody checks the work. Gavel is the check. Every post proves the rail settles, it does not describe plans.

Core proof to show in public: a real job created on X Layer Testnet, a rubric commitment hash onchain, a junk delivery getting refunded, a good delivery getting paid, and the receipt landing in the explorer, all uncut.

---

## Posting Style

- all lowercase
- builder voice, not company voice
- one clear idea per post
- short lines with space between thoughts
- show what works, do not explain what you plan to build
- the demo video does the heavy lifting, copy supports it

---

## Post Plan

### post 1, project announcement

```
building gavel for the @XLayerOfficial build x ai season hackathon

agents can pay each other now, but nobody checks the work

gavel escrows the payment on x layer, the grading rubric gets committed onchain as a hash before the job starts, and when the seller delivers, an ai judge rules against that exact rubric

approved pays the seller, rejected refunds the buyer, every ruling leaves a receipt

pay per result, not per call

demo + repo below
```

Attach a screen recording of one full run, job creation to APPROVED, under 60 seconds, uncut.

### post 2, final submission

```
submitted gavel to the build x ai season hackathon @XLayerOfficial

same rubric, two deliveries

run 01: real headlines, judge approves, 0.5 okb released to the seller
run 02: lorem ipsum, judge rejects, buyer refunded in the same block space

the contract verifies the rubric commitment and the judge signature onchain, the goalposts cannot move after the work starts

any agent framework can join through the mcp server, four tools, one rail

[demo video] [repo] [app]
```

Attach the final demo video directly to the post.

---

## Submission Notes

**Project title:** Gavel

**Tagline:** Agents ship the work. Gavel rules on it.

**Track:** the agent track as named in the official track list. If tracks are free choice at submission, enter the agent track and reference the AI application directly in the description.

**Contract:** GavelEscrow on X Layer Testnet, address from the deployment, explorer linked.

**Project description, under 200 words:**

Gavel is pay per result escrow for the agent economy on X Layer. A buyer agent locks a payment and commits a hashed grading rubric onchain before any work starts. A seller agent delivers, and an independent AI judge scores the deliverable against the revealed rubric. The contract verifies the rubric commitment and the judge signature, then settles. Approved work pays the seller, rejected work refunds the buyer, and every ruling emits a permanent receipt.

The rubric precommit is the core mechanism. Payment rails for agents exist, but nothing stops a seller from delivering junk or a buyer from moving the goalposts. Gavel hashes the rubric plus a salt at job creation and the contract refuses any ruling graded against a different standard.

Any agent framework can plug in through the MCP server with four tools. The demo shows two runs under the same rubric, real work approved and paid, junk rejected and refunded, both settled on X Layer Testnet.

**Demo video flow, target 85 seconds:**

1. Title beat, Gavel wordmark, one line, pay per result not per call, 5 seconds
2. Terminal, buyer agent creates job 47, show the rubric commitment hash in the createJob tx on oklink, 15 seconds
3. Seller agent delivers, artifact hash onchain, 10 seconds
4. Judge prints the checklist line by line, APPROVED, balance moves, dashboard card flips to paid, 20 seconds
5. Run 02 junk delivery, same rubric, REFUNDED, buyer whole again, 15 seconds
6. MCP shot, one external client call creates a real job, 10 seconds
7. Close on the receipts idea, every ruling is onchain, built on x layer, 10 seconds

---

## Checklist

- [ ] Testnet contract deployed and address recorded before anything else
- [ ] Two runs settled, real numbers captured for the metrics strip
- [ ] App deployed to a public HTTPS URL
- [ ] All six wallet refresh tests pass on the production URL
- [ ] Demo video recorded at 1080p, trimmed near 85 seconds, two run sequence uncut
- [ ] Post 1 out as soon as the live app is up
- [ ] Post 2 at submission, mentioning @XLayerOfficial, video attached directly
- [ ] Google Form submitted before August 21 2026, 23:59 UTC
- [ ] Dedicated X account active through and after the hackathon
- [ ] Mainnet launch scheduled and stated in the submission
