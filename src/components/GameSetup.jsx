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
    <div className="min-h-screen w-full bg-[#0a0f1c] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        <h1 className="text-4xl font-bold text-center">Paramètres de la partie</h1>

        <div className="bg-[#111827] p-8 rounded shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="md:col-span-2">
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
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 bg-green-600 hover:bg-green-700 transition rounded text-white font-bold text-lg"
          >
            Lancer la partie 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameSetup
