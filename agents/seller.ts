import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ethers } from 'ethers'
import { gavel, signerFromEnv, transactionUrl } from '../src/gavel.js'

/** Accepts a job and delivers a valid five-line Somno headline artifact. */
async function main(): Promise<void> {
  const jobId = BigInt(process.env.JOB_ID ?? '1')
  const seller = signerFromEnv('SELLER_KEY')
  const contract = gavel(seller)
  await (await contract.accept(jobId)).wait()
  const artifact = ['Somno creates quieter mornings.', 'Somno makes rest feel within reach.', 'Wake ready with Somno tonight.', 'A calmer bedtime begins with Somno.', 'Somno brings a softer landing for sleep.']
  const artifactText = artifact.join('\n')
  const artifactHash = ethers.keccak256(ethers.toUtf8Bytes(artifactText))
  const tx = await contract.deliver(jobId, artifactHash, `file://runs/job-${jobId}/artifact.txt`)
  const receipt = await tx.wait()
  const folder = join(process.cwd(), 'runs', `job-${jobId}`)
  await writeFile(join(folder, 'artifact.txt'), artifactText)
  console.log(`delivered job ${jobId} · ${transactionUrl(receipt.hash)}`)
}

void readFile
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
