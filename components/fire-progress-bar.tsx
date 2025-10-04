"use client"

import { useEffect, useState } from "react"

interface FireProgressBarProps {
  duration: number // in seconds
  currentTime?: number // Added optional currentTime prop for synced timer
  onComplete?: () => void
}

export function FireProgressBar({ duration, currentTime, onComplete }: FireProgressBarProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (currentTime !== undefined) {
      // Sync with external timer
      setProgress((currentTime / duration) * 100)
      if (currentTime <= 0) {
        onComplete?.()
      }
      return
    }

    // Original internal timer logic
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration * 10)
        if (newProgress <= 0) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration, currentTime, onComplete])

  return (
    <div className="relative w-full h-12 bg-card rounded-full overflow-hidden border-2 border-border">
      <div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 transition-all duration-100 ease-linear rounded-full"
        style={{ width: `${progress}%` }}
      >
        {/* Fire effect at the end */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M50 10 C30 30, 40 50, 50 70 C60 50, 70 30, 50 10 Z"
              fill="url(#fireGradient)"
              className="animate-pulse"
            />
            <path
              d="M50 20 C40 35, 45 50, 50 65 C55 50, 60 35, 50 20 Z"
              fill="url(#fireGradient2)"
              className="animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="50%" stopColor="#f7931e" />
                <stop offset="100%" stopColor="#fdc830" />
              </linearGradient>
              <linearGradient id="fireGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fdc830" />
                <stop offset="100%" stopColor="#f7931e" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}
