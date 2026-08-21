import { useEffect, useState } from 'react'

/** Observes an element and returns whether it is in the viewport, with replay support. */
export function useScrollReveal<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const [visible, setVisible] = useState(false)
  const [element, setElement] = useState<T | null>(null)
  const ref = (node: T | null) => setElement(node)
  useEffect(() => {
    if (!element) return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return [{ current: element }, visible]
}
