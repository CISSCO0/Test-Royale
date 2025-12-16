"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { socketService } from "@/lib/socket"
import { Swords, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateGameOptions {
  maxPlayers: number;
}

export default function StartPage() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const router = useRouter();
  const { isAuthenticated, player, isLoading, checkAuth } = useAuth();
  const [playerName, setPlayerName] = useState("");
  const [createOptions, setCreateOptions] = useState<CreateGameOptions>({
    maxPlayers: 4,
  });
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRoomExistsModal, setShowRoomExistsModal] = useState(false);
  const [existingRoomCode, setExistingRoomCode] = useState("");
  const [isLoading2, setIsLoading2] = useState(false);

  const isReadyToStart = mode === 'create' 
    ? (playerName) 
    : (playerName && roomCode);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && player) {
      setPlayerName(player.name);
    }
  }, [isAuthenticated, player]);

  // ============ HANDLE CREATE GAME ============
  const handleCreateGame = async () => {
    try {
      setError(null);
      setIsLoading2(true);

      if (!playerName) {
        setError("Please enter your warrior name");
        return;
      }

      // Connect to socket
      await socketService.connect('');
      const socket = socketService.getSocket();
      
      if (!socket) {
        throw new Error("Failed to connect to server");
      }

      // Create the room
      const response = await socketService.createRoom({
        playerName,
        maxPlayers: createOptions.maxPlayers,
      });

      if (response.success && response.room) {
        // Save room data  
        sessionStorage.setItem("roomData", JSON.stringify(response.room));
        sessionStorage.setItem('roomCode', response.room.code);
        router.push('/room');
      } else {
        throw new Error(response.error || "Failed to create room");
      }
      
    } catch (err: any) {
      console.error("Create game error:", err);
      
      // ✅ Better error handling with specific messages
      if (err.message?.includes("already in a room") || 
          err.message?.includes("already in room") ||
          err.message?.includes("already joined")) {
        setError("You're already in a room");
        setShowRoomExistsModal(true);
      } else if (err.message?.includes("Socket not connected")) {
        setError("Connection failed. Please check your internet and try again.");
      } else {
        setError(err.message || "Failed to create room. Please try again.");
      }
    } finally {
      setIsLoading2(false);
    }
  };

  // ============ HANDLE JOIN GAME ============
  const handleJoinGame = async () => {
    try {
      setError(null);
      setIsLoading2(true);

      if (!playerName) {
        setError("Please enter your warrior name");
        return;
      }
      
      if (!roomCode) {
        setError("Please enter a room code");
        return;
      }
    
      // Validate room code format (6 characters, alphanumeric)
      const formattedCode = roomCode.toUpperCase().trim();
      if (formattedCode.length !== 6) {
        setError("Room code must be 6 characters");
        return;
      }
      
      if (!/^[A-Z0-9]{6}$/.test(formattedCode)) {
        setError("Room code must contain only letters and numbers");
        return;
      }

      // Connect to socket
      await socketService.connect('');
      const socket = socketService.getSocket();
      
      if (!socket) {
        throw new Error("Failed to connect to server");
      }

      // Join the room
      const response = await socketService.joinRoom(formattedCode);

      if (response.success && response.room) {
        sessionStorage.setItem("roomData", JSON.stringify(response.room));
        sessionStorage.setItem('roomCode', response.room.code);
        router.push('/room');
      } else {
        throw new Error(response.error || "Failed to join room");
      }

    } catch (err: any) {
      console.error("Join game error:", err);

      // ✅ Specific error messages based on backend response
      const errorMsg = err.message || err;

      if (errorMsg.includes("already in a room") || 
          errorMsg.includes("player is already")) {
        setError("You're already in a room");
        setShowRoomExistsModal(true);
      } 
      else if (errorMsg.includes("not found") || 
               errorMsg.includes("room not found")) {
        setError("Room not found. Check the code and try again.");
      }
      else if (errorMsg.includes("full") || 
               errorMsg.includes("room is full")) {
        setError("This room is full. Maximum players reached.");
      }
      else if (errorMsg.includes("already started") || 
               errorMsg.includes("game has already")) {
        setError("This battle has already begun. You cannot join now.");
      }
      else if (errorMsg.includes("invalid") || 
               errorMsg.includes("format")) {
        setError("Invalid room code format. Must be 6 letters/numbers.");
      }
      else if (errorMsg.includes("player not found")) {
        setError("Player session expired. Please refresh and try again.");
      }
      else if (errorMsg.includes("Socket not connected")) {
        setError("Connection failed. Please check your internet and try again.");
      }
      else {
        setError(errorMsg || "Failed to join room. Please try again.");
      }
    } finally {
      setIsLoading2(false);
    }
  };

  // ============ HANDLE LEAVE & JOIN NEW ============
  const handleLeaveAndJoin = async () => {
    try {
      setError(null);
      await socketService.leaveRoom();
      setShowRoomExistsModal(false);
      setRoomCode("");
      // Don't auto-retry, let user try again
    } catch (err: any) {
      console.error("Leave room error:", err);
      setError("Failed to leave existing room. Please try again.");
    }
  };

  // ============ HANDLE GO TO ROOM ============
  const handleGoToRoom = async () => {
    try {
      router.push('/room');
      setShowRoomExistsModal(false);
    } catch (err: any) {
      console.error("Navigation error:", err);
      setError("Failed to navigate to room");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
          {/* ERROR TOAST - Top Right */}
       {error && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md 
                  animate-in fade-in slide-in-from-top-4 duration-300">
    <Alert className="bg-red-900/95 border-red-500/50 shadow-2xl shadow-red-500/20 relative p-4">
      <AlertCircle className="h-5 w-5 text-red-400" />
      <AlertDescription className="text-red-200 ml-2">
        {error}
      </AlertDescription>

      <button
        onClick={() => setError(null)}
        className="absolute right-3 top-3 text-red-400 hover:text-red-300"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  </div>
)}

<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Already in Room Modal */}
          {showRoomExistsModal && (
            <div className="fixed h-full inset-0 bg-blue/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <Card className="relative bg-slate-900/95 border-2 border-orange-500/50 p-8 max-w-md w-full shadow-2xl shadow-orange-500/20 rounded-2xl">
                <button
                  onClick={() => setShowRoomExistsModal(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
                      <Swords className="w-12 h-12 text-orange-500" />
                    </div>
                  </div>
                  
                  <h3 className="font-bebas text-4xl text-white tracking-wider">
                    ALREADY IN BATTLE
                  </h3>
                  
                  <p className="text-slate-300">
                    You're already in a battle arena!
                  </p>
                  
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleGoToRoom}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 
                               text-white font-bebas text-lg tracking-wider py-6"
                    >
                      GO TO MY ROOM
                    </Button>
                    
                    <Button
                      onClick={handleLeaveAndJoin}
                      variant="outline"
                      className="w-full bg-blue border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 
                               hover:border-red-500/50 transition-all py-4 font-medium"
                    >
                      LEAVE ROOM & JOIN NEW
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setShowRoomExistsModal(false)}
                      className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 py-3 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-bebas text-8xl tracking-wider">
              <span className="text-foreground">TEST </span>
              <span className="text-orange-500">ROYALE</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Face off against others to write smarter, stronger unit tests.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                setMode("create");
                setError(null);
              }}
              className="px-8 py-3 text-lg font-bebas tracking-wider transition-all duration-200"
              style={{
                backgroundColor: mode === "create" ? 'var(--chart-3)' : 'var(--secondary)',
                color: 'var(--secondary-foreground)',
              }}
            >
              CREATE GAME
            </Button>
            <Button
              onClick={() => {
                setMode("join");
                setError(null);
              }}
              className="px-8 py-3 text-lg font-bebas tracking-wider transition-all duration-200"
              style={{
                backgroundColor: mode === "join" ? 'var(--chart-3)' : 'var(--secondary)',
                color: 'var(--secondary-foreground)',
              }}
            >
              JOIN GAME
            </Button>
          </div>

          {/* Game Setup Card */}
          <Card className="relative bg-card/95 backdrop-blur-md border p-8 space-y-6 shadow-xl"
            style={{ borderColor: 'var(--border)' }}>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <h2 className="font-bebas text-3xl text-primary tracking-wider relative z-10">
              {mode === 'create' ? 'CREATE BATTLE' : 'JOIN BATTLE'}
            </h2>

            <div className="space-y-6 relative z-10">
              {/* Player Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  disabled={isAuthenticated}
                  className="bg-input/50 text-foreground placeholder-muted-foreground 
                    focus:ring-1 transition-all duration-200"
                  style={{ borderColor: 'var(--border)' }}
                />
                {isAuthenticated && (
                  <p className="text-xs text-muted-foreground">
                    Using your registered username
                  </p>
                )}
              </div>

              {mode === 'create' ? (
                <>
                  {/* Create Game Options */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-foreground">MAX PLAYERS</label>
                      <div className="relative">
                        <select
                          value={createOptions.maxPlayers}
                          onChange={(e) => setCreateOptions(prev => ({
                            ...prev,
                            maxPlayers: Number(e.target.value)
                          }))}
                          className="bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full appearance-none pr-8"
                        >
                          {Array.from({ length: 22 - 2 + 1 }, (_, i) => i + 2).map(num => (
                            <option key={num} value={num}>{num} Players</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Join Game Input */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Room Code
                  </label>
                  <Input
                    placeholder="Enter room code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-input/50 text-foreground placeholder-muted-foreground 
                      focus:ring-1 transition-all duration-200 font-mono text-lg"
                    style={{ borderColor: 'var(--border)' }}
                    maxLength={6}
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={mode === 'create' ? handleCreateGame : handleJoinGame}
                disabled={!isReadyToStart || isLoading2}
                className="font-bebas text-2xl tracking-wider px-12 py-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400
                 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading2 ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  mode === 'create' ? 'CREATE BATTLE' : 'JOIN BATTLE'
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

