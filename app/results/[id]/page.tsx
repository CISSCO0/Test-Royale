"use client";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Target, Zap, Shield, Star, Crown, Medal } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiService } from "@/lib/api"

import { GetLastSubmissionResponse ,Submission} from "@/interface/GetLastSubmissionResponse"
import { GameResponse } from "@/interface/GetGameResponse"
import { GetChallengeResponse , Challenge} from "@/interface/GetChallengeResponse"
import { RunResponse } from "@/interface/RunResponse"
import { LineCoverage , CoverageReport} from "@/interface/GenerateCoverageResponse"

import { PlayerResult } from "@/interface/PlayerResult"
import { Game } from "@/interface/GetGameResponse"
import {PlayerCoverage} from "@/interface/PlayerCoverage"
import { TestMetrics } from "@/interface/MutationSummary"

//get badges info 
const badges = [
  { id: "coverage-king", name: "Coverage King", icon: Shield, threshold: 80, color: "text-chart-1" },
  { id: "speed-demon", name: "Speed Demon", icon: Zap, threshold: 70, color: "text-primary" },
  { id: "quality-champion", name: "Quality Champion", icon: Star, threshold: 90, color: "text-chart-2" },
  { id: "test-master", name: "Test Master", icon: Target, threshold: 85, color: "text-chart-1" },
]

