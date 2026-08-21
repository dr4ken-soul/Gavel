import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ethers } from 'ethers'
import OpenAI from 'openai'
import 'dotenv/config'
import { gavel, provider, rulingPayload, signerFromEnv, statusLabel, transactionUrl } from '../src/gavel.js'

type Result = { item: string; ok: boolean; note: string }
type Verdict = { pass: boolean; results: Result[]; summary: string }

const systemPrompt = 'You are a strict neutral evaluator. You receive a rubric of binary checks and a deliverable. Answer only with JSON of the form {"pass": boolean, "results": [{"item": string, "ok": boolean, "note": string}], "summary": string}'

/** Parses a model response and verifies the required verdict shape. */
function parseVerdict(text: string): Verdict {
  const parsed = JSON.parse(text) as Verdict
  if (typeof parsed.pass !== 'boolean' || !Array.isArray(parsed.results) || typeof parsed.summary !== 'string') {
    throw new Error('LLM response did not match the verdict schema')
  }
  return parsed
}

/** Runs the local deterministic evaluator used when no LLM key is configured. */
function localVerdict(rubric: string[], artifact: string): Verdict {
  const lines = artifact.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const results: Result[] = [
    { item: rubric[0] ?? 'exactly five headlines', ok: lines.length === 5, note: `${lines.length} non-empty lines found` },
    { item: rubric[1] ?? 'brand name Somno appears', ok: /somno/i.test(artifact), note: /somno/i.test(artifact) ? 'brand found' : 'brand not found' },
    { item: rubric[2] ?? 'every headline is eight words or fewer', ok: lines.every((line) => line.split(/\s+/).length <= 8), note: 'word count checked per line' },
    { item: rubric[3] ?? 'no medical claims', ok: !/cure|treat|diagnos|heal/i.test(artifact), note: 'restricted claims scan complete' },
    { item: rubric[4] ?? 'each headline is a complete phrase', ok: lines.every((line) => /[a-z0-9]$/i.test(line)), note: 'line endings checked' },
  ]
  return { pass: results.every((result) => result.ok), results, summary: results.every((result) => result.ok) ? 'All committed checks passed.' : 'One or more committed checks failed.' }
}

/** Calls an OpenAI-compatible evaluator with one retry on malformed JSON. */
async function evaluate(rubric: string[], artifact: string): Promise<{ verdict: Verdict; transcript: string }> {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) return { verdict: localVerdict(rubric, artifact), transcript: 'local evaluator used because LLM_API_KEY is not configured' }
  const client = new OpenAI({ apiKey, baseURL: process.env.LLM_BASE_URL || undefined })
  const user = `RUBRIC\n${rubric.map((item) => `- ${item}`).join('\n')}\n\nDELIVERABLE\n${artifact}`
  let raw = ''
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await client.chat.completions.create({ model: process.env.LLM_MODEL ?? 'gpt-4o-mini', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: user }] })
    raw = response.choices[0]?.message.content ?? ''
    try { return { verdict: parseVerdict(raw), transcript: `${systemPrompt}\n\n${user}\n\n${raw}` } } catch (error) { if (attempt === 1) throw error }
  }
  throw new Error('LLM did not return a verdict')
}

/** Prints a compact verdict checklist with no decorative terminal output. */
function printVerdict(verdict: Verdict): void {
  for (const result of verdict.results) console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.item} · ${result.note}`)
  console.log(`ruling ${verdict.pass ? 'APPROVED' : 'REFUNDED'} · ${verdict.summary}`)
}

/** Scores a delivered job and submits the signed ruling through the relayer. */
async function ruleJob(jobId: bigint, rubric: string[], salt: string, artifact: string, runFolder: string): Promise<void> {
  const contract = gavel()
  const job = await contract.getJob(jobId)
  if (statusLabel(Number(job.status)) !== 'Delivered') throw new Error(`job ${jobId} is ${statusLabel(Number(job.status))}, expected Delivered`)
  const { verdict, transcript } = await evaluate(rubric, artifact)
  printVerdict(verdict)
  const judge = signerFromEnv('JUDGE_KEY')
  const payload = await rulingPayload(jobId, job.artifactHash, verdict.pass)
  const signature = await judge.signMessage(ethers.getBytes(payload))
  const split = ethers.Signature.from(signature)
  const relayer = signerFromEnv('RELAYER_KEY')
  const tx = await gavel(relayer).rule(jobId, ethers.toUtf8Bytes(JSON.stringify(rubric)), salt, verdict.pass, split.v, split.r, split.s)
  const receipt = await tx.wait()
  await mkdir(runFolder, { recursive: true })
  await Promise.all([
    writeFile(join(runFolder, 'rubric.json'), JSON.stringify({ rubric, salt }, null, 2)),
    writeFile(join(runFolder, 'verdict.json'), JSON.stringify({ ...verdict, txHash: receipt.hash, txUrl: transactionUrl(receipt.hash) }, null, 2)),
    writeFile(join(runFolder, 'transcript.txt'), transcript),
  ])
}

/** Polls delivered jobs and rules the first matching job, or rules JOB_ID once. */
async function main(): Promise<void> {
  const jobId = process.env.JOB_ID
  if (!jobId) throw new Error('JOB_ID is missing, set it to a delivered job id')
  const folder = process.env.RUN_FOLDER ?? join(process.cwd(), 'runs', `job-${jobId}`)
  const rubricPath = join(folder, 'rubric.json')
  const artifactPath = join(folder, 'artifact.txt')
  const savedRubric = JSON.parse(await readFile(rubricPath, 'utf8')) as { rubric: string[]; salt: string }
  const artifact = await readFile(artifactPath, 'utf8')
  await ruleJob(BigInt(jobId), savedRubric.rubric, savedRubric.salt, artifact, folder)
  void provider
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
