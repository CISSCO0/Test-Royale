"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context"
import { Swords } from "lucide-react";
import { Shield } from "lucide-react";
import { Crown } from "lucide-react";
import { LogOut } from "lucide-react";

export default function RoomPage() {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, player , isLoading, checkAuth } = useAuth();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);
  const [playerName, setPlayerName] = useState("");
  const allReady = room?.players?.every((p: any) => p.isReady) && room?.players?.length >= 2;
  
//   useEffect(() => {
//   const verifyAuth = async () => {
//     await checkAuth();

//     if (isAuthenticated && player) {
//       setPlayerName(player.name);
//     }
//     // } else {
//     //  // router.push("/login");
//     // }
//   };

//   verifyAuth();
// }, [isAuthenticated, player]);


  useEffect(() => {
    const init = async () => {
      try {
        await socketService.connect(""); 
        const response = await socketService.getPlayerRoomInfo();

        if (response.success) {
          setRoom(response.room);
        } else {
          console.error("Error fetching room:", response.error);
        }
      } catch (err) {
        console.error("Socket error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => socketService.disconnect();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading room...</div>;
  if (!room) return <div className="text-center mt-10">No room found</div>;

   const handleLeaveRoom = () => {
    console.log(room.players);
    // sessionStorage.removeItem("roomData");
    // sessionStorage.removeItem("playerData");
    // window.location.href = "/";
  };

  const handleSetReady = () => {
    setIsReady(true);
    socketService.getSocket()?.emit("player_ready", { playerId });
  };

  const handleStartGame = () => {
    socketService.getSocket()?.emit("start_game", { roomCode: room.code });
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        <p className="animate-pulse text-gray-400">Loading room data...</p>
      </div>
    );
  }


  const currentPlayer = room.players?.find((p: any) => p.playerId === playerId);
  const isHost = currentPlayer?.isHost;
return (
  <div className="min-h-screen flex items-center justify-center overflow-auto py-16">
    <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-start z-10">

      {/* LEFT: Room Code + Actions */}
      <div className="space-y-8">
        <Card className="bg-slate-900 border border-orange-500/40 p-10 text-center shadow-lg shadow-orange-500/30 rounded-2xl">
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-orange-500 uppercase tracking-wider flex items-center justify-center gap-3">
              <Shield className="w-6 h-6 text-orange-500" /> Room Code
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
          {!isHost ? (
            <Button
              onClick={handleSetReady}
              disabled={isReady}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: isReady ? "none" : "0 0 30px rgba(249, 115, 22, 0.4)",
              }}
            >
              {isReady ? "READY FOR BATTLE!" : "SET READY"}
            </Button>
          ) : (
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
          )}

          <Button
            variant="outline"
            onClick={handleLeaveRoom}
            className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-semibold py-6 rounded-xl transition-all bg-transparent"
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
            <Badge variant="secondary" className="text-sm bg-orange-500/20 text-orange-400 border-orange-500/30">
              {room.players?.length || 0} / {room.maxPlayers}
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {room.players?.map((player: any, index: number) => (
              <div 
  
                key={player.playerId}
                className="flex items-center justify-between bg-slate-900/60 px-5 py-3 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  {player.isHost && <Crown className="w-5 h-5 text-orange-500" />}
                  <span className="font-medium text-white">{player.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {player.isHost && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Host</Badge>
                  )}
                  <Badge
                    className={
                      player.isReady
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-slate-700/50 text-slate-400 border-slate-600/30"
                    }
                  >
                    {player.isReady ? "Ready" : "Not Ready"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
);
}