export default function ResultsPage({ params }: { params: { id: string } }) {

  const router = useRouter();
  const { player , isLoading ,isAuthenticated }:any  = useAuth();
  const gameId = params.id;
  const [gameData, setGameData] = useState<Game | null>(null);
  const [submissionData, setSubmissionData] = useState<Submission | null>(null);
  const [challengeData, setChallengeData] = useState<Challenge>();
  const [runData, setRunData] = useState<RunResponse | null>(null);
  const [coverageReport, setCoverageReport] = useState<CoverageReport | null >(null);
  const [lineOfCode, setLineOfCode] = useState<number | null>(null);

  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [allPlayers, setAllPlayers] = useState<PlayerResult[]>([])
  const [currentPlayerRank, setCurrentPlayerRank] = useState(0)
  const [loading, setLoading] = useState(true);

  // Add new loading states
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);
  const [isRunningCode, setIsRunningCode] = useState(true);
  const [isGeneratingCoverage, setIsGeneratingCoverage] = useState(true);
  const [mutationResult, setMutationResult] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!gameId ||!player) return;
        // 1. Get last submission
        const LastSubmissionResponse : GetLastSubmissionResponse = await apiService.getLastSubmission(player.playerId, gameId);
        setSubmissionData(LastSubmissionResponse.submission);

        // 2. Get game data 
        const GetGameResponse:GameResponse = await apiService.getGame(gameId);
        
        if (!LastSubmissionResponse?.success || !GetGameResponse?.success) {
          throw new Error('Failed to fetch initial data');
        }
        setGameData(GetGameResponse.game);

        
        const getChallengeResponse:GetChallengeResponse = await apiService.getChallenge(GetGameResponse.game.codeId);

        if (!getChallengeResponse?.success) {
          throw new Error('Failed to load challenge');
        }

        setChallengeData(getChallengeResponse.challenge);

        // 3. Run code once and store results
        const runResponse:RunResponse = await apiService.compileAndRunCSharpCode(
          getChallengeResponse.challenge.baseCode,
          LastSubmissionResponse.submission.code,
          player.playerId
        );
        //if failed what should happen ?
        if (!runResponse) {
          throw new Error('Failed to run submitted code');
        }
        setRunData(runResponse);


       // Generate coverage report (includes real line & branch coverage)
        const generateCoverageReport:CoverageReport = await apiService.generateCoverageReport(
          runResponse.playerTestsDir,
          LastSubmissionResponse.submission.code
        );
        setCoverageReport(generateCoverageReport);

        // Get test lines count
        const calculateTestLineResponse:any = await apiService.calculateTestLines(LastSubmissionResponse.submission.code);
        if (calculateTestLineResponse.success) {
          setLineOfCode(calculateTestLineResponse.totalTestLines);

        }

        // Generate mutation report
        const mutationResult:any = await apiService.generateMutationReport(runResponse.playerTestsDir,runResponse.projectDir);
        console.log("Mutation Result:", mutationResult);
        setMutationResult(mutationResult);
      } catch (error) { 
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
        setIsLoadingSubmission(false);
        setIsRunningCode(false);
        setIsGeneratingCoverage(false);
      }
    };

    fetchResults();
  }, [gameId, player]);

  const handlePlayAgain = () => {
    router.push("/")
  }

  const handleViewLeaderboard = () => {
    router.push("/leaderboard")
  }

  const handleViewProfile = () => {
    router.push("/profile")
  }

  // Update the loading screen to show progress
  if (loading||isLoading|| isLoadingSubmission || isRunningCode || isGeneratingCoverage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(var(--primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }} />
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <div className="space-y-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            
            <div className="space-y-4">
              <h2 className="font-bebas text-4xl text-foreground tracking-wider">
                GENERATING RESULTS
              </h2>
              
              <div className="space-y-2 text-sm">
                {isLoadingSubmission && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Loading submission...
                  </div>
                )}
                
                {isRunningCode && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Running tests...
                  </div>
                )}
                
                {isGeneratingCoverage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Generating coverage report...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (!results) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <Card className="p-8 text-center">
  //         <h2 className="text-2xl font-bold text-foreground mb-4">Results Not Found</h2>
  //         <p className="text-muted-foreground mb-6">Unable to load game results.</p>
  //         <Button onClick={() => router.push('/')}>Return Home</Button>
  //       </Card>
  //     </div>
  //   );
  // }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  return (

    <div className="min-h-screen bg-background">
      {/* Main Content Container - Similar structure to game page */}

      <div className="relative z-10 min-h-screen flex flex-col items-center overflow-auto py-20">
        <div className="max-w-7xl mx-auto w-full px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-4">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-bebas text-7xl tracking-wider">
              <span className="text-foreground">BATTLE </span>
              <span className="text-primary">COMPLETE!</span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-primary/20 px-6 py-3 rounded-full">
              {/* {getRankIcon(currentPlayerRank)} */}
              <span className="font-bebas text-2xl text-primary tracking-wider">RANK #
                {/* {currentPlayerRank} */}
                </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8">
            {/* Results Card */}
            <Card className="bg-card border-border p-8">
              <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">CHALLENGE RESULTS</h2>
              <div className="space-y-3">
                {allPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 
                      
                     // player.name === results.playerName ? "bg-primary/10 border-primary" : "bg-secondary border-border"
                   `
                  }
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
                          {/* {player.name === results.playerName && <span className="ml-2 text-primary text-sm">(YOU)</span>} */}
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
  <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">COVERAGE & FEEDBACK</h2>

  <div className="space-y-6">
    {/* Coverage Metrics with progress bars */}
    {[
      { 
        label: "Line Coverage", 
       value: !isNaN(parseFloat(String(coverageReport?.lineRate))) 
       ? parseFloat(String(coverageReport?.lineRate)) 
       : "calculating...",
        color: "bg-green-500", 
        // desc: `${coverageReport?.coveredLines ?? 0} of ${coverageReport?.totalLines ?? 0} lines` 
      },
      { 
        label: "Branch Coverage", 
        value: typeof coverageReport?.branchRate === "number" ? coverageReport.branchRate : parseFloat(String(coverageReport?.branchRate ))||"calculating...",
        color: "bg-blue-500", 
        desc: "Percentage of branches covered by tests"
      },
      { 
        label: "Test Lines", 
        value: lineOfCode ??" calculating...",
        color: "bg-amber-500", 
        desc: "Number of meaningful test lines",
        format: "number"
      },
      { 
        label: "Execution Time", 
        // value: (coverageReport?.executionTime || 0) * 1000, // Convert seconds -> ms
        color: "bg-indigo-500", 
        desc: "Time taken to execute all tests",
        format: "time"
      },
      
      { 
  label: "Mutation Score", 
  value: mutationResult?.summary?.mutationScore || "calculating...",
  color: (mutationResult?.summary?.mutationScore || "calculating...") >= 80 ? "bg-green-500" : 
         (mutationResult?.summary?.mutationScore || "calculating...") >= 60 ? "bg-amber-500" : "bg-red-500", 
  desc: `${mutationResult?.summary?.killed || "calculating..."} of ${mutationResult?.summary?.totalMutants || 0} mutants killed`
}
    ].map((item:any , index) => (
      <div key={index} className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">{item.label}</h4>
          <span className="text-foreground font-medium">
            {item.format === "time" 
              ? `${Math.round(item.value)}ms` 
              : item.format === "number"
                ? `${item.value}`
                : `${(typeof item.value === "number" ? item.value : parseFloat(String(item.value ?? 0))).toFixed(1)}%`
            }
          </span>
        </div>

        {/* Only show progress bar for percentage metrics (no explicit format) */}
        {!item.format && (
          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-full transition-all`}
              style={{ width: `${Math.max(0, Math.min(100, Number(item.value) || 0))}%` }}
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground">{item.desc}</p>
      </div>
    ))}
    {/* Mutation Results Card */}
