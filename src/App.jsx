import Grid from "./components/Grid"
import { useGameStore } from "./store/useGameStore"

function App() {
  const map = useGameStore((s) => s.map)
  const spreadTo = useGameStore((s) => s.spreadTo)
  const energy = useGameStore((s) => s.energy)
  const biomass = useGameStore((s) => s.biomass)
  const turn = useGameStore((s) => s.turn)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const players = useGameStore((s) => s.players)
  const endTurn = useGameStore((s) => s.endTurn)
  const resetGame = useGameStore((s) => s.resetGame)

  const currentPlayer = players[currentPlayerIndex]

  const handleCellClick = (x, y) => {
    if (currentPlayer.type === 'human') {
      spreadTo(x, y)
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Battle Grid: Physarum</h1>

      <div className="mb-4 text-center">
        <p>🎮 Tour {turn} — Joueur : <span className="text-blue-400">{currentPlayer.id}</span></p>
        <p>⚡️ Énergie : <span className="text-yellow-400 font-semibold">{energy}</span></p>
        <p>🧬 Biomasse : <span className="text-green-400 font-semibold">{biomass}</span></p>
      </div>

      <Grid map={map} onCellClick={handleCellClick} />

      {currentPlayer.type === 'human' && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={endTurn}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-bold"
          >
            Fin de tour
          </button>
          
          <button
          onClick={resetGame}
          className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700 transition hover:scale-105 active:scale-95"
        >
          Nouvelle Partie
        </button>

        </div>
      )}
    </div>
  )
}

export default App
