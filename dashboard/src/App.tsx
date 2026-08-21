import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Footer } from './components/sections/Footer'
import { FinalCta } from './components/sections/FinalCta'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { McpSection } from './components/sections/McpSection'
import { Metrics } from './components/sections/Metrics'
import { RubricStatement } from './components/sections/RubricStatement'
import { VerdictTerminals } from './components/sections/VerdictTerminals'
import { Nav } from './components/layout/Nav'
import { WalletConnectModal } from './components/wallet/WalletConnectModal'
import { ProtectedRoute } from './components/wallet/ProtectedRoute'
import { Jobs } from './app/Jobs'
import { JobDetail } from './app/JobDetail'
import { GrainOverlay } from './components/ui/GrainOverlay'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  /** Captures route and RPC rendering failures in a recoverable branded surface. */
  static getDerivedStateFromError(): { hasError: boolean } { return { hasError: true } }
  /** Records an error for the browser console without breaking the page. */
  componentDidCatch(error: Error, info: ErrorInfo): void { console.error(error, info) }
  render(): ReactNode { if (this.state.hasError) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4"><div className="max-w-md"><p className="label text-[var(--verdict-refund)]">recovery</p><h1 className="mt-3 font-display text-5xl text-[var(--text-primary)]">The receipt could not load.</h1><p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">RPC unreachable or the route returned an unexpected result. Retry the page or return home.</p><div className="mt-7 flex gap-3"><button onClick={() => window.location.reload()} className="min-h-11 bg-[var(--accent)] px-4 text-sm text-[var(--bg-primary)]">retry</button><a href="/" className="flex min-h-11 items-center border border-[var(--border-default)] px-4 text-sm text-[var(--text-secondary)]">home</a></div></div></div>; return this.props.children }
}

function Landing(): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const navigate = useNavigate(); const location = useLocation(); const { isConnected } = useAccount()
  useEffect(() => { if (location.state?.disconnected) { setToast(true); window.setTimeout(() => setToast(false), 4000); window.history.replaceState({}, document.title) } }, [location.state])
  const launch = () => { if (isConnected) navigate('/app'); else setModalOpen(true) }
  return <><Nav onLaunch={launch} /><Hero onLaunch={launch} /><Metrics /><HowItWorks /><RubricStatement /><VerdictTerminals /><McpSection /><FinalCta onLaunch={launch} /><Footer /><GrainOverlay /><WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => navigate('/app')} />{toast && <div className="toast fixed left-1/2 top-16 z-[110] -translate-x-1/2 border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">wallet disconnected</div>}</>
}

/** Owns the full Gavel route tree and the wallet-gated interior. */
export function App(): JSX.Element { return <BrowserRouter><ErrorBoundary><Routes><Route path="/" element={<Landing />} /><Route element={<ProtectedRoute />}><Route path="/app" element={<Jobs />} /><Route path="/app/job/:id" element={<JobDetail />} /></Route></Routes></ErrorBoundary></BrowserRouter> }
