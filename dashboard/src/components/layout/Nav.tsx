import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

type Props = { onLaunch: () => void }

/** Renders the fixed editorial navigation and ruling ticker. */
export function Nav({ onLaunch }: Props): JSX.Element {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-md">
    <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
      {/* Logo slot: replace with public/logo.svg once provided */}
      <a href="#top" className="font-display text-xl tracking-tight text-[var(--text-primary)]">Gavel</a>
      <div className="hidden min-w-0 flex-1 items-center overflow-hidden md:flex"><div className="animate-ticker flex w-max gap-8 hover:[animation-play-state:paused]">
        {['job 47 approved · 0.5 OKB', 'job 48 refunded · 0.5 OKB', 'rubric commitment verified'].concat(['job 47 approved · 0.5 OKB', 'job 48 refunded · 0.5 OKB', 'rubric commitment verified']).map((item, index) => <span key={`${item}-${index}`} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs text-[var(--text-muted)]"><span className={`h-1.5 w-1.5 rounded-full ${item.includes('refunded') ? 'bg-[var(--verdict-refund)]' : 'bg-[var(--verdict-approve)]'}`} />{item}</span>)}
      </div></div>
      <div className="hidden items-center gap-2 md:flex"><button onClick={onLaunch} className="px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]">connect wallet</button><button onClick={onLaunch} className="rounded-[4px] bg-[var(--accent)] px-4 py-2 font-body text-sm font-medium text-[var(--bg-primary)] transition-colors duration-150 hover:bg-[var(--accent-hover)]">Launch App</button></div>
      <button aria-label="Open menu" onClick={() => setOpen((value) => !value)} className="flex min-h-11 min-w-11 items-center justify-end text-[var(--text-primary)] md:hidden">{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)]/98 px-6 pt-24 backdrop-blur-sm md:hidden"><button onClick={close} className="absolute right-5 top-3 min-h-11 min-w-11 text-[var(--text-primary)]"><X size={22} /></button><nav className="flex flex-col gap-6 font-display text-5xl italic text-[var(--text-primary)]"><a href="#how" onClick={close}>how it works</a><a href="#runs" onClick={close}>the rulings</a><Link to="/" onClick={close}>the rail</Link><button onClick={() => { close(); onLaunch() }} className="text-left text-[var(--accent)]">Launch App</button></nav></div>}
  </header>
}
