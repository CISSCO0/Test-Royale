"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api";
import { Activity, Award, BarChart3, Bug, CheckCircle, ChevronLeft, Code, Crown, FileCode, Medal, Target, Timer, TrendingUp, Trophy, Users, Zap } from "lucide-react";

export default function ResultsPage({ params }: { params: { id: string } }) {
  const { id } = params; 
  const gameId = id;
  const router = useRouter();
  const { player, isLoading: authLoading, isAuthenticated }: any = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [gameResults, setGameResults] = useState<any | null>(null);
  const [playersWithDetails, setPlayersWithDetails] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'details'>('overview');
  const [fetchingPlayerInfo, setFetchingPlayerInfo] = useState(false);
useEffect(() => {
  console.group("🎮 useEffect Triggered");
  console.log("authLoading:", authLoading);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("gameId:", gameId);
  console.groupEnd();

  if (!authLoading) {
    if (!isAuthenticated) {
      console.warn("User not authenticated — redirecting to /login");
      router.push('/login');
      return;
    }
    console.info("User authenticated — loading game results...");
    loadGameResults();
  } else {
    console.log("Auth still loading, waiting...");
  }
}, [gameId, authLoading, isAuthenticated]);

const loadGameResults = async () => {
  console.group("⚙️ loadGameResults Called");
  try {
    setLoading(true);
    setError(null);
    
    console.log("Fetching game results for ID:", gameId);
    const results = await apiService.getGameResults(gameId);
    console.log("✅ Raw API Results:", results);

    if (!results || !results.success) {
      console.error("❌ API returned failure:", results);
      throw new Error(results?.error || 'Failed to load game results');
    }

    // Detect players field (handle possible API typos)
    const playersData = results.playerDate || results.players || results.game?.players;
    console.log("👥 Players Data Found:", playersData);

    if (!playersData || !Array.isArray(playersData)) {
      console.error("❌ Invalid players data:", results);
      throw new Error('No valid player data found in game results');
    }

    // Sort players
    const sortedPlayers = [...playersData].sort((a, b) => b.totalScore - a.totalScore);
    console.log("🏆 Sorted Players by totalScore:", sortedPlayers);

    // Fetch player info
    setFetchingPlayerInfo(true);
    const playersWithNames = await Promise.all(
      sortedPlayers.map(async (playerData) => {
        try {
          // Handle playerId as both object { $oid: "..." } and string
          const playerId = typeof playerData.playerId === 'object' 
            ? playerData.playerId.$oid || playerData.playerId 
            : playerData.playerId;
          
          console.log(`ℹ️ Fetching player info for ID:`, playerId);
          const playerInfo = await apiService.getPlayer(playerId);
          console.log(`ℹ️ Player Info response:`, playerInfo);
          const player = playerInfo?.player || playerInfo;
          return {
            ...playerData,
            playerId: playerId, // Normalize to string
            playerName: player?.name || player?.username || `Player ${playerId.toString().slice(-6)}`
          };
        } catch (err) {
          const playerId = typeof playerData.playerId === 'object' 
            ? playerData.playerId.$oid || playerData.playerId 
            : playerData.playerId;
          console.warn(`⚠️ Could not fetch player info for ${playerId}:`, err);
          return {
            ...playerData,
            playerId: playerId, // Normalize to string
            playerName: `Player ${playerId.toString().slice(-6)}`
          };
        }
      })
    );

    console.log("✅ Players with Details:", playersWithNames);

    setPlayersWithDetails(playersWithNames);
    setGameResults(results);

    if (sortedPlayers.length > 0) {
      console.log("🎯 Setting initial selected player:", sortedPlayers[0].playerId);
      setSelectedPlayer(sortedPlayers[0].playerId);
    }

  } catch (err:any) {
    console.error("💥 Error loading game results:", err);
    setError(err.message || 'An error occurred while loading game results');
  } finally {
    setLoading(false);
    setFetchingPlayerInfo(false);
    console.groupEnd();
  }
};

  // Helper functions
  const getPlayerRank = (playerId: string) => {
    return playersWithDetails.findIndex(p => p.playerId === playerId) + 1;
  };

  const getSelectedPlayer = () => {
    return playersWithDetails.find(p => p.playerId === selectedPlayer);
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="text-lg font-bold">{rank}</span>;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return 'text-slate-400';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const calculateAverageScore = () => {
    if (playersWithDetails.length === 0) return 0;
    const total = playersWithDetails.reduce((sum, p) => sum + p.totalScore, 0);
    return total / playersWithDetails.length;
  };

  const getMaxScore = () => {
    return playersWithDetails.length > 0 ? Math.max(...playersWithDetails.map(p => p.totalScore)) : 0;
  };

  // Get winner (player with highest score)
  const getWinner = () => {
    return playersWithDetails[0];
  };

  // Check if current user is in this game
  const isCurrentPlayerInGame = () => {
    if (!player || !playersWithDetails.length) return false;
    return playersWithDetails.some(p => p.playerId === player._id);
  };

  // Get current player's result
  const getCurrentPlayerResult = () => {
    if (!player) return null;
    return playersWithDetails.find(p => p.playerId === player._id);
  };



  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading game results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Results</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!playersWithDetails || playersWithDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">No players found in this game</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const winner = playersWithDetails[0];
  const maxScore = Math.max(...playersWithDetails.map(p => p.totalScore || 0));

  return (
   <div className="flex items-center justify-center overflow-auto relative z-10 min-h-screen mt-16">
        <div className="max-w-7xl mx-auto space-y-10 w-full px-6">
         {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bebas tracking-wider text-orange-300">
                GAME RESULTS
              </h1>
              <p className="text-slate-400 text-sm">
                Game ID: {gameId.slice(-8)} • {playersWithDetails.length} players
              </p>
            </div>
          </div>
          
          {winner && (
            <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 px-4 py-3 rounded-xl border border-orange-500/30">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-xs text-slate-400">Champion</p>
                <p className="font-bold text-yellow-400">{winner.playerName || 'Unknown'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Game Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Players</p>
                <p className="text-2xl font-bold">{playersWithDetails.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-slate-400 text-sm">Top Score</p>
                <p className="text-2xl font-bold text-yellow-400">{(winner?.totalScore || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Avg Score</p>
                <p className="text-2xl font-bold">
                  {(playersWithDetails.reduce((sum, p) => sum + (p.totalScore || 0), 0) / playersWithDetails.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
  
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'comparison'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Comparison
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'details'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileCode className="w-4 h-4 inline mr-2" />
            Details
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Player Rankings */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-bold text-orange-300 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Player Rankings
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {playersWithDetails.map((player, index) => (
                      <div 
                        key={player.playerId}
                        className={`p-4 hover:bg-slate-700/30 transition-all cursor-pointer ${
                          selectedPlayer === player.playerId ? 'bg-slate-700/50' : ''
                        }`}
                        onClick={() => setSelectedPlayer(player.playerId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-900/30 to-yellow-900/30">
                              {getRankIcon(index + 1)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{player.playerName || 'Unknown Player'}</h3>
                              <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Score: <span className="text-orange-400 font-bold">{(player.totalScore || 0).toFixed(2)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bug className="w-3 h-3" />
                                  Mutants: <span className="text-green-400">{player.mutation?.killed || 0}/{player.mutation?.total || 0}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-cyan-400">{(player.lineRate || 0).toFixed(1)}%</div>
                                <div className="text-xs text-slate-500">Coverage</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">{(player.mutation?.score || 0).toFixed(1)}%</div>
                                <div className="text-xs text-slate-500">Mutation</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Player Details */}
              <div className="space-y-6">
                {selectedPlayer && getSelectedPlayer() && (
                  <>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-orange-300">
                          {getSelectedPlayer()!.playerName}
                        </h3>
                        <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 px-3 py-1 rounded-full">
                          <span className="text-yellow-400 font-bold">Rank #{getPlayerRank(selectedPlayer)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Total Score</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                                style={{ width: `${(getSelectedPlayer()!.totalScore / maxScore) * 100}%` }}
                              />
                            </div>
                            <span className={`text-2xl font-bold ${getScoreColor(getSelectedPlayer()!.totalScore, maxScore)}`}>
                              {getSelectedPlayer()!.totalScore.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/30 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Coverage</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                  style={{ width: `${getSelectedPlayer()!.lineRate}%` }}
                                />
                              </div>
                              <span className="font-bold text-green-400">{getSelectedPlayer()!.lineRate.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/30 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Mutation</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{ width: `${getSelectedPlayer()!.mutation.score}%` }}
                                />
                              </div>
                              <span className="font-bold text-purple-400">{getSelectedPlayer()!.mutation.score.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badges Earned */}
                    {getSelectedPlayer()!.badgesEarned.length > 0 && (
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Badges Earned
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedPlayer()!.badgesEarned.map((badge: any, index: number) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 rounded-full text-sm border border-orange-500/30"
                            >
                              {badge.name || `Badge ${index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold text-orange-300 mb-6">Performance Comparison</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left p-4 text-slate-400 font-medium">Player</th>
                      <th className="text-center p-4 text-slate-400 font-medium">Score</th>
                      <th className="text-center p-4 text-slate-400 font-medium">Coverage</th>
                      <th className="text-center p-4 text-slate-400 font-medium">Mutation</th>
                      <th className="text-center p-4 text-slate-400 font-medium">Tests</th>
                      <th className="text-center p-4 text-slate-400 font-medium">Time</th>
                      <th className="text-center p-4 text-slate-400 font-medium">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersWithDetails.map((player) => (
                      <tr key={player.playerId.$oid} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-900/30 to-yellow-900/30">
                              {getRankIcon(getPlayerRank(player.playerId.$oid))}
                            </div>
                            <div>
                              <p className="font-bold">{player.playerName}</p>
                              <p className="text-xs text-slate-500">
                                {player.submission.stats ? `${player.submission.stats.passed}/${player.submission.stats.total} passed` : 'No tests'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-2xl font-bold text-orange-400">{player.totalScore.toFixed(2)}</span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Lines</span>
                              <span className="font-bold text-green-400">{player.lineRate.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                style={{ width: `${player.lineRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Score</span>
                              <span className="font-bold text-purple-400">{player.mutation.score.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${player.mutation.score}%` }}
                              />
                            </div>
                            <div className="text-xs text-slate-500 text-center">
                              {player.mutation.killed}/{player.mutation.total} killed
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="font-bold">{player.submission.stats?.passed || 0}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {player.testLines} lines
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            <span className="font-bold text-cyan-400">{player.executionTime.toFixed(2)}s</span>
                            <div className={`text-xs ${player.executionTime < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {player.executionTime < 5 ? '⚡ Fast' : 'Normal'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <span className="px-2 py-1 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 rounded text-sm">
                              {player.badgesEarned.length}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'details' && selectedPlayer && getSelectedPlayer() && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mutation Details */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Mutation Analysis
                </h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-900/30 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Mutation Score</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {getSelectedPlayer()!.mutation.score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-900/30 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Killed</p>
                    <p className="text-2xl font-bold text-green-400">
                      {getSelectedPlayer()!.mutation.killed}
                    </p>
                  </div>
                  <div className="bg-slate-900/30 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Total Mutants</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {getSelectedPlayer()!.mutation.total}
                    </p>
                  </div>
                </div>
                
                {getSelectedPlayer()!.mutation.details && getSelectedPlayer()!.mutation.details.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm mb-3">Mutation Status Distribution</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Killed', value: getSelectedPlayer()!.mutation.killed, color: 'bg-green-500' },
                        { label: 'Survived', value: getSelectedPlayer()!.mutation.survived, color: 'bg-red-500' },
                        { label: 'Timeout', value: getSelectedPlayer()!.mutation.timeout, color: 'bg-yellow-500' },
                        { label: 'No Coverage', value: getSelectedPlayer()!.mutation.noCoverage, color: 'bg-slate-500' },
                      ].map((item, index) => (
                        item.value > 0 && (
                          <div key={index} className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 w-24">{item.label}</span>
                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color}`}
                                style={{ 
                                  width: `${(item.value / getSelectedPlayer()!.mutation.total) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold">{item.value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Test & Coverage Details */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Test & Coverage Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-3">Test Results</p>
                    {getSelectedPlayer()!.submission.stats ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400">
                            {/* {getSelectedPlayer()!.submission.stats.passed} */}
                          </div>
                          <div className="text-xs text-slate-500">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-400">
                            {/* {getSelectedPlayer()!.submission.stats.failed} */}
                          </div>
                          <div className="text-xs text-slate-500">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-400">
                            {/* {getSelectedPlayer()!.submission.stats.total} */}
                          </div>
                          <div className="text-xs text-slate-500">Total</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">No test results available</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-slate-400 text-sm mb-3">Coverage Breakdown</p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Line Coverage</span>
                          <span className="font-bold text-green-400">{getSelectedPlayer()!.lineRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${getSelectedPlayer()!.lineRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Branch Coverage</span>
                          <span className="font-bold text-blue-400">{getSelectedPlayer()!.branchCoverage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${getSelectedPlayer()!.branchCoverage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/30 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Test Lines</p>
                      <p className="text-2xl font-bold text-cyan-400">{getSelectedPlayer()!.testLines}</p>
                    </div>
                    <div className="bg-slate-900/30 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Execution Time</p>
                      <p className="text-2xl font-bold text-orange-400">{getSelectedPlayer()!.executionTime.toFixed(2)}s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl transition-all"
          >
            Back to Home
          </button>
          <button
            onClick={loadGameResults}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-xl transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Refresh Results
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}