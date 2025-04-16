// src/components/GameSetup.jsx
import React, { useState } from "react"
import { useGameStore } from "../store/useGameStore"

const GameSetup = ({ onStart }) => {
  const [playerName, setPlayerName] = useState("Blobzilla")
  const [botCount, setBotCount] = useState(3)
  const [difficulty, setDifficulty] = useState("normal")

  const handleStart = () => {
    useGameStore.getState().setCustomPlayers({ playerName, difficulty, botCount })
    onStart()
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">🎮 Nouvelle Partie</h1>

      <div className="bg-gray-800 p-6 rounded w-full max-w-md flex flex-col gap-4">
        <label>
          Ton nom :
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="mt-1 p-2 w-full rounded bg-gray-700 text-white"
          />
        </label>

        <label>
          Nombre de bots :
          <select
            value={botCount}
            onChange={(e) => setBotCount(Number(e.target.value))}
            className="mt-1 p-2 w-full rounded bg-gray-700 text-white"
          >
            {[0, 1, 2, 3].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulté :
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 p-2 w-full rounded bg-gray-700 text-white"
          >
            <option value="easy">Facile</option>
            <option value="normal">Normale</option>
            <option value="hard">Difficile</option>
          </select>
        </label>

        <button
          onClick={handleStart}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded"
        >
          Lancer la partie 🚀
        </button>
      </div>
    </div>
  )
}

export default GameSetup
