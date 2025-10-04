"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FireProgressBar } from "@/components/fire-progress-bar"
import { PlayerScoreCard } from "@/components/player-score-card"
import { CodeEditorDisplay } from "@/components/code-editor-display"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Swords } from "lucide-react"

export default function GamePage() {
  const router = useRouter()
  const [playerData, setPlayerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(90)
  const [playerScore, setPlayerScore] = useState(0)
  const [playerTests, setPlayerTests] = useState("")
  const [showBattleAnimation, setShowBattleAnimation] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem("playerData")
    if (!data) {
      router.push("/")
      return
    }

    try {
      const parsedData = JSON.parse(data)
      if (!parsedData.codeSnippet || !parsedData.codeSnippet.code) {
        console.error("[v0] Invalid game data structure")
        router.push("/")
        return
      }
      setPlayerData(parsedData)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Failed to parse game data:", error)
      router.push("/")
      return
    }

    const timer = setTimeout(() => {
      setShowBattleAnimation(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    if (showBattleAnimation) return

    if (timeRemaining <= 0) {
      handleGameEnd()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, showBattleAnimation])

  useEffect(() => {
    const score = calculateScore(playerTests)
    setPlayerScore(score)
  }, [playerTests])

  const calculateScore = (tests: string) => {
    let score = 0
    const keywords = ["assert", "expect", "test", "it", "describe", "toBe", "toEqual"]
    keywords.forEach((keyword) => {
      const matches = tests.match(new RegExp(keyword, "gi"))
      if (matches) score += matches.length * 5
    })
    return Math.min(score, 100)
  }

  const handleGameEnd = () => {
    sessionStorage.setItem(
      "gameResults",
      JSON.stringify({
        playerName: playerData?.playerName,
        playerScore,
        playerTests,
        codeSnippet: playerData?.codeSnippet,
        challengeCode: playerData?.challengeCode,
      }),
    )
    router.push("/results")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading || !playerData) {
    return null
  }

  if (showBattleAnimation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8 animate-pulse">
          <Swords className="w-32 h-32 text-primary mx-auto animate-bounce" />
          <h1 className="font-bebas text-8xl tracking-wider text-primary">BATTLE BEGINS!</h1>
          <p className="text-muted-foreground text-xl">Prepare your tests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="font-bebas text-7xl tracking-wider">
            <span className="text-foreground">BATTLE OF </span>
            <span className="text-primary">TESTS</span>
          </h1>

          {/* Progress Bar */}
          <div className="max-w-3xl mx-auto">
            <FireProgressBar duration={90} currentTime={timeRemaining} />
          </div>

          {/* Timer */}
          <div className="font-bebas text-7xl text-foreground tracking-wider">{formatTime(timeRemaining)}</div>

          <Button
            onClick={handleGameEnd}
            variant="outline"
            size="sm"
            className="font-bebas tracking-wider bg-transparent"
          >
            SKIP TO RESULTS (DEMO)
          </Button>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - Code Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bebas text-2xl text-foreground tracking-wider">CODE TO TEST</h3>
              <span className="text-sm text-muted-foreground font-mono">
                {playerData.codeSnippet.language} • {playerData.codeSnippet.difficulty}
              </span>
            </div>
            <CodeEditorDisplay code={playerData.codeSnippet.code} />
          </div>

          {/* Right Side - Test Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bebas text-2xl text-primary tracking-wider">YOUR TESTS</label>
              <PlayerScoreCard playerNumber={1} score={playerScore} playerName={playerData.playerName} />
            </div>
            <Textarea
              value={playerTests}
              onChange={(e) => setPlayerTests(e.target.value)}
              placeholder={`// Write your ${playerData.codeSnippet.language} test cases here...\n// Example:\n// @Test\n// public void testAdd() {\n//     assertEquals(5, calculator.add(2, 3));\n// }`}
              className="font-mono text-sm bg-card border-border text-foreground min-h-[600px]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
