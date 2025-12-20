"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SparklerTimer } from "@/components/SparklerTimer";
import { CodeEditorDisplay } from "@/components/code-editor-display";
import { ResultsModal } from "@/components/ResultsModal";
import { AlertCircle, Swords, Eye, X, AlertTriangle, CheckCircle, Timer, Play, Zap } from "lucide-react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Game } from "@/interface/GetGameResponse";

export default function GamePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [game, setGame] = useState<Game | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerTests, setPlayerTests] = useState("");
  const [showBattleAnimation, setShowBattleAnimation] = useState(true);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [coveredLines, setCoveredLines] = useState<Set<number>>(new Set());
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [playerData, setPlayerData] = useState<any>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);  // ✅ NEW
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  
  const { player } = useAuth();
  const router = useRouter();
  const hasInitialized = useRef(false);
  const timerWarningShown = useRef(false);
  const gameEndedRef = useRef(false);  // ✅ NEW - Prevent multiple submissions

  // ✅ Initialize game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const gameData: any = await apiService.getGame(id);
        if (!gameData.success) {
          throw new Error(gameData.error || 'Failed to load game');
        }
        setGame(gameData.game);

        const challengeData: any = await apiService.getChallenge(gameData.game.codeId);
        if (!challengeData.success) {
          throw new Error(challengeData.error || 'Failed to load challenge');
        }
        setChallenge(challengeData.challenge);
        
        // Fetch room data to get hostId
        try {
          const roomResponse: any = await apiService.request(`/room/${gameData.game.roomCode}`);
          if (roomResponse) {
            setHostId(roomResponse.hostId);
            setIsHost(roomResponse.hostId === player?.playerId);
          }
        } catch (err) {
          console.warn('Could not fetch room data:', err);
        }
        
        const savedCode = sessionStorage.getItem(`game_${id}_playerTests`);
        
        if (savedCode) {
          setPlayerTests(savedCode);
          console.log("Restored saved code from sessionStorage");
        } else {
          setPlayerTests(challengeData.challenge.testTemplate || "");
          sessionStorage.setItem(`game_${id}_playerTests`, challengeData.challenge.testTemplate || "");
        }

        // ✅ Use game startedAt time instead of sessionStorage
        const gameStartTime = new Date(gameData.game.startedAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
        const totalDuration = challengeData.challenge.time;
        const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds);

        setTimerDuration(remainingSeconds);
        
        if (remainingSeconds <= 0) {
          setTimerDuration(0);
          // Timer already ended, will be handled by useEffect
        }

        setShowBattleAnimation(false);
        console.log(`Challenge duration: ${totalDuration}s, Elapsed: ${elapsedSeconds}s, Remaining: ${remainingSeconds}s`);
        
        hasInitialized.current = true;
             
      } catch (error) {
        console.error("Failed to initialize game:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasInitialized.current) {
      initializeGame();
    }
  }, [id, router]);

  // ✅ Timer warning - show when 60 seconds left
  useEffect(() => {
    if (timerDuration !== null && timerDuration > 0 && timerDuration <= 60 && !timerWarningShown.current) {
      setShowTimerWarning(true);
      timerWarningShown.current = true;
    }
  }, [timerDuration]);

  // ✅ Auto-submit when timer ends
  useEffect(() => {
    if (timerDuration === 0 && !gameEndedRef.current && game && player) {
      gameEndedRef.current = true;
      console.log("⏰ Timer ended! Auto-submitting...");
      handleTimerEnd();
    }
  }, [timerDuration, game, player]);

  // ✅ Handle host skip to results
  const handleSkipToResults = async () => {
    if (!isHost || gameEndedRef.current) return;
    
    try {
      gameEndedRef.current = true;
      setGameEnded(true);
      setIsGeneratingReport(true);

      console.log("🎯 Host skipping to results...");
      const endGameResult: any = await apiService.endGame(game!._id);

      if (!endGameResult.success) {
        console.error("Failed to end game:", endGameResult.error);
        setResultsError(endGameResult.error || 'Failed to end game');
      } else {
        console.log("✅ Game ended successfully by host");
      }

      router.push(`/results/${game!._id}`);

    } catch (error: any) {
      console.error("Error during skip to results:", error);
      setResultsError(error.message || 'Failed to end game');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // ✅ Handle timer completion - Auto-submit
  const handleTimerEnd = async () => {
    try {
      setGameEnded(true);
      setIsGeneratingReport(true);

      // 1️⃣ End the game on backend
      console.log("🔚 Ending game...");
      const endGameResult: any = await apiService.endGame(game!._id);

      if (!endGameResult.success) {
        console.error("Failed to end game:", endGameResult.error);
        setResultsError(endGameResult.error || 'Failed to end game');
      } else {
        console.log("✅ Game ended successfully");
      }

      // 2️⃣ Navigate to results page
      console.log("📊 Navigating to results page...");
      router.push(`/results/${game!._id}`);

    } catch (error: any) {
      console.error("Error during timer end:", error);
      setResultsError(error.message || 'Failed to complete game');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    if (playerTests && hasInitialized.current) {
      sessionStorage.setItem(`game_${id}_playerTests`, playerTests);
      console.log("💾 Code saved to sessionStorage");
    }
  }, [playerTests, id]);

  // ✅ MERGED: Run code and submit in one
  const handleRunAndSubmit = async () => {
    if (!game || !player || !challenge) return;

    try {
      setIsRunning(true);
      setResultsError(null);
      
      // 1️⃣ Compile and run the code
      const result: any = await apiService.compileAndRunCSharpCode(
        challenge.baseCode, 
        playerTests,
        player.playerId
      );
      
      if (!result.success) {
        setOutput(`Compilation Error\n\n${result.stderr || result.stdout}`);
        setPlayerData(null);
        return;
      }

      const statsLine = `(${result.executionTime}s)`;
      const fullOutput = `${result.stdout} ${statsLine}`;

      setOutput(fullOutput);

      // 2️⃣ Submit the code
      const submitResult: any = await apiService.submitTestCode(
        game._id,
        player.playerId,
        playerTests
      );

      if (!submitResult.success) {
        setResultsError(`Submission failed: ${submitResult.error}`);
        setShowResultsModal(true);
        return;
      }

      // 3️⃣ Generate player report
      await generatePlayerReport();

    } catch (err: any) {
      console.error('Run and submit error:', err);
      setOutput(`Error: ${err.message || 'Failed to run code'}`);
      setPlayerData(null);
    } finally {
      setTimeout(() => setIsRunning(false), 300);
    }
  };

  // ✅ Generate player report
  const generatePlayerReport = async () => {
    try {
      setResultsLoading(true);
      setIsGeneratingReport(true);

      const result: any = await apiService.calculatePlayerData(
        player!.playerId,
        game!._id
      );

      if (!result.success) {
        setResultsError(result.error || 'Failed to generate report');
        setShowResultsModal(true);
        return;
      }

      setPlayerData(result.playerData);
      console.log("Mutation details:", result.playerData.mutation.details);

      // ✅ Extract covered lines from lineCoverage
      if (result.playerData.lineCoverage && Array.isArray(result.playerData.lineCoverage)) {
        const covered = new Set<number>();
        result.playerData.lineCoverage.forEach((lineData: any) => {
          if (lineData.covered === true) {
            covered.add(lineData.line);
          }
        });
        setCoveredLines(covered);
        console.log("📊 Covered lines:", Array.from(covered));
      }
      
      setShowResultsModal(true);
      setShowDisclaimer(false);

   } catch (error: any) {
      console.error('Report generation error:', error);
      setResultsError(error.message || 'Failed to generate report');
      setShowResultsModal(true);
    } finally {
      setIsGeneratingReport(false);
      setResultsLoading(false);
    }
  };

  const handleCloseResults = () => {
    setShowResultsModal(false);
  };

  const handleOpenResults = () => {
    if (playerData || resultsError) {
      setShowResultsModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-muted-foreground">
        Loading game...
      </div>
    );
  }

  if (!game || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        Game not found
      </div>
    );
  }

  if (showBattleAnimation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 animate-pulse">
          <Swords className="w-32 h-32 text-primary mx-auto animate-bounce" />
          <h1 className="font-bebas text-6xl tracking-wider text-primary">
            BATTLE BEGINS!
          </h1>
          <p className="text-muted-foreground text-lg">Prepare your tests...</p>
        </div>
      </div>
    );
  }

  // ✅ Show loading screen when game ends
  if (gameEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>

          <h1 className="font-bebas text-4xl tracking-wider text-orange-400">
            GAME ENDED
          </h1>
          <p className="text-muted-foreground text-lg">Finalizing results...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center overflow-auto relative z-10 min-h-screen mt-16">
        <div className="max-w-7xl mx-auto space-y-10 w-full px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-start">
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {challenge.title}
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">Test your skills</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center bg-card/80 backdrop-blur-sm rounded-2xl px-8 py-5 border border-orange-500/20 shadow-2xl">
                {timerDuration !== null && timerDuration > 0 ? (
                  <div className="flex items-center gap-4">
                    <SparklerTimer
                      duration={timerDuration}
                      onComplete={handleTimerEnd}  // ✅ UPDATED
                    />
                    <span className="font-bebas text-1xl text-orange-400/70 py-2 px-1">
                      / 15 min 
                    </span>
                  </div>
                ) : (
                  <div className="text-red-500 font-bebas text-lg animate-pulse">
                    TIME'S UP!
                  </div>
                )}
              </div>
              
              {/* Host Skip Button */}
              {isHost && !gameEnded && timerDuration !== null && timerDuration > 0 && (
                <button
                  onClick={handleSkipToResults}
                  className="px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all flex items-center gap-2 border border-orange-400/30 shadow-lg hover:shadow-orange-500/50"
                >
                  <Zap className="w-5 h-5" />
                  Skip to Results
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-orange-500/20 mb-8 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>

          {/* ✅ Initial Disclaimer Banner */}
          {showDisclaimer && (
            <div className="bg-gradient-to-r from-yellow-900/40 via-orange-900/40 to-red-900/40 border border-yellow-500/50 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-0.5 " />
                <div className="flex-1">
                  <h4 className="font-bold text-yellow-300 text-lg mb-2"> GAME STARTED - CRITICAL WARNINGS </h4>
                  
                  <div className="space-y-4">
                    {/* Warning Section */}
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="font-bold text-red-300 text-sm">IMPORTANT: FINAL SUBMISSION RULES</span>
                      </div>
                      <ul className="text-yellow-200/90 text-sm space-y-2 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>
                            <span className="font-bold text-orange-300">Compilation Errors:</span> Ensure your code compiles before the timer ends. Code with compilation errors will receive <span className="font-bold text-red-300">ZERO POINTS</span>.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>
                            <span className="font-bold text-orange-300">Timer Submission:</span> When the timer reaches 0, your <span className="font-bold text-orange-300">LAST SUCCESSFUL RUN</span> will be automatically submitted as your final answer.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>
                            <span className="font-bold text-orange-300">No Manual Submission:</span> You cannot manually submit after the timer ends. Make sure your final run is correct!
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Game Instructions */}
                    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm mb-2">
                        <span className="font-bold text-orange-300">HOW TO PLAY:</span> Click the <span className="font-bold text-orange-300 bg-orange-900/40 px-2 py-1 rounded">"RUN & SUBMIT"</span> button to execute your tests and see real-time feedback.
                      </p>
                      <p className="text-yellow-200 text-sm mb-2">
                        Each run shows your <span className="font-bold text-green-300">coverage</span>, <span className="font-bold text-purple-300">mutation score</span>, and other metrics. Use this feedback to improve your tests.
                      </p>
                      <p className="text-yellow-200 text-sm mb-2">
                        Make sure to use MSTest framework ONLY other frameworks will lead to compilation errors
                      </p>
                      <p className="text-yellow-200 text-sm">
                        Refine your tests throughout the game to create the highest quality test cases and <span className="font-bold text-orange-300">WIN AGAINST YOUR FRIENDS!</span>
                      </p>
                    </div>

                    {/* Quick Tips */}
                    <div className="flex items-center gap-3 text-xs text-yellow-300/80">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Test frequently with RUN & SUBMIT</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4 text-orange-400" />
                        <span>Watch the countdown timer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>Fix compilation errors immediately</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => setShowDisclaimer(false)}
                        className="text-sm px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Got it, Let's Code! 
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Timer Warning Banner */}
          {showTimerWarning && (
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/70 rounded-xl p-5 flex items-start gap-4 animate-bounce">
              <AlertCircle className="w-7 h-7 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-red-300 text-lg mb-2"> TIME RUNNING OUT!</h4>
                <p className="text-red-200 text-sm leading-relaxed">
                  Only <span className="font-bold text-orange-300">{timerDuration} seconds</span> remaining! 
                  When the timer reaches <span className="font-bold text-red-300">ZERO</span>, we automatically submit your 
                  <span className="font-bold text-orange-300"> LAST RUN</span> as your final solution. 
                  Make sure your latest execution is error-free and represents your best work!
                </p>
              </div>
              <button
                onClick={() => setShowTimerWarning(false)}
                className="flex-shrink-0 p-1 hover:bg-red-700/50 rounded transition-colors"
              >
                <X className="w-5 h-5 text-red-300" />
              </button>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side - Code to Test */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bebas text-xl text-foreground tracking-wider bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
                  CODE TO TEST
                </h3>
                <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border border-orange-500/10">
                  Read-only
                </span>
              </div>
              
              <div className="editor-base h-[650px] rounded-xl overflow-hidden border-2 border-orange-500/30 shadow-xl bg-card">
                <CodeEditorDisplay 
                  id="base"
                  value={challenge.baseCode} 
                  editable={false}
                  highlightedLines={coveredLines}
                  highlightColor="green"
                />
              </div>
            </div>

            {/* Right Side - Your Tests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <h3 className="font-bebas text-xl text-foreground tracking-wider bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20 whitespace-nowrap">
                    YOUR TESTS
                  </h3>
                  {/* ✅ MERGED Button: Run & Submit */}
                  <button
                    onClick={handleRunAndSubmit}
                    disabled={isRunning || isGeneratingReport}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border-2 border-orange-600 
                                font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-200 
                                ${isRunning || isGeneratingReport
                                  ? 'scale-95 opacity-70 cursor-not-allowed shadow-inner' 
                                  : 'hover:scale-105 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/50'
                                }`}
                  >
                    {isGeneratingReport ? (
                      <>
                        <Zap className="w-6 h-6 animate-spin" />
                        <span className="font-bebas tracking-wider">GENERATING REPORT...</span>
                      </>
                    ) : isRunning ? (
                      <>
                        <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span className="font-bebas tracking-wider">EXECUTING...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span className="font-bebas tracking-wider">RUN & SUBMIT</span>
                      </>
                    )}
                  </button>

                  {/* ✅ View Report Button */}
                  {playerData && (
                    <button
                      onClick={handleOpenResults}
                      className="flex items-center h-10 gap-2 px-4 rounded-lg border-2 border-blue-600
                                 font-bold text-white text-sm tracking-wide
                                 bg-gradient-to-r from-blue-500 to-blue-600
                                 transition-all duration-200
                                 hover:scale-105 hover:from-blue-600 hover:to-blue-700
                                 shadow-lg hover:shadow-blue-500/50"
                    >
                      <Eye className="w-5 h-5" />
                      <span>VIEW REPORT</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="h-[650px] rounded-xl overflow-hidden border-2 border-orange-500/50 shadow-xl bg-card">
                <CodeEditorDisplay
                  id="tests"
                  value={playerTests}
                  onChange={setPlayerTests}
                  editable={true}
                  highlightedLines={new Set()}
                  highlightColor="green"
                />
              </div>
            </div>
          </div>

          {/* Console Output */}
          <div className="mt-12 mb-12">
            <div className="bg-gradient-to-br from-card to-slate-900 rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl">
              <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-4 border-b border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                  </div>
                  <span className="text-orange-300 font-mono text-lg font-bold tracking-wide">CONSOLE OUTPUT</span>
                  {output && (
                    <div className="flex gap-2 items-center">
                      <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
                      <span className="text-xs text-orange-400 font-mono bg-orange-500/10 px-2 py-1 rounded">LAST RUN</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-orange-300 font-mono bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                  {output ? `${output.split('\n').length} LINES` : 'AWAITING EXECUTION'}
                </div>
              </div>

              <div className="h-96 overflow-auto bg-slate-900/50 p-6 font-mono">
                {output ? (
                  <div className="text-sm leading-relaxed">
                    {output.split('\n').map((line, index) => {
                      let lineColor = "text-slate-300";
                      let bgColor = "hover:bg-slate-800/60";
                      let indicatorColor = "text-orange-500/60";
                      
                      if (line.includes('✓') || line.includes('PASS') || line.toLowerCase().includes('success') || line.toLowerCase().includes('passed')) {
                        lineColor = "text-green-400";
                        bgColor = "hover:bg-green-900/20";
                        indicatorColor = "text-green-500";
                      } else if (line.includes('✗') || line.includes('FAIL') || line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.toLowerCase().includes('exception')) {
                        lineColor = "text-red-400";
                        bgColor = "hover:bg-red-900/20";
                        indicatorColor = "text-red-500";
                      } else if (line.includes('●') || line.includes('RUN') || line.toLowerCase().includes('running')) {
                        lineColor = "text-yellow-400";
                        bgColor = "hover:bg-yellow-900/20";
                        indicatorColor = "text-yellow-500";
                      } else if (line.includes('>') || line.includes('at ') || line.includes('.cs:')) {
                        lineColor = "text-orange-400";
                        bgColor = "hover:bg-orange-900/20";
                        indicatorColor = "text-orange-500";
                      } else if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                        lineColor = "text-slate-500";
                        bgColor = "hover:bg-slate-800/40";
                        indicatorColor = "text-slate-600";
                      }

                      return (
                        <div key={index} className={`${lineColor} ${bgColor} px-3 py-2 rounded-xl transition-all duration-150 group border-l-2 border-transparent hover:border-l-orange-500/30`}>
                          <span className={`${indicatorColor} text-xs w-10 inline-block group-hover:text-orange-400 transition-colors`}>
                            {index + 1}
                          </span>
                          <span className="font-medium">{line}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-slate-400 h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                        <svg className="w-10 h-10 text-orange-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <div className="text-orange-300 font-bold text-lg">NO OUTPUT YET</div>
                        <div className="text-slate-500 text-sm">Click "RUN & SUBMIT" to execute your code and generate your report</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Results Modal */}
      <ResultsModal
        isOpen={showResultsModal}
        isLoading={resultsLoading}
        playerData={playerData}
        error={resultsError}
        onClose={handleCloseResults}
      />
    </>
  );
}

