// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Shield, Users, Crown, Plus } from "lucide-react";
// import { socketService } from '@/lib/socket';
// import {Room } from '@/interface/Room';

// export function RoomList() {
//   const router = useRouter();
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [isCreating, setIsCreating] = useState(false);
//   const [challengeCode, setChallengeCode] = useState('');
//   const [playerName, setPlayerName] = useState('');

//   useEffect(() => {
//     const token = localStorage.getItem('auth_token');
//     if (!token) return;

//     socketService.connect(token);
    
//     const loadRooms = async () => {
//       try {
//         const roomList:any = await socketService.getRoom();
//         setRooms(roomList);
//       } catch (error) {
//         console.error('Failed to load rooms:', error);
//       }
//     };

//     loadRooms();

//     // Listen for room updates
//     socketService.onRoomCreated((room:any) => {
//       setRooms(prev => [...prev, room]);
//     });

//     socketService.onRoomUpdated((room:any) => {
//       setRooms(prev => prev.map(r => r.code === room.code ? room : r));
//     });

//     socketService.onRoomDeleted((roomCode) => {
//       setRooms(prev => prev.filter(r => r.code !== roomCode));
//     });

//     return () => socketService.disconnect();
//   }, []);

//   const handleCreateRoom = async () => {
//     if (!playerName || !challengeCode) return;

//     setIsCreating(true);
//     try {
//       const response = await socketService.createRoom({
//         playerName,
//         challengeCode,
//         maxPlayers: 4,
//         isPrivate: false
//       });

//       if (response.room) {
//         router.push(`/room?code=${response.room.code}`);
//       }
//     } catch (error) {
//       console.error('Failed to create room:', error);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Card className="p-6 bg-slate-900/95 border-cyan-500/30">
//         <h2 className="text-2xl font-bold text-white mb-4">Create Room</h2>
//         <div className="space-y-4">
//           <Input
//             placeholder="Your Name"
//             value={playerName}
//             onChange={(e) => setPlayerName(e.target.value)}
//             className="bg-slate-950/50 border-cyan-500/30"
//           />
//           <Input
//             placeholder="Challenge Code"
//             value={challengeCode}
//             onChange={(e) => setChallengeCode(e.target.value)}
//             className="bg-slate-950/50 border-cyan-500/30"
//           />
//           <Button
//             onClick={handleCreateRoom}
//             disabled={isCreating || !playerName || !challengeCode}
//             className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500"
//           >
//             {isCreating ? (
//               <div className="flex items-center gap-2">
//                 <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
//                 Creating...
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Plus className="w-4 h-4" />
//                 Create Battle Room
//               </div>
//             )}
//           </Button>
//         </div>
//       </Card>

//       <div className="grid gap-4">
//         {rooms.map((room:any) => (
//           <Card 
//             key={room.code}
//             className="p-4 bg-slate-900/95 border-cyan-500/30 hover:border-cyan-400/50 transition-colors"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Shield className="w-5 h-5 text-cyan-400" />
//                 <div>
//                   <p className="text-white font-medium">Room #{room.code}</p>
//                   <p className="text-sm text-slate-400">
//                     Challenge: {room.challengeCode}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Users className="w-4 h-4 text-cyan-400" />
//                   <span className="text-slate-400">
//                     {room.players.length}/4
//                   </span>
//                 </div>
//                 <Button
//                   onClick={() => router.push(`/room?code=${room.code}`)}
//                   disabled={room.gameStarted}
//                   variant="outline"
//                   className="border-cyan-500/30 hover:bg-cyan-500/10"
//                 >
//                   Join
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }