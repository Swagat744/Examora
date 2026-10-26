import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useExamTimer(initialDurationSeconds, storageKey)
 *
 * Encapsulates resilient countdown logic for examinations.
 * Uses sessionStorage if storageKey is provided to persist the student's
 * start time across page refreshes and network blips, preventing timer resets.
 *
 * Returns:
 *   timeLeft   – seconds remaining
 *   minutes    – zero-padded minutes string, for display
 *   seconds    – zero-padded seconds string, for display
 *   isFinished – true once the countdown reaches 0
 *   reset()    – restart the countdown
 *   clear()    – clear stored timer data upon submission
 */
export function useExamTimer(initialDurationSeconds, storageKey) {
  const getInitialTime = () => {
    if (!initialDurationSeconds || initialDurationSeconds <= 0) return 1800 // Default 30 mins fallback
    if (storageKey) {
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (saved) {
          const { startedAt, totalSeconds } = JSON.parse(saved)
          const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
          const remaining = Math.max(0, totalSeconds - elapsed)
          return remaining
        }
      } catch {
        // Fallback to initial
      }
    }
    return initialDurationSeconds
  }

  const [timeLeft, setTimeLeft] = useState(getInitialTime)
  const intervalRef = useRef(null)
  const isInitialized = useRef(false)

  // Initialize or update storage on mount or when duration becomes available
  useEffect(() => {
    if (!initialDurationSeconds || initialDurationSeconds <= 0) return

    if (storageKey) {
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (!saved) {
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              startedAt: new Date().toISOString(),
              totalSeconds: initialDurationSeconds,
            }),
          )
          setTimeLeft(initialDurationSeconds)
        } else if (!isInitialized.current) {
          const { startedAt, totalSeconds } = JSON.parse(saved)
          const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
          const remaining = Math.max(0, totalSeconds - elapsed)
          setTimeLeft(remaining)
        }
      } catch {
        setTimeLeft(initialDurationSeconds)
      }
    } else {
      setTimeLeft(initialDurationSeconds)
    }

    isInitialized.current = true
  }, [initialDurationSeconds, storageKey])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback(() => {
    if (storageKey) {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            startedAt: new Date().toISOString(),
            totalSeconds: initialDurationSeconds,
          }),
        )
      } catch {
        // Ignore
      }
    }
    setTimeLeft(initialDurationSeconds)
  }, [initialDurationSeconds, storageKey])

  const clear = useCallback(() => {
    if (storageKey) {
      try {
        sessionStorage.removeItem(storageKey)
      } catch {
        // Ignore
      }
    }
  }, [storageKey])

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return {
    timeLeft,
    minutes,
    seconds,
    isFinished: timeLeft <= 0,
    reset,
    clear,
  }
}
