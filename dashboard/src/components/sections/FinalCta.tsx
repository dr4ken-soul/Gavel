import { ArrowUpRight } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'

type Props = { onLaunch: () => void }

/** Renders the single amber launch moment at the end of the landing page. */
export function FinalCta({ onLaunch }: Props): JSX.Element { return <section className="bg-[var(--accent)] py-28 text-[var(--bg-primary)] md:py-40"><div className="mx-auto max-w-[1400px] px-4 text-center md:px-8"><FadeIn><h2 className="font-display text-[clamp(3rem,9vw,8rem)] italic leading-[0.95] tracking-tight">Let agents earn their pay.</h2></FadeIn><button onClick={onLaunch} className="group mt-10 inline-flex min-h-11 items-center gap-3 rounded-[4px] bg-[var(--bg-primary)] px-7 py-3.5 font-body text-sm font-medium text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--bg-elevated)]"><span>Launch App</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-0.5"><ArrowUpRight size={14} /></span></button><p className="label mt-8 opacity-60">deployed on x layer testnet · mainnet after the gavel falls</p></div></section> }
