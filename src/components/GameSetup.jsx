// src/components/GameSetup.jsx
import { useState } from "react"
import { useGameStore } from "../store/useGameStore"

function GameSetup({ onStart }) {
  const [playerName, setPlayerName] = useState("Joueur")
  const [difficulty, setDifficulty] = useState("normal")
  const [botCount, setBotCount] = useState(3)

  const setCustomPlayers = useGameStore(state => state.setCustomPlayers)

  const handleStart = () => {
    
    setCustomPlayers({ playerName, difficulty, botCount })    
    onStart() 
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold mb-4">Paramètres de la partie</h1>

      <div className="bg-[#111827] p-6 rounded shadow-md w-full max-w-md space-y-4">
        <div>
          <label className="block mb-1 text-sm">👤 Ton pseudo :</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">🎯 Difficulté :</label>
          <select
            className="w-full px-3 py-2 rounded bg-gray-800 text-white"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Facile</option>
            <option value="normal">Normale</option>
            <option value="hard">Difficile</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">🤖 Nombre de bots :</label>
          <input
            type="number"
            min={0}
            max={3}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white"
            value={botCount}
            onChange={(e) => setBotCount(parseInt(e.target.value))}
          />
        </div>

        <button
          onClick={handleStart}
          className="w-full py-2 mt-4 bg-green-600 hover:bg-green-700 transition rounded text-white font-bold"
        >
          Lancer la partie 🚀
        </button>
      </div>
    </div>
  )
}

export default GameSetup
