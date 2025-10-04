interface PlayerScoreCardProps {
  playerNumber: 1 | 2
  score: number
  maxScore?: number
  playerName?: string // Added optional playerName prop
}
export function PlayerScoreCard({
  playerNumber,
  score,
  maxScore = 100,
  playerName,
}: PlayerScoreCardProps) {
  const percentage = (score / maxScore) * 100
  const bgColor = playerNumber === 1 ? "bg-chart-1" : "bg-chart-2"

  return (
    <div className="bg-card rounded-lg p-2 border-2 border-border w-100 h-20">
      <h3 className="font-bebas text-lg tracking-wider text-foreground mb-1">
        {playerName || `PLAYER ${playerNumber}`}
      </h3>
      <div className="flex items-center gap-0 w-full">
        {/* Progress bar takes full width */}
        <div className="flex-1 h-4 bg-secondary rounded-lg overflow-hidden">
          <div
            className={`h-full ${bgColor} transition-all duration-500 ease-out rounded-lg`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-bebas text-lg text-foreground min-w-[3rem] text-right">
          {score}
        </span>
      </div>
    </div>
  )
}
