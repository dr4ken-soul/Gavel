import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ethers } from 'ethers'
import { gavel, signerFromEnv, transactionUrl } from '../src/gavel.js'

/** Accepts a job and delivers intentionally invalid content for the refund run. */
async function main(): Promise<void> {
  const jobId = BigInt(process.env.JOB_ID ?? '2')
  const seller = signerFromEnv('SELLER_KEY')
  const contract = gavel(seller)
  await (await contract.accept(jobId)).wait()
  const artifactText = 'lorem ipsum dolor sit amet\nlorem ipsum dolor sit amet\nlorem ipsum dolor sit amet'
  const artifactHash = ethers.keccak256(ethers.toUtf8Bytes(artifactText))
  const tx = await contract.deliver(jobId, artifactHash, `file://runs/job-${jobId}/artifact.txt`)
  const receipt = await tx.wait()
  const folder = join(process.cwd(), 'runs', `job-${jobId}`)
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'artifact.txt'), artifactText)
  console.log(`delivered job ${jobId} · ${transactionUrl(receipt.hash)}`)
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
