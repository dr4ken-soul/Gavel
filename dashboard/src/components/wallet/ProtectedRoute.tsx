import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { AppNav } from '../layout/AppNav'

/** Protects app routes while preserving reconnect hydration and app navigation. */
export function ProtectedRoute(): JSX.Element {
  const { isConnected, isReconnecting } = useAccount()
  const location = useLocation()
  if (isReconnecting) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]"><div className="w-64"><div className="font-display text-3xl text-[var(--text-primary)]">Gavel</div><div className="skeleton mt-5 h-2 w-full" /></div></div>
  if (!isConnected) return <Navigate replace to="/" state={{ from: location.pathname }} />
  return <div className="min-h-screen bg-[var(--bg-primary)]"><AppNav onDisconnected={() => undefined} /><Outlet /></div>
}
