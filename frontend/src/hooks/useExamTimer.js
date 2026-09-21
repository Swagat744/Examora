import { useEffect, useRef, useState } from 'react'

/**
 * useExamTimer(durationSeconds)
 *
 * Encapsulates the frontend countdown logic for a mock examination so
 * ExamInterface.jsx only has to deal with rendering. This is a purely
 * client-side timer — a future practical will replace/back it with a
 * server-issued deadline for real exam security.
 *
 * Returns:
 *   timeLeft   – seconds remaining
 *   minutes    – zero-padded minutes string, for display
 *   seconds    – zero-padded seconds string, for display
 *   isFinished – true once the countdown reaches 0
 *   reset()    – restart the countdown from durationSeconds
 */
export function useExamTimer(durationSeconds) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Reached zero — stop the interval from inside the tick so the
          // effect itself can keep an empty dependency array.
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Cleanup: clear the interval when the component unmounts (e.g. the
    // student navigates away mid-exam), so we never leave a dangling
    // timer running in the background.
    return () => clearInterval(intervalRef.current)
  }, [])

  const reset = () => setTimeLeft(durationSeconds)

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return { timeLeft, minutes, seconds, isFinished: timeLeft <= 0, reset }
}
