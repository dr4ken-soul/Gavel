import { ethers } from 'ethers'
import 'dotenv/config'

export const ABI = [
  'function nextJobId() view returns (uint256)',
  'function getJob(uint256) view returns (address buyer,address seller,uint256 amount,bytes32 specHash,bytes32 rubricCommit,bytes32 artifactHash,string artifactURI,uint8 status,uint64 deliveryDeadline,uint64 rulingWindow,uint64 rulingDeadline)',
  'function createJob(bytes32,bytes32,uint64,uint64) payable returns (uint256)',
  'function accept(uint256)',
  'function deliver(uint256,bytes32,string)',
  'function rule(uint256,bytes,bytes32,bool,uint8,bytes32,bytes32)',
  'function RULING_DOMAIN() view returns (bytes32)',
  'event JobCreated(uint256 indexed jobId,address indexed buyer,uint256 amount,bytes32 specHash,bytes32 rubricCommit)',
  'event Delivered(uint256 indexed jobId,bytes32 artifactHash,string artifactURI)',
  'event Ruled(uint256 indexed jobId,bool approved,bytes32 rubricHash,bytes32 salt)',
]

export const RPC_URL = process.env.RPC_URL ?? 'https://testrpc.xlayer.tech'
export const EXPLORER_URL = 'https://www.oklink.com/xlayer-test'
export const provider = new ethers.JsonRpcProvider(RPC_URL, Number(process.env.CHAIN_ID ?? 1952))

/** Returns a signer backed by a required environment variable. */
export function signerFromEnv(name: string): ethers.Wallet {
  const key = process.env[name]
  if (!key) throw new Error(`${name} is missing, add a funded private key to .env`)
  return new ethers.Wallet(key, provider)
}

/** Returns the deployed contract address or a clear configuration error. */
export function contractAddress(): string {
  const address = process.env.CONTRACT_ADDRESS
  if (!address) throw new Error('CONTRACT_ADDRESS is missing, deploy GavelEscrow and add its address to .env')
  return address
}

/** Returns a connected Gavel contract instance. */
export function gavel(signer?: ethers.Signer): ethers.Contract {
  return new ethers.Contract(contractAddress(), ABI, signer ?? provider)
}

/** Hashes the rubric and salt in the same packed format as the contract. */
export function rubricCommit(rubric: Uint8Array | string, salt: string): string {
  const rubricBytes = typeof rubric === 'string' ? ethers.toUtf8Bytes(rubric) : rubric
  return ethers.keccak256(ethers.solidityPacked(['bytes32', 'bytes32'], [ethers.keccak256(rubricBytes), salt]))
}

/** Builds the exact signed digest expected by GavelEscrow.rule. */
export async function rulingPayload(jobId: bigint | number, artifactHash: string, approved: boolean): Promise<string> {
  const domain = await gavel().RULING_DOMAIN()
  return ethers.keccak256(ethers.solidityPacked([
    'bytes32', 'bytes32', 'bytes32', 'uint8',
  ], [domain, ethers.zeroPadValue(ethers.toBeHex(jobId), 32), artifactHash, approved ? 1 : 0]))
}

/** Returns the explorer URL for a transaction. */
export function transactionUrl(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`
}

/** Returns the explorer URL for an address. */
export function addressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`
}

/** Converts contract enum values into dashboard and terminal labels. */
export function statusLabel(status: number): string {
  return ['Open', 'Accepted', 'Delivered', 'Paid', 'Refunded'][status] ?? 'Unknown'
}
