"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Target, Award, TrendingUp, Zap, Shield, Star, Flame } from "lucide-react"

export default function ProfilePage() {
  const [playerName, setPlayerName] = useState("Guest")

  useEffect(() => {
    // Try to get player name from sessionStorage
    const data = sessionStorage.getItem("playerData")
    if (data) {
      const parsed = JSON.parse(data)
      setPlayerName(parsed.playerName || "Guest")
    }
  }, [])

  // Mock player stats - in a real app, this would come from a database
  const stats = {
    gamesPlayed: 24,
    gamesWon: 15,
    winRate: 62.5,
    totalScore: 1850,
    avgCoverage: 78,
    bestStreak: 5,
  }

  const badges = [
    { id: 1, name: "First Victory", icon: Trophy, earned: true, color: "text-primary" },
    { id: 2, name: "Perfect Coverage", icon: Target, earned: true, color: "text-chart-1" },
    { id: 3, name: "Speed Demon", icon: Zap, earned: true, color: "text-chart-2" },
    { id: 4, name: "Test Master", icon: Award, earned: true, color: "text-primary" },
    { id: 5, name: "Win Streak", icon: Flame, earned: true, color: "text-chart-2" },
    { id: 6, name: "Defensive Coder", icon: Shield, earned: false, color: "text-muted-foreground" },
    { id: 7, name: "Rising Star", icon: Star, earned: false, color: "text-muted-foreground" },
    { id: 8, name: "Consistency King", icon: TrendingUp, earned: false, color: "text-muted-foreground" },
  ]

  return (
    <div className="min-h-screen bg-background pt-24 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-bebas text-7xl tracking-wider">
            <span className="text-foreground">PLAYER </span>
            <span className="text-primary">PROFILE</span>
          </h1>
          <p className="text-3xl font-bebas tracking-wider text-muted-foreground">{playerName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card border-border p-6 text-center space-y-2">
            <div className="font-bebas text-5xl text-primary">{stats.gamesPlayed}</div>
            <div className="text-muted-foreground font-medium">Games Played</div>
          </Card>

          <Card className="bg-card border-border p-6 text-center space-y-2">
            <div className="font-bebas text-5xl text-chart-1">{stats.gamesWon}</div>
            <div className="text-muted-foreground font-medium">Games Won</div>
          </Card>

          <Card className="bg-card border-border p-6 text-center space-y-2">
            <div className="font-bebas text-5xl text-chart-2">{stats.winRate}%</div>
            <div className="text-muted-foreground font-medium">Win Rate</div>
          </Card>

          <Card className="bg-card border-border p-6 text-center space-y-2">
            <div className="font-bebas text-5xl text-foreground">{stats.totalScore}</div>
            <div className="text-muted-foreground font-medium">Total Score</div>
          </Card>

          <Card className="bg-card border-border p-6 text-center space-y-2">
            <div className="font-bebas text-5xl text-primary">{stats.avgCoverage}%</div>
            <div className="text-muted-foreground font-medium">Avg Coverage</div>
          </Card>

          <Card className="bg-card border-border p-6 text-center space-y-2">
            <div className="font-bebas text-5xl text-chart-2">{stats.bestStreak}</div>
            <div className="text-muted-foreground font-medium">Best Streak</div>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="bg-card border-border p-8 space-y-6">
          <h2 className="font-bebas text-4xl text-foreground tracking-wider">BADGES & ACHIEVEMENTS</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <div
                  key={badge.id}
                  className={`text-center space-y-3 p-4 rounded-lg border-2 transition-all ${
                    badge.earned ? "border-primary bg-primary/10" : "border-border bg-background opacity-50 grayscale"
                  }`}
                >
                  <Icon className={`w-12 h-12 mx-auto ${badge.color}`} />
                  <div className="font-medium text-sm text-foreground">{badge.name}</div>
                  {badge.earned && <div className="text-xs text-primary font-bebas tracking-wider">EARNED</div>}
                </div>
              )
            })}
          </div>
        </Card>

       {/* Coverage History */}
<Card className="bg-card border-border p-8 space-y-6 rounded-xl shadow-md">
  <h2 className="font-bebas text-4xl text-foreground tracking-wider">COVERAGE HISTORY</h2>

  <div className="space-y-6">
    {[
      { game: "Game #24", statement: 85, branch: 72, path: 68, redundancy: 2, mutation: 70 },
      { game: "Game #23", statement: 92, branch: 88, path: 75, redundancy: 1, mutation: 85 },
      { game: "Game #22", statement: 78, branch: 65, path: 58, redundancy: 3, mutation: 60 },
      { game: "Game #21", statement: 88, branch: 80, path: 72, redundancy: 0, mutation: 90 },
    ].map((record, idx) => (
      <div key={idx} className="space-y-3 p-4 bg-background rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bebas text-xl tracking-wider text-foreground">{record.game}</span>
          <span className="text-sm text-red-500 font-medium">{record.redundancy} redundant tests</span>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-2">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Statement</div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${record.statement}%` }} />
            </div>
            <div className="text-xs font-semibold text-green-500">{record.statement}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Branch</div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${record.branch}%` }} />
            </div>
            <div className="text-xs font-semibold text-yellow-500">{record.branch}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Path</div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${record.path}%` }} />
            </div>
            <div className="text-xs font-semibold text-red-500">{record.path}%</div>
          </div>
        </div>
        {/* Mutation Score */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Mutation Score</div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${record.mutation}%` }} />
          </div>
          <div className="text-xs font-semibold text-blue-500">{record.mutation}%</div>
        </div>
      </div>
    ))}
  </div>
</Card>

      </div>
    </div>
  )
}
