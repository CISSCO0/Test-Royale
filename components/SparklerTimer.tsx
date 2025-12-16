"use client"

import { useEffect, useState } from "react"

interface SparklerTimerProps {
  duration: number
  onComplete?: () => void
}

export function SparklerTimer({ duration, onComplete }: SparklerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(100)

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onComplete])

  // Update progress
  useEffect(() => {
    setProgress((timeLeft / duration) * 100)
  }, [timeLeft, duration])

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-4">
      {/* Progress bar */}
      <div className="relative w-48 h-3 bg-neutral-800 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-300 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
        
        {/* Glow effect */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full -translate-x-2"
          style={{
            left: `${progress}%`,
            background: 'radial-gradient(circle, #fef3c7 0%, #f59e0b 70%, transparent 100%)',
            boxShadow: `0 0 12px #fde68a, 0 0 20px #f59e0b, 0 0 30px #fb923c`,
          }}
        />
      </div>

      {/* Timer text with minutes:seconds */}
      <span className="font-bebas text-xl text-orange-500 tracking-wider min-w-[70px]">
        {formatTime(timeLeft)}
      </span>
    </div>
  )
}