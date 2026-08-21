import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { ethers } from 'ethers'
import { gavel, rubricCommit, signerFromEnv, statusLabel, transactionUrl } from '../src/gavel.js'

/** Returns a deterministic artifact hash that is safe to commit onchain. */
function artifactHash(text: string): string { return ethers.keccak256(ethers.toUtf8Bytes(text)) }

/** Builds a standard MCP text response. */
function response(value: unknown): { content: Array<{ type: 'text'; text: string }> } { return { content: [{ type: 'text', text: JSON.stringify(value) }] } }

const server = new Server({ name: 'gavel', version: '1.0.0' }, { capabilities: { tools: {} } })

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [
  { name: 'create_job', description: 'Commit a rubric and open a native OKB escrow job.', inputSchema: { type: 'object', properties: { spec: { type: 'string' }, rubric: { type: 'array', items: { type: 'string' } }, amount: { type: 'string' } }, required: ['spec', 'rubric', 'amount'] } },
  { name: 'get_job', description: 'Read a confirmed Gavel job.', inputSchema: { type: 'object', properties: { jobId: { type: 'string' } }, required: ['jobId'] } },
  { name: 'deliver', description: 'Accept and deliver an artifact for a job.', inputSchema: { type: 'object', properties: { jobId: { type: 'string' }, artifact: { type: 'string' } }, required: ['jobId', 'artifact'] } },
  { name: 'request_ruling', description: 'Request the configured judge to rule a delivered job.', inputSchema: { type: 'object', properties: { jobId: { type: 'string' } }, required: ['jobId'] } },
] }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments ?? {}
  const name = request.params.name
  if (name === 'create_job') {
    const spec = String(args.spec)
    const rubric = (args.rubric as string[]).map(String)
    const salt = ethers.hexlify(ethers.randomBytes(32))
    const tx = await gavel(signerFromEnv('BUYER_KEY')).createJob(ethers.keccak256(ethers.toUtf8Bytes(spec)), rubricCommit(JSON.stringify(rubric), salt), 3600, 3600, { value: ethers.parseEther(String(args.amount)) })
    const receipt = await tx.wait()
    const jobId = receipt.logs.map((log: ethers.Log) => { try { return gavel().interface.parseLog(log)?.args.jobId } catch { return undefined } }).find(Boolean)
    if (!jobId) throw new Error('JobCreated event was not found after confirmation')
    const folder = join(process.cwd(), 'runs', `job-${jobId}`)
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'rubric.json'), JSON.stringify({ rubric, salt }, null, 2))
    return response({ jobId: jobId.toString(), status: 'Open', txUrl: transactionUrl(receipt.hash) })
  }
  if (name === 'get_job') {
    const job = await gavel().getJob(BigInt(String(args.jobId)))
    return response({ jobId: String(args.jobId), buyer: job.buyer, seller: job.seller, amount: ethers.formatEther(job.amount), status: statusLabel(Number(job.status)), artifactHash: job.artifactHash, artifactURI: job.artifactURI })
  }
  if (name === 'deliver') {
    const jobId = BigInt(String(args.jobId))
    const seller = signerFromEnv('SELLER_KEY')
    const artifact = String(args.artifact)
    const contract = gavel(seller)
    const job = await contract.getJob(jobId)
    if (statusLabel(Number(job.status)) === 'Open') await (await contract.accept(jobId)).wait()
    const tx = await contract.deliver(jobId, artifactHash(artifact), `file://runs/job-${jobId}/artifact.txt`)
    const receipt = await tx.wait()
    const folder = join(process.cwd(), 'runs', `job-${jobId}`)
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'artifact.txt'), artifact)
    return response({ jobId: String(jobId), artifactHash: artifactHash(artifact), txUrl: transactionUrl(receipt.hash) })
  }
  if (name === 'request_ruling') {
    return response({ jobId: String(args.jobId), next: `set JOB_ID=${String(args.jobId)} and run npm run judge`, requestId: createHash('sha256').update(String(args.jobId)).digest('hex').slice(0, 12) })
  }
  throw new Error(`Unknown tool ${name}`)
})

/** Starts the MCP server on stdin and stdout. */
async function main(): Promise<void> { await server.connect(new StdioServerTransport()) }
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