<Card className="bg-card border-border p-8 mt-8">
  <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">MUTATION TESTING RESULTS</h2>
  
  {/* Mutation Score */}
  <div className="space-y-2 mb-6">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-muted-foreground">Mutation Score</h4>
      <span className="text-foreground font-medium">
        {mutationResult?.summary?.mutationScore?.toFixed(1) || 0}%
      </span>
    </div>
    <div className="h-4 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full ${
          (mutationResult?.summary?.mutationScore || 0) >= 80 ? 'bg-green-500' : 
          (mutationResult?.summary?.mutationScore || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
        } rounded-full transition-all`}
        style={{ width: `${Math.max(0, Math.min(100, mutationResult?.summary?.mutationScore || 0))}%` }}
      />
    </div>
    <p className="text-xs text-muted-foreground">
      {mutationResult?.summary?.killed || 0} of {mutationResult?.summary?.totalMutants || 0} mutants killed
    </p>
  </div>

  {/* Mutation Breakdown */}
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    {[
      { label: "Total", value: mutationResult?.summary?.totalMutants || 0, color: "bg-gray-500" },
      { label: "Killed", value: mutationResult?.summary?.killed || 0, color: "bg-green-500" },
      { label: "Survived", value: mutationResult?.summary?.survived || 0, color: "bg-red-500" },
      { label: "Timeout", value: mutationResult?.summary?.timeout || 0, color: "bg-amber-500" },
      { label: "No Coverage", value: mutationResult?.summary?.noCoverage || 0, color: "bg-blue-500" }
    ].map((item, index) => (
      <div key={index} className="text-center p-3 rounded-lg bg-secondary/50">
        <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`}></div>
        <div className="font-bebas text-2xl text-foreground">{item.value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
      </div>
    ))}
  </div>

  {/* Mutants List */}
  <div className="space-y-3">
    <h4 className="font-bebas text-xl text-foreground tracking-wider">MUTANTS DETAILS</h4>
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {mutationResult?.mutants?.map((mutant: any) => (
        <div
          key={mutant.id}
          className={`p-3 rounded-lg border ${
            mutant.status === 'Killed' ? 'bg-green-500/10 border-green-500/30' :
            mutant.status === 'Survived' ? 'bg-red-500/10 border-red-500/30' :
            mutant.status === 'Timeout' ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-blue-500/10 border-blue-500/30'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  mutant.status === 'Killed' ? 'bg-green-500' :
                  mutant.status === 'Survived' ? 'bg-red-500' :
                  mutant.status === 'Timeout' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></span>
                <span className="font-medium text-foreground text-sm">{mutant.mutation}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Line {mutant.line} • {mutant.fileName}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Original: <code className="bg-black/20 px-1 rounded">{mutant.originalCode}</code>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              mutant.status === 'Killed' ? 'bg-green-500/20 text-green-300' :
              mutant.status === 'Survived' ? 'bg-red-500/20 text-red-300' :
              mutant.status === 'Timeout' ? 'bg-amber-500/20 text-amber-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {mutant.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</Card>

    {/* Feedback Section */}
    <div className="mt-6 p-4 bg-secondary rounded-xl shadow-sm">
      
    </div>
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
      {/* Coverage Report Card */}
<Card className="bg-card border-border p-8">
  <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-6">
    COVERAGE REPORT
  </h2>

  <div className="space-y-6">
  {/* Player's Written Tests */}
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-foreground">Your Test Code</h3>
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <pre className="font-mono text-sm p-4 overflow-x-auto whitespace-pre-wrap">
       { submissionData?.code }
      </pre>
    </div>
  </div>


    {/* Base Code with Line Highlighting */}
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Base Code Coverage</h3>
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="font-mono text-sm">
          {challengeData?.baseCode.split("\n").map((line: string, index: number) => {
                      // Get coverage for BaseCode.cs only
                      const lineNumber = index + 1;
                      const coverage = coverageReport?.lineCoverage?.find(
                        (c: { line: number; covered: boolean; file?: string }) => 
                          // Make sure we're only showing coverage for base code lines
                          c.line === lineNumber && 
                          c?.file === "BaseCode.cs"  // Add this check
                      );
          
                      return (
                        <div
                          key={index}
                          className={`flex items-start py-1 px-3 hover:bg-secondary/50 transition-colors ${
                            coverage !== undefined  // Only style if we have coverage data for this line
                              ? coverage.covered
                                ? "bg-green-500/5 border-l-4 border-l-green-500"
                                : "bg-red-500/5 border-l-4 border-l-red-500"
                              : ""
                          }`}
                        >
                          <span className="text-muted-foreground select-none w-12 text-right pr-3 shrink-0">
                            {lineNumber}
                          </span>
                          <code className={`flex-1 whitespace-pre ${
                            coverage !== undefined
                              ? coverage.covered
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-foreground"
                          }`}>
                            {line}
                          </code>
                        </div>
                      );
                    })}
        </div>
      </div>
    </div>
  </div>
</Card>
</div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-8">
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
    </div>
  )
}
