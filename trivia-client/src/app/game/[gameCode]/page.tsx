//src/app/game/[gameCode]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const gameCodeParam = params?.gameCode as string;

  const playerName = useGameStore((state) => state.playerName);
  const playerId = useGameStore((state) => state.playerId); // ensure you save newPlayerId here
  const players = useGameStore((state) => state.players);
  const setPlayers = useGameStore((state) => state.setPlayers);
  const isHost = useGameStore((state) => state.isHost);
  const resetGame = useGameStore((state) => state.resetGame);

  const [error, setError] = useState<string | null>(null);

  // Redirect if lobby state is invalid (as in your previous implementation)
  useEffect(() => {
    // (Your existing lobby access validation logic)
    if (!playerName || !gameCodeParam) {
      console.warn("Redirecting: Missing player or game info.");
      resetGame();
      router.push("/");
    }
  }, [playerName, gameCodeParam, resetGame, router]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${gameCodeParam}`);

    ws.onopen = () => {
      console.log("WebSocket connected on lobby page");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "game_started") {
          // When the game starts, navigate all clients to the play page
          router.push(`/game/${gameCodeParam}/play`);
        }
        if (data.event === "player_joined") {
          // Update the lobby players list in real time
          setPlayers(data.players);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (err) => {
      if (err && Object.keys(err).length > 0) {
        console.error("WebSocket error:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed on lobby page");
    };

    return () => ws.close();
  }, [gameCodeParam, router, setPlayers]);

  // Function for the host to start the game
  const handleStartGame = async () => {
    try {
      const response = await fetch("http://localhost:8000/lobby/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: gameCodeParam, player_id: playerId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start game");
      }
      // The game start event will be broadcast via WebSocket to all clients
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Start game failed:", error);
      setError(error.message || "Error starting game");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          NexusQuiz Lobby
        </h1>
        <p className="text-xl text-purple-300 font-light">
          Game Code:{" "}
          <span className="font-semibold tracking-widest bg-gray-800 px-3 py-1 rounded-md shadow-inner">
            {gameCodeParam}
          </span>
        </p>
      </header>

      <main className="w-full max-w-md bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-purple-700/50">
        <h2 className="text-2xl font-semibold mb-5 text-center text-purple-300 border-b border-purple-600/50 pb-3">
          Players in Lobby ({players.length})
        </h2>

        <ul className="space-y-3 mb-6 h-48 overflow-y-auto pr-2 custom-scrollbar">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between bg-gray-700/80 p-3 rounded-lg shadow hover:bg-gray-600/80 transition-colors duration-200"
            >
              <span className="font-medium text-lg text-gray-100">
                {player.name}
              </span>
              {player.name === playerName && (
                <span className="text-xs font-bold text-green-400">(You)</span>
              )}
              {isHost && player.name === playerName && (
                <span className="text-xs font-bold text-yellow-400">
                  (Host)
                </span>
              )}
            </li>
          ))}
        </ul>

        {isHost ? (
          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-400"
          >
            Start Game!
          </button>
        ) : (
          <p className="text-center text-lg text-purple-300 italic animate-pulse">
            Waiting for the host to start the game...
          </p>
        )}

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        Powered by Next.js & FastAPI | © {new Date().getFullYear()} NexusQuiz
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 48, 163, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(167, 139, 250, 0.6);
          border-radius: 10px;
          border: 2px solid rgba(55, 48, 163, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(167, 139, 250, 0.8);
        }
      `}</style>
    </div>
  );
}
