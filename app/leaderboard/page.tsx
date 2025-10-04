"use client";

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Medal, Award, Shield, Zap, Target, Star, Crown } from "lucide-react"

// Mock leaderboard data
const leaderboardData = [
  {
    rank: 1,
    name: "CodeMaster",
    totalScore: 2850,
    gamesPlayed: 32,
    winRate: 87,
    badges: ["coverage-king", "quality-champion", "test-master", "speed-demon"],
  },
  {
    rank: 2,
    name: "TestNinja",
    totalScore: 2640,
    gamesPlayed: 28,
    winRate: 82,
    badges: ["quality-champion", "test-master", "speed-demon"],
  },
  {
    rank: 3,
    name: "BugHunter",
    totalScore: 2420,
    gamesPlayed: 30,
    winRate: 76,
    badges: ["coverage-king", "test-master"],
  },
  {
    rank: 4,
    name: "QualityGuru",
    totalScore: 2180,
    gamesPlayed: 25,
    winRate: 72,
    badges: ["quality-champion", "speed-demon"],
  },
  {
    rank: 5,
    name: "TestWizard",
    totalScore: 1950,
    gamesPlayed: 22,
    winRate: 68,
    badges: ["coverage-king"],
  },
]

const badgeInfo = [
  { id: "coverage-king", name: "Coverage King", icon: Shield, color: "text-chart-1", bgColor: "bg-chart-1/20" },
  { id: "speed-demon", name: "Speed Demon", icon: Zap, color: "text-primary", bgColor: "bg-primary/20" },
  { id: "quality-champion", name: "Quality Champion", icon: Star, color: "text-chart-2", bgColor: "bg-chart-2/20" },
  { id: "test-master", name: "Test Master", icon: Target, color: "text-chart-1", bgColor: "bg-chart-1/20" },
]

export default function LeaderboardPage() {
  const router = useRouter()

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-primary" />
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />
      case 3:
        return <Award className="w-6 h-6 text-chart-2" />
      default:
        return <span className="text-muted-foreground font-medium">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-bebas text-7xl tracking-wider">
            <span className="text-foreground">LEADER</span>
            <span className="text-primary">BOARD</span>
          </h1>
          <p className="text-muted-foreground text-lg">Top White-Box Testing Champions</p>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left font-bebas text-xl tracking-wider text-foreground">RANK</th>
                  <th className="px-6 py-4 text-left font-bebas text-xl tracking-wider text-foreground">PLAYER</th>
                  <th className="px-6 py-4 text-center font-bebas text-xl tracking-wider text-foreground">SCORE</th>
                  <th className="px-6 py-4 text-center font-bebas text-xl tracking-wider text-foreground">GAMES</th>
                  <th className="px-6 py-4 text-center font-bebas text-xl tracking-wider text-foreground">WIN RATE</th>
                  <th className="px-6 py-4 text-left font-bebas text-xl tracking-wider text-foreground">BADGES</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <tr
                    key={player.rank}
                    className={`border-t border-border ${index % 2 === 0 ? "bg-card" : "bg-secondary/30"} hover:bg-secondary/50 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">{getRankIcon(player.rank)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground text-lg">{player.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bebas text-2xl text-primary">{player.totalScore}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-muted-foreground">{player.gamesPlayed}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-chart-1 rounded-full" style={{ width: `${player.winRate}%` }} />
                        </div>
                        <span className="text-foreground font-medium">{player.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {player.badges.map((badgeId) => {
                          const badge = badgeInfo.find((b) => b.id === badgeId)
                          if (!badge) return null
                          const Icon = badge.icon
                          return (
                            <div
                              key={badgeId}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${badge.bgColor}`}
                              title={badge.name}
                            >
                              <Icon className={`w-4 h-4 ${badge.color}`} />
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Badge Legend */}
        <Card className="bg-card border-border p-8">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">BADGE LEGEND</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badgeInfo.map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${badge.bgColor}`}>
                    <Icon className={`w-5 h-5 ${badge.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={() => router.push("/")}
            size="lg"
            className="font-bebas text-xl tracking-wider px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            START NEW BATTLE
          </Button>
        </div>
      </div>
    </div>
  )
}
