// src/app/game/[gameCode]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore, Player, GameState } from '@/store/gameStore'; // Import Player & GameState types

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const gameCodeParam = params?.gameCode as string || 'N/A';

  // --- Get State from Zustand with proper typing ---
  const {
    playerName,
    gameCode: storedGameCode,
    players,
    isHost,
    gameStatus,
    addPlayer,
    startGame,
    resetGame,
  } = useGameStore((state: GameState) => ({
    playerName: state.playerName,
    gameCode: state.gameCode,
    players: state.players,
    isHost: state.isHost,
    gameStatus: state.gameStatus,
    addPlayer: state.addPlayer,
    startGame: state.startGame,
    resetGame: state.resetGame,
  }));

  // --- Effect to potentially simulate others joining or handle game status changes ---
  useEffect(() => {
    // Redirect if trying to access lobby directly without joining
    if (gameStatus === 'joining' || storedGameCode !== gameCodeParam) {
      console.warn("Redirecting: Invalid lobby access or state mismatch.");
      resetGame();
      router.push('/');
    }

    // Simulate another player joining after 3 seconds (for demo)
    const timer = setTimeout(() => {
      // Prevent adding if already added or if not in lobby state
      if (gameStatus === 'lobby' && !players.find(p => p.name === 'BotPlayer')) {
        addPlayer({ id: crypto.randomUUID(), name: 'BotPlayer' });
      }
    }, 3000);

    // Navigate away if game starts (triggered by startGame action)
    if (gameStatus === 'playing') {
        console.log('Navigating to game screen (placeholder)...');
        // Replace with actual navigation when the play screen exists
        // router.push(`/game/${storedGameCode}/play`);
        alert('Game Started! (Navigation Placeholder)'); // Placeholder alert
    }

    return () => clearTimeout(timer); // Cleanup timer

  }, [gameStatus, storedGameCode, gameCodeParam, players, addPlayer, router, resetGame]); // Add dependencies

  const handleStartGame = () => {
    startGame(); // Call the Zustand action
  };

  // --- Render Logic ---
  // Show loading or redirect indicator if state isn't ready
   if (gameStatus === 'joining' || storedGameCode !== gameCodeParam) {
       return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
               <p className="text-xl animate-pulse">Loading Lobby...</p>
           </div>
       );
   }

  // --- Actual Lobby UI (Similar to before, but uses Zustand state) ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          NexusQuiz Lobby
        </h1>
        <p className="text-xl text-purple-300 font-light">
          Game Code: <span className="font-semibold tracking-widest bg-gray-800 px-3 py-1 rounded-md shadow-inner">{gameCodeParam}</span>
        </p>
      </header>

      <main className="w-full max-w-md bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-purple-700/50">
        <h2 className="text-2xl font-semibold mb-5 text-center text-purple-300 border-b border-purple-600/50 pb-3">
          Players in Lobby ({players.length}) {/* Use Zustand players */}
        </h2>

        <ul className="space-y-3 mb-6 h-48 overflow-y-auto pr-2 custom-scrollbar">
          {players.map((player) => ( // Use Zustand players
            <li
              key={player.id}
              className="flex items-center justify-between bg-gray-700/80 p-3 rounded-lg shadow hover:bg-gray-600/80 transition-colors duration-200"
            >
              <span className="font-medium text-lg text-gray-100">{player.name}</span>
              {/* Use Zustand playerName for comparison */}
              {player.name === playerName && <span className="text-xs font-bold text-green-400">(You)</span>}
              {/* Use Zustand isHost and check if this player is the host */}
              {isHost && player.name === playerName && <span className="text-xs font-bold text-yellow-400">(Host)</span>}
            </li>
          ))}
          {/* Add a loading indicator if needed */}
        </ul>

        {isHost ? ( // Use Zustand isHost
          <button
            onClick={handleStartGame} // Calls Zustand action
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-400"
          >
            Start Game!
          </button>
        ) : (
          <p className="text-center text-lg text-purple-300 italic animate-pulse">
            Waiting for the host to start the game...
          </p>
        )}
      </main>

       <footer className="mt-8 text-center text-gray-500 text-sm">
         Powered by Next.js & FastAPI | © {new Date().getFullYear()} NexusQuiz
       </footer>
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(55, 48, 163, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(167, 139, 250, 0.6); border-radius: 10px; border: 2px solid rgba(55, 48, 163, 0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(167, 139, 250, 0.8); }
      `}</style>
    </div>
  );
}