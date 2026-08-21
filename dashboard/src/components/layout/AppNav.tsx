import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Copy, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { shortenAddress } from '../../lib/chain'

type Props = { onDisconnected: () => void }

/** Renders the interior-only wallet dropdown and operational navigation. */
export function AppNav({ onDisconnected }: Props): JSX.Element {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', outside); window.addEventListener('keydown', escape)
    return () => { document.removeEventListener('mousedown', outside); window.removeEventListener('keydown', escape) }
  }, [])
  const copyAddress = async () => { if (!address) return; await navigator.clipboard.writeText(address); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  return <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]"><div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8"><a href="/app" className="font-display text-2xl tracking-tight text-[var(--text-primary)]">Gavel</a><div ref={ref} className="relative"><button aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-[var(--border-default)] px-3 font-mono text-sm text-[var(--text-secondary)] hover:border-white/20"><span className="h-2 w-2 animate-pulse-soft rounded-full bg-[var(--verdict-approve)]" />{address ? shortenAddress(address) : 'wallet'}<ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence>{open && <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -6 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-14 z-20 w-72 origin-top-right rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"><div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]"><span className="h-2 w-2 animate-pulse-soft rounded-full bg-[var(--verdict-approve)]" />escrow active · x layer testnet</div><div className="mt-4 flex items-center justify-between gap-3 font-mono text-xs text-[var(--text-secondary)]"><span className="truncate">{address}</span><button aria-label="Copy wallet address" onClick={copyAddress} className="min-h-11 min-w-11 text-[var(--accent)]">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div><div className="mt-4 grid grid-cols-2 gap-3 border-y border-[var(--border-subtle)] py-3 font-mono text-xs"><span className="text-[var(--text-muted)]">network<br /><b className="font-normal text-[var(--text-secondary)]">x layer testnet</b></span><span className="text-[var(--text-muted)]">status<br /><b className="font-normal text-[var(--verdict-approve)]">connected</b></span></div><button onClick={() => { disconnect(); onDisconnected() }} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-[rgba(239,106,90,0.3)] text-sm text-[var(--verdict-refund)]"><LogOut size={15} />disconnect</button></motion.div>}</AnimatePresence></div></div></header>
}
