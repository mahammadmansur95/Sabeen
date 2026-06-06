import { useState, useEffect, useCallback } from 'react'

const TARGET_DATE = new Date('2026-06-08T00:00:00')

export interface CountdownValues {
  days: number
  hours: number
  minutes: number
  seconds: number
  isComplete: boolean
  totalMs: number
}

export function useCountdown(devBypass = false): CountdownValues {
  const calculate = useCallback((): CountdownValues => {
    if (devBypass) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true, totalMs: 0 }
    }
    const diff = TARGET_DATE.getTime() - Date.now()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true, totalMs: 0 }
    }
    return {
      days:       Math.floor(diff / 86_400_000),
      hours:      Math.floor((diff % 86_400_000) / 3_600_000),
      minutes:    Math.floor((diff % 3_600_000)  / 60_000),
      seconds:    Math.floor((diff % 60_000)     / 1_000),
      isComplete: false,
      totalMs:    diff,
    }
  }, [devBypass])

  const [values, setValues] = useState<CountdownValues>(() => calculate())

  useEffect(() => {
    if (values.isComplete) return
    const id = setInterval(() => {
      const v = calculate()
      setValues(v)
      if (v.isComplete) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [calculate, values.isComplete])

  return values
}
