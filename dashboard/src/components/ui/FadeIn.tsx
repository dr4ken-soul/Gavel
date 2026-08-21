import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; delay?: number; className?: string }

/** Reveals content with the Gavel blur-in entrance. */
export function FadeIn({ children, delay = 0, className = '' }: Props): JSX.Element {
  return <motion.div className={className} initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }} whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}>{children}</motion.div>
}
