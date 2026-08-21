import { defineChain } from 'viem'
import { createConfig, http, injected } from 'wagmi'

export const xLayerTestnet = defineChain({
  id: 195,
  name: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: { default: { http: ['https://testrpc.xlayer.tech'] } },
  blockExplorers: { default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer-test' } },
})

export const contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS ?? '') as `0x${string}` | ''
export const explorerUrl = 'https://www.oklink.com/xlayer-test'
export const gavelAbi = [
  { type: 'function', name: 'nextJobId', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'getJob', stateMutability: 'view', inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [{ name: 'buyer', type: 'address' }, { name: 'seller', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'specHash', type: 'bytes32' }, { name: 'rubricCommit', type: 'bytes32' }, { name: 'artifactHash', type: 'bytes32' }, { name: 'artifactURI', type: 'string' }, { name: 'status', type: 'uint8' }, { name: 'deliveryDeadline', type: 'uint64' }, { name: 'rulingWindow', type: 'uint64' }, { name: 'rulingDeadline', type: 'uint64' }] }] },
  { type: 'event', name: 'Ruled', inputs: [{ name: 'jobId', type: 'uint256', indexed: true }, { name: 'approved', type: 'bool', indexed: false }, { name: 'rubricHash', type: 'bytes32', indexed: false }, { name: 'salt', type: 'bytes32', indexed: false }], anonymous: false },
] as const

export const wagmiConfig = createConfig({ chains: [xLayerTestnet], connectors: [injected({ shimDisconnect: true })], transports: { [xLayerTestnet.id]: http() } })

/** Returns a short address for operational surfaces. */
export function shortenAddress(address: string): string { return `${address.slice(0, 6)}…${address.slice(-4)}` }

/** Returns an explorer link for a confirmed transaction or address. */
export function explorerLink(value: string, type: 'tx' | 'address' = 'tx'): string { return `${explorerUrl}/${type}/${value}` }

/** Returns a friendly lifecycle label for the contract enum. */
export function statusLabel(status: number): string { return ['Open', 'Accepted', 'Delivered', 'Paid', 'Refunded'][status] ?? 'Unknown' }
