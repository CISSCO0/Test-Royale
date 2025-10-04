"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Target, Zap, Shield, Star, Crown, Medal } from "lucide-react"

interface GameResults {
  playerName: string
  playerScore: number
  playerTests: string
  codeSnippet: any
  challengeCode: string
}

interface PlayerResult {
  name: string
  score: number
  tests: string
  badges: string[]
  rank: number
}

const badges = [
  { id: "coverage-king", name: "Coverage King", icon: Shield, threshold: 80, color: "text-chart-1" },
  { id: "speed-demon", name: "Speed Demon", icon: Zap, threshold: 70, color: "text-primary" },
  { id: "quality-champion", name: "Quality Champion", icon: Star, threshold: 90, color: "text-chart-2" },
  { id: "test-master", name: "Test Master", icon: Target, threshold: 85, color: "text-chart-1" },
]

const generateOpponents = (challengeCode: string, currentPlayerScore: number): PlayerResult[] => {
  const seed = Number.parseInt(challengeCode) || 1234
  const opponents = [
    { name: "CodeNinja", baseScore: 85 },
    { name: "TestMaster", baseScore: 78 },
    { name: "BugHunter", baseScore: 92 },
    { name: "QualityGuru", baseScore: 88 },
  ]

  return opponents.map((opp, idx) => {
    const variance = ((seed + idx) % 20) - 10
    const score = Math.max(0, Math.min(100, opp.baseScore + variance))
    const earnedBadges = badges.filter((b) => score >= b.threshold).map((b) => b.id)

    return {
      name: opp.name,
      score,
      tests: `// ${opp.name}'s test implementation\n// Score: ${score}\n// Coverage: ${score}%`,
      badges: earnedBadges,
      rank: 0,
    }
  })
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<GameResults | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [allPlayers, setAllPlayers] = useState<PlayerResult[]>([])
  const [currentPlayerRank, setCurrentPlayerRank] = useState(0)

  useEffect(() => {
    const data = sessionStorage.getItem("gameResults")
    if (!data) {
      router.push("/")
      return
    }

    const gameResults = JSON.parse(data)
    setResults(gameResults)

    const earned = badges.filter((b) => gameResults.playerScore >= b.threshold).map((b) => b.id)
    setEarnedBadges(earned)

    const opponents = generateOpponents(gameResults.challengeCode, gameResults.playerScore)
    const currentPlayer: PlayerResult = {
      name: gameResults.playerName,
      score: gameResults.playerScore,
      tests: gameResults.playerTests,
      badges: earned,
      rank: 0,
    }

    const allPlayersUnsorted = [currentPlayer, ...opponents]
    const sorted = allPlayersUnsorted.sort((a, b) => b.score - a.score)
    sorted.forEach((player, idx) => {
      player.rank = idx + 1
    })

    setAllPlayers(sorted)
    setCurrentPlayerRank(sorted.findIndex((p) => p.name === gameResults.playerName) + 1)
  }, [router])

  const handlePlayAgain = () => {
    router.push("/")
  }

  const handleViewLeaderboard = () => {
    router.push("/leaderboard")
  }

  const handleViewProfile = () => {
    router.push("/profile")
  }

  if (!results) {
    return null
  }

  const coverageData = [
    { label: "Statement Coverage", value: Math.min(results.playerScore + 10, 100), color: "bg-chart-1" },
    { label: "Branch Coverage", value: Math.max(results.playerScore - 5, 0), color: "bg-primary" },
    { label: "Path Coverage", value: Math.max(results.playerScore - 10, 0), color: "bg-chart-2" },
  ]

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-4">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-bebas text-7xl tracking-wider">
            <span className="text-foreground">BATTLE </span>
            <span className="text-primary">COMPLETE!</span>
          </h1>
          <p className="text-muted-foreground text-lg">Challenge Code: {results.challengeCode}</p>
          <div className="inline-flex items-center gap-2 bg-primary/20 px-6 py-3 rounded-full">
            {getRankIcon(currentPlayerRank)}
            <span className="font-bebas text-2xl text-primary tracking-wider">RANK #{currentPlayerRank}</span>
          </div>
        </div>

        <Card className="bg-card border-border p-8">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">CHALLENGE RESULTS</h2>
          <div className="space-y-3">
            {allPlayers.map((player, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  player.name === results.playerName ? "bg-primary/10 border-primary" : "bg-secondary border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(player.rank) || (
                      <span className="font-bebas text-2xl text-muted-foreground">#{player.rank}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-foreground tracking-wider">
                      {player.name}
                      {player.name === results.playerName && <span className="ml-2 text-primary text-sm">(YOU)</span>}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {player.badges.slice(0, 3).map((badgeId) => {
                        const badge = badges.find((b) => b.id === badgeId)
                        if (!badge) return null
                        const Icon = badge.icon
                        return <Icon key={badgeId} className={`w-4 h-4 ${badge.color}`} />
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bebas text-4xl text-foreground">{player.score}</div>
                  <div className="text-xs text-muted-foreground">POINTS</div>
                </div>
              </div>
            ))}
          </div>
        </Card>{/* Score & Feedback */}
<Card className="bg-card border-border p-8 mt-8">
  <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">
    SCORE & FEEDBACK
  </h2>

  <div className="space-y-6">
    {/* Scores with progress bars */}
    {[
      { label: "Coverage Score", value: 85, color: "bg-green-500", desc: "Student coverage vs. Pex baseline" },
      { label: "Mutation Score", value: 70, color: "bg-blue-500", desc: "Mutants killed by student tests" },
      { label: "Final Score", value: 75, color: "bg-purple-500", desc: "Weighted combination result" },
    ].map((item, index) => (
      <div key={index} className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">{item.label}</h4>
          <span className="text-foreground font-medium">{item.value}%</span>
        </div>
        <div className="h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${item.color} rounded-full transition-all`}
            style={{ width: `${item.value}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{item.desc}</p>
      </div>
    ))}

    {/* Redundancy Penalty */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Redundancy Penalty</h4>
        <span className="text-red-500 font-medium">-10</span>
      </div>
      <p className="text-xs text-muted-foreground">4 redundant tests detected</p>
    </div>

    {/* Feedback Section */}
    <div className="mt-6 p-4 bg-secondary rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-3">Instructor Feedback</h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
        <li>You missed 2 branches (negative inputs, null input).</li>
        <li>4 of your 10 tests are redundant (covering the same path).</li>
        <li>Your tests killed 70% of mutants compared to Pex’s 95%.</li>
      </ul>
    </div>
  </div>
</Card>


        <Card className="bg-card border-border p-8">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">OTHER PLAYERS' TESTS</h2>
          <div className="space-y-4">
            {allPlayers
              .filter((p) => p.name !== results.playerName)
              .slice(0, 3)
              .map((player, idx) => (
                <div key={idx} className="bg-secondary rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bebas text-lg text-foreground tracking-wider">{player.name}</h3>
                    <span className="text-sm text-muted-foreground">Score: {player.score}</span>
                  </div>
                  <pre className="font-mono text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {player.tests}
                  </pre>
                </div>
              ))}
          </div>
        </Card>

        {/* Badges Earned */}
        <Card className="bg-card border-border p-8">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">YOUR BADGES EARNED</h2>
          {earnedBadges.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.map((badgeId) => {
                const badge = badges.find((b) => b.id === badgeId)
                if (!badge) return null
                const Icon = badge.icon
                return (
                  <div
                    key={badgeId}
                    className="flex flex-col items-center gap-3 p-6 bg-secondary rounded-lg border-2 border-primary"
                  >
                    <Icon className={`w-12 h-12 ${badge.color}`} />
                    <span className="text-sm font-medium text-foreground text-center">{badge.name}</span>
                    <span className="text-xs text-primary font-bebas tracking-wider">EARNED!</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No badges earned this round. Keep practicing!</p>
              <p className="text-sm text-muted-foreground mt-2">Score 70+ to start earning badges</p>
            </div>
          )}
        </Card>

        {/* Test Quality Summary */}
        <Card className="bg-card border-border p-8">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">YOUR TESTS</h2>
          <div className="bg-background rounded-lg p-4 border border-border">
            <pre className="font-mono text-sm text-foreground overflow-x-auto whitespace-pre-wrap">
              {results.playerTests || "// No tests written"}
            </pre>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={handlePlayAgain}
            size="lg"
            className="font-bebas text-xl tracking-wider px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            PLAY AGAIN
          </Button>
          <Button
            onClick={handleViewProfile}
            size="lg"
            variant="outline"
            className="font-bebas text-xl tracking-wider px-8 py-6 border-border text-foreground hover:bg-secondary bg-transparent"
          >
            VIEW PROFILE
          </Button>
          <Button
            onClick={handleViewLeaderboard}
            size="lg"
            variant="outline"
            className="font-bebas text-xl tracking-wider px-8 py-6 border-border text-foreground hover:bg-secondary bg-transparent"
          >
            LEADERBOARD
          </Button>
        </div>
      </div>
    </div>
  )
}
