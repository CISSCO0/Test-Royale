"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { } from "@/lib/api"
import { socketService } from "@/lib/socket"
import Error from "next/error"
interface CreateGameOptions {
  isPrivate: boolean;
  maxPlayers: number;
}

export default function StartPage() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const router = useRouter();
  const { isAuthenticated, player , isLoading, checkAuth } = useAuth();
  const [playerName, setPlayerName] = useState("");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);
  const [createOptions, setCreateOptions] = useState<CreateGameOptions>({
    isPrivate: false,
    maxPlayers: 4
  });

  // For join mode only
  const [roomCode, setRoomCode] = useState("");
  
  // Update ready state based on mode
  const isReadyToStart = mode === 'create' 
    ? (playerName ) 
    : (playerName && roomCode);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && player) {
      setPlayerName(player.name);
    }
    // else {
    // //  router.push("/login")
    // }
  }, [isAuthenticated, player]);
	
	


// StartPage.tsx (simplified)
const handleCreateGame = async () => {
  try{
  if (!playerName) return;

  // Connect to socket
  await socketService.connect('');

  // Create the room
  const response = await socketService.createRoom({
    playerName,
    maxPlayers: 4,
    isPrivate: false,
  });

  if (response.success) {
    // Save room data
    sessionStorage.setItem("roomData", JSON.stringify(response.room));
    //setRoom(response.room);
    // Go to room page
    router.push('/room');
  } else {
    console.error("Failed to create room:", response.error);
  }
}catch(error)
{
  console.log("failed to create a room" +error)
}
};


  const handleJoinGame = async () => {
    if (!playerName || !roomCode) return;

      // Connect to socket
      await socketService.connect('');
      
  // join a room
  
    // 2️⃣ Join the room (pass code directly)
    const response = await socketService.joinRoom(roomCode.toUpperCase());

    if (response.success){
    
    
    // Navigate to room with code
    router.push(`/room?code=${roomCode}`);
  }
  else {
    console.error("Failed to join room:", response.error);
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
		<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-8">
					{/* Header */}
					<div className="text-center space-y-4">
  <h1 className="font-bebas text-8xl tracking-wider">
    <span className="text-foreground">TEST </span>
    <span className="text-primary">ROYALE</span>
  </h1>
  <p className="text-muted-foreground text-lg">
    Face off against others to write smarter, stronger unit tests.
  </p>
</div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setMode("create")}
            className="px-8 py-3 text-lg font-bebas tracking-wider transition-all duration-200"
            style={{
              backgroundColor: mode === "create" ? 'var(--primary)' : 'var(--secondary)',
              color: mode === "create" ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
            }}
          >
            CREATE GAME
          </Button>
          <Button
            onClick={() => setMode("join")}
            className="px-8 py-3 text-lg font-bebas tracking-wider transition-all duration-200"
            style={{
              backgroundColor: mode === "join" ? 'var(--primary)' : 'var(--secondary)',
              color: mode === "join" ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
            }}
          >
            JOIN GAME
          </Button>
        </div>

          {/* Game Setup Card */}
          <Card className="relative bg-card/95 backdrop-blur-md border p-8 space-y-6 shadow-xl"
            style={{ borderColor: 'var(--border)' }}>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <h2 className="font-bebas text-3xl text-foreground tracking-wider relative z-10">
              {mode === 'create' ? 'CREATE BATTLE' : 'JOIN BATTLE'}
            </h2>

            <div className="space-y-6 relative z-10">
              {/* Player Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">
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
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createOptions.isPrivate}
                        onChange={(e) => setCreateOptions(prev => ({
                          ...prev,
                          isPrivate: e.target.checked
                        }))}
                        className="rounded border-primary/30 bg-input/50"
                      />
                      <span className="text-sm text-foreground">Private Room</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-foreground">Players:</label>
                      <select
                        value={createOptions.maxPlayers}
                        onChange={(e) => setCreateOptions(prev => ({
                          ...prev,
                          maxPlayers: Number(e.target.value)
                        }))}
                        className="bg-input/50 border-primary/30 rounded text-sm"
                      >
                        {[2,3,4,5,6,7,8].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Join Game Input */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">
                    Room Code
                  </label>
                  <Input
                    placeholder="Enter room code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="bg-input/50 text-foreground placeholder-muted-foreground 
                      focus:ring-1 transition-all duration-200 font-mono text-lg"
                    style={{ borderColor: 'var(--border)' }}
                    maxLength={10}
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button
              onClick={mode === 'create' ? handleCreateGame : handleJoinGame}
              disabled={!isReadyToStart}
              className="font-bebas text-2xl tracking-wider px-12 py-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400
               text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'CREATE BATTLE' : 'JOIN BATTLE'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
	)
}

