import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 1000, delay = 0): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    startRef.current = null
    setCount(0)

    timerRef.current = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts
        const elapsed = ts - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return count
}
