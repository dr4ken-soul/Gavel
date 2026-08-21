import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ethers } from 'ethers'
import { gavel, provider, rubricCommit, signerFromEnv, transactionUrl } from '../src/gavel.js'

const rubric = ['exactly five headlines', 'brand name Somno appears', 'every headline is eight words or fewer', 'no medical claims', 'each headline is a complete phrase']

/** Creates a demo escrow job with the committed Somno headline rubric. */
async function main(): Promise<void> {
  const buyer = signerFromEnv('BUYER_KEY')
  const salt = ethers.hexlify(ethers.randomBytes(32))
  const rubricText = JSON.stringify(rubric)
  const specHash = ethers.keccak256(ethers.toUtf8Bytes('five Somno landing headlines'))
  const tx = await gavel(buyer).createJob(specHash, rubricCommit(rubricText, salt), Number(process.env.DELIVERY_WINDOW ?? 3600), Number(process.env.RULING_WINDOW ?? 3600), { value: ethers.parseEther(process.env.ESCROW_AMOUNT ?? '0.5') })
  const receipt = await tx.wait()
  const jobId = receipt.logs.map((log: ethers.Log) => { try { return gavel().interface.parseLog(log)?.args.jobId } catch { return undefined } }).find(Boolean)
  if (!jobId) throw new Error('JobCreated event was not found in the confirmed transaction')
  const folder = join(process.cwd(), 'runs', `job-${jobId}`)
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'rubric.json'), JSON.stringify({ rubric, salt }, null, 2))
  console.log(`job ${jobId} open · ${transactionUrl(receipt.hash)}`)
  console.log(`buyer ${buyer.address} · balance ${ethers.formatEther(await provider.getBalance(buyer))} OKB`)
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
