"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context"
import { Swords, Shield, Crown, LogOut, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoomPage() {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { player } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {

    if (!player) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        setError(null);
        
        // Connect socket
        socketService.connect("");
        const socket = await socketService.getSocket();
        
        if (!socket) {
          throw new Error("Failed to connect to socket server");
        }

        // Get initial room info
        const res = await socketService.getPlayerRoomInfo();

        // ✅ Check if not successful FIRST
        if (!res.success) {
          setRoom(null);
          setLoading(false);
          return;
        }

        // ✅ Check if room exists
        if (!res.room) {
          setRoom(null);
          setLoading(false);
          return;
        }

        // ✅ Check game state BEFORE setting room
        if (res.room.gameState === "playing") {
          router.push(`/game/${res.room.gameData?.gameId}`);
          return;
        }
        
        if (res.room.gameState === "finished" || res.room.gameState !== "waiting") {
          router.push(`/`);
          return;
        }
        
        // ✅ NOW set room safely
        if (mounted) {
          setRoom(res.room);
          setPlayers(res.room.players);
          const me = res.room.players.find(
            (p: any) => p.playerId.toString() === player.playerId.toString()
          );
          setIsReady(me?.isReady || false);
          setIsHost(me?.isHost || false);
          console.log("Room loaded successfully");
        }

        // ============ REMOVE OLD LISTENERS ============
        socket.off("game_started");
        socket.off("player_ready_changed");
        socket.off("player_joined");
        socket.off("player_left");
        socket.off("room_updated");

        // ============ GAME START EVENT ============
        socket.on("game_started", (data: any) => {
          console.log("Game started:", data);
          if (mounted && data.gameId) {
            router.push(`/game/${data.gameId}`);
          }
        });

        // ============ PLAYER READY CHANGED ============
        socket.on("player_ready_changed", (data: any) => {
          if (!mounted) return;
          console.log("Player ready changed:", data);
        
          if (data.success && data.room) {
            setRoom(data.room);
            setPlayers(data.room.players);
            const me = data.room.players.find(
              (p: any) => p.playerId === player.playerId
            );
            setIsReady(me?.isReady || false);
            setError(null);
          } else {
            setError(data.error || "Failed to update ready status");
          }
        });

        // ============ PLAYER JOINED ============
        socket.on("player_joined", (data: any) => {
          if (!mounted) return;

          console.log("Player joined:", data);
          if (data.room) {
            setRoom(data.room);
            setPlayers(data.room.players);
            setError(null);
            const success = new Audio("/enter_leave_room.mp3");
            success.play();
          }
        });

        // ============ PLAYER LEFT ============
        socket.on("player_left", (data: any) => {
          if (!mounted) return;
          console.log("Player left:", data);
          if (data.room) {
            setRoom(data.room);
            setPlayers(data.room.players);
            setError(null);
            // ✅ FIX: Use data.room instead of res.room
            const me = data.room.players.find(
              (p: any) => p.playerId.toString() === player.playerId.toString()
            );
            setIsHost(me?.isHost || false);
            const success = new Audio("/enter_leave_room.mp3");
            success.play();
          }
        });

        // ============ ROOM UPDATED ============
        socket.on("room_updated", (updatedRoom: any) => {
          if (!mounted) return;
          console.log("Room updated:", updatedRoom);
          setRoom(updatedRoom);
          setPlayers(updatedRoom.players);
          // ✅ FIX: Use updatedRoom instead of res.room
          const me = updatedRoom.players.find(
            (p: any) => p.playerId.toString() === player.playerId.toString()
          );
          setIsHost(me?.isHost || false);
          setError(null);
        });

      } catch (err) {
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
          console.error("Socket error:", err);
          setError(errorMsg);
          setRoom(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      const socket = socketService.getSocket();
      if (socket) {
        socket.off("game_started");
        socket.off("player_ready_changed");
        socket.off("player_joined");
        socket.off("player_left");
        socket.off("room_updated");
      }
    };
  }, [player, router]);

  // ============ HANDLERS WITH ERROR HANDLING ============
  const handleLeaveRoom = async () => {
    try {
      setError(null);
      setShowLeaveConfirm(false);
      await socketService.leaveRoom();
      router.push("/");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to leave room";
      setError(errorMsg);
      console.error("Leave room error:", err);
      setShowLeaveConfirm(false);
    }
  };

  const handleSetReady = async () => {
    try {
      setError(null);
      await socketService.setPlayerReady(!isReady);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update ready status";
      setError(errorMsg);
      console.error("Set ready error:", err);
    }
  };

  const handleStartGame = async () => {
    try {
      setError(null);
      const socket = socketService.getSocket();
      
      if (!socket) {
        throw new Error("Socket connection lost");
      }

      if (!room) {
        throw new Error("Room information not available");
      }

      socket.emit(
        "start_game",
        { roomCode: room.code },
        (res: any) => {
          console.log("🎮 Start game response:", res);

          if (!res?.success) {
            setError(res?.error || "Failed to start game");
            console.error("Start game failed:", res?.error);
            return;
          }

          // Game started successfully, navigation handled by game_started event
        }
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start game";
      setError(errorMsg);
      console.error("Start game error:", err);
    }
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center overflow-auto py-16 relative z-10 min-h-screen">
        <div className="text-center">
          <Swords className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="animate-pulse text-gray-400">login please </p>
          <Button
            onClick={() => router.push("/login")}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors "
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        <div className="text-center">
          <Swords className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="animate-pulse text-gray-400">Loading arena...</p>
        </div>
      </div>
    );
  }
  // ============ NO ROOM STATE ============
  if (!room) {
    return (
        <div className="flex items-center justify-center overflow-auto py-16 relative z-10 min-h-screen">
        <Card className="bg-red-900/20 border-red-500/40 p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">
            { "cannot load room "}
          </p>
          <Button 
            onClick={() => router.push("/")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg py-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  const allReady = room?.players?.every((p: any) => p.isReady) && room?.players?.length >= 2;

  return (
    <>
      {/* ERROR ALERT - Top Right */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <Card className="bg-red-900/95 border border-red-500/50 p-4 shadow-2xl shadow-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-sm font-medium">Error</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-blue/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="relative bg-slate-900/95 border-2 border-red-500/50 p-8 max-w-md w-full shadow-2xl shadow-red-500/20 rounded-2xl">
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-red-500/20 rounded-full blur-xl mx-auto" />
              </div>
              
              <h3 className="font-bebas text-4xl text-white tracking-wider">
                LEAVE ARENA?
              </h3>
              
              <div className="space-y-3">
                <p className="text-slate-300 text-lg font-medium">
                  Are you sure you want to leave?
                </p>
                <p className="text-slate-400 text-sm">
                  You'll lose your spot in the battle and won't be able to rejoin.
                </p>
                {isHost && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 justify-center text-orange-400">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-semibold">Warning: You are the host!</span>
                    </div>
                    <p className="text-xs text-orange-300 mt-1">
                      If you leave, the room will be given to another player in the room.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 
                           transition-all duration-300 py-6 font-bebas text-lg tracking-wider"
                >
                  STAY IN ARENA
                </Button>
                <Button
                  onClick={handleLeaveRoom}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 
                           text-white font-bebas text-lg tracking-wider py-6 shadow-lg shadow-red-500/30
                           transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  LEAVE ARENA
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Room Content */}
      <div className="flex items-center justify-center overflow-auto py-16 relative z-10 min-h-screen">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-start z-10">
          {/* LEFT: Room Code + Actions */}
          <div className="space-y-8">
            <Card className="bg-slate-900 border border-orange-500/40 p-10 text-center shadow-lg shadow-orange-500/30 rounded-2xl">
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider flex items-center justify-center gap-3">
                  <Shield className="w-6 h-6 text-foreground" /> Room Code
                </h2>
                <div className="relative">
                  <div
                    className="text-6xl font-mono font-bold tracking-[0.25em] text-white bg-slate-950/60 py-6 px-8 rounded-xl border border-orange-500/40"
                    style={{ boxShadow: "0 0 35px rgba(249, 115, 22, 0.3)" }}
                  >
                    {room.code}
                  </div>
                  <div className="absolute inset-0 bg-orange-500/10 rounded-xl blur-2xl -z-10" />
                </div>
                <p className="text-sm text-slate-400">Share this code with your warriors</p>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              {isHost ? (
                !isReady ? (
                  // Host not ready yet — show "Set Ready" button
                  <Button
                    onClick={handleSetReady}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 rounded-xl transition-all"
                    style={{
                      boxShadow: "0 0 30px rgba(249, 115, 22, 0.4)",
                    }}
                  >
                    SET READY
                  </Button>
                ) : (
                  // Host ready — show "Start Battle" button
                  <Button
                    onClick={handleStartGame}
                    disabled={!allReady}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: allReady ? "0 0 30px rgba(249, 115, 22, 0.4)" : "none",
                    }}
                  >
                    {allReady ? "START BATTLE" : "WAITING FOR WARRIORS..."}
                  </Button>
                )
              ) : (
                // Normal player
                <Button
                  onClick={handleSetReady}
                  className={`w-full text-white font-bold text-lg py-6 rounded-xl transition-all ${
                    isReady
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                  style={{
                    boxShadow: isReady
                      ? "0 0 30px rgba(34, 197, 94, 0.4)"
                      : "0 0 30px rgba(249, 115, 22, 0.4)",
                  }}
                >
                  {isReady ? "READY FOR BATTLE!" : "SET READY"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowLeaveConfirm(true)} // Open modal
                className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 
                         hover:text-red-300 font-semibold py-6 rounded-xl transition-all bg-transparent 
                         transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogOut className="w-5 h-5 mr-2" />
                LEAVE ARENA
              </Button>
            </div>
          </div>

          {/* RIGHT: Players */}
          <Card className="bg-slate-900 border border-orange-500/40 p-8 shadow-lg shadow-orange-500/30 rounded-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white uppercase tracking-wider">Warriors</h2>
                <Badge variant="secondary" className="text-sm bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
                  {players?.length || 0} / {room.maxPlayers}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {players?.map((playerData: any, index: number) => (
                  <div 
                    key={playerData.playerId}
                    className="flex items-center justify-between bg-slate-900/60 px-5 py-3 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      {playerData.isHost && <Crown className="w-5 h-5 text-orange-500" />}
                      <span className="font-medium text-white">{playerData.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {playerData.isHost && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 ">Host</Badge>
                      )}
                      <Badge
                        className={
                          playerData.isReady
                            ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20"
                            : "bg-slate-700/50 text-slate-400 border-slate-600/30 hover:bg-slate-700/50"
                        }
                      >
                        {playerData.isReady ? "Ready" : "Not Ready"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}