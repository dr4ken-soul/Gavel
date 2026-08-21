import { AnimatePresence, motion } from 'motion/react'
import { Check, LoaderCircle, RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAccount, useChainId, useConnect, useSwitchChain } from 'wagmi'
import { xLayerTestnet } from '../../lib/chain'

type Props = { open: boolean; onClose: () => void; onSuccess: () => void }
type ModalState = 'explaining' | 'connecting' | 'success' | 'error'

/** Holds all wallet connection states and routes only after X Layer is selected. */
export function WalletConnectModal({ open, onClose, onSuccess }: Props): JSX.Element {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, error: connectionError, isPending } = useConnect()
  const { switchChainAsync } = useSwitchChain()
  const [state, setState] = useState<ModalState>('explaining')
  const [error, setError] = useState('')
  useEffect(() => { if (!open) setState('explaining') }, [open])
  useEffect(() => { if (isConnected && chainId === xLayerTestnet.id && state === 'connecting') { setState('success'); window.setTimeout(onSuccess, 650) } }, [chainId, isConnected, onSuccess, state])
  const start = async () => {
    setState('connecting'); setError('')
    try { const connector = connectors[0]; if (!connector) throw new Error('No injected wallet found, install MetaMask or OKX Wallet'); await connect({ connector }); if (chainId !== xLayerTestnet.id) await switchChainAsync({ chainId: xLayerTestnet.id }) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Wallet connection was rejected, retry and approve the request'); setState('error') }
  }
  const issue = connectionError?.message ?? error
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--bg-primary)]/80 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div role="dialog" aria-modal="true" aria-labelledby="wallet-title" initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} className="w-full max-w-md rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.4)]"><div className="flex items-center justify-between"><span className="font-display text-2xl text-[var(--text-primary)]">connect to Gavel</span><button disabled={state === 'connecting' || isPending} onClick={onClose} className="min-h-11 min-w-11 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={18} /></button></div>{state === 'explaining' && <div className="mt-8"><p id="wallet-title" className="font-body text-base leading-relaxed text-[var(--text-secondary)]">Gavel runs on X Layer Testnet. Connect an injected wallet to inspect confirmed escrow jobs and ruling receipts.</p><button onClick={start} className="mt-7 flex min-h-11 w-full items-center justify-center rounded-[4px] bg-[var(--accent)] px-4 py-3 font-body text-sm font-medium text-[var(--bg-primary)]">connect wallet</button></div>}{state === 'connecting' && <div className="mt-8 flex items-center gap-3 text-[var(--text-secondary)]"><LoaderCircle size={18} className="animate-spin text-[var(--accent)]" />waiting for wallet approval</div>}{state === 'success' && <div className="mt-8 flex items-center gap-3 text-[var(--verdict-approve)]"><Check size={18} />wallet connected, opening app</div>}{state === 'error' && <div className="mt-8"><p className="text-sm leading-relaxed text-[var(--verdict-refund)]">{issue || 'Wallet connection failed, retry and approve the network request'}</p><button onClick={start} className="mt-6 flex min-h-11 items-center gap-2 rounded-[4px] border border-[var(--border-default)] px-4 text-sm text-[var(--text-primary)]"><RefreshCw size={15} />retry connection</button></div>}</motion.div></motion.div>}</AnimatePresence>
}
