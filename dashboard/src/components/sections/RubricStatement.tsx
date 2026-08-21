import { FadeIn } from '../ui/FadeIn'

/** Makes the rubric precommit the visual centre of the protocol story. */
export function RubricStatement(): JSX.Element { return <section className="flex items-center border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-28 md:py-40"><div className="w-full px-4 md:px-8"><FadeIn><p className="text-center font-display text-[clamp(2.5rem,8vw,8rem)] leading-[0.95] tracking-tighter text-[var(--text-primary)]">The rubric was committed before the work began.</p></FadeIn><FadeIn delay={0.2}><p className="label mt-8 text-center text-[var(--text-muted)]">keccak256(rubric, salt) · locked at job creation · revealed at ruling</p></FadeIn></div></section> }
