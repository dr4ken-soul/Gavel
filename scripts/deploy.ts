import { ethers } from 'hardhat'
import 'dotenv/config'

/** Deploys GavelEscrow with the configured judge address. */
async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners()
  const judge = process.env.JUDGE_ADDRESS ?? process.env.JUDGE_KEY
  if (!judge) {
    throw new Error('JUDGE_ADDRESS or JUDGE_KEY is required before deployment')
  }
  const judgeAddress = judge.startsWith('0x') && judge.length === 42
    ? judge
    : new ethers.Wallet(judge).address
  const factory = await ethers.getContractFactory('GavelEscrow')
  const contract = await factory.deploy(judgeAddress)
  await contract.waitForDeployment()
  const address = await contract.getAddress()
  console.log(`deployer ${deployer.address}`)
  console.log(`judge ${judgeAddress}`)
  console.log(`contract ${address}`)
  console.log(`explorer https://www.oklink.com/xlayer-test/address/${address}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
