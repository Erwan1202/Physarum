import { useGameStore } from "../store/useGameStore"

export default function GameOverScreen() {
  const { winner, players, resetGame } = useGameStore()

  if (!winner) return null

  const winnerObj = players.find(p => p.id === winner)
  const isPlayer = winner === "player"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 text-white flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center p-10 bg-[#1f2937] rounded-lg shadow-xl">
        <h2 className="text-4xl font-bold mb-4 animate-pulse">
          {isPlayer ? "🎉 Victoire !" : "💀 Défaite..."}
        </h2>
        <p className="mb-6 text-lg">
          {isPlayer
            ? "Tu as dominé la grille. Bravo !"
            : `${winnerObj?.name || winner} a remporté la partie.`}
        </p>
        <button
          onClick={resetGame}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-bold transition"
        >
          🔄 Rejouer
        </button>
      </div>
    </div>
  )
} 

