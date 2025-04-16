import Grid from "./components/Grid"
import { useGameStore } from "./store/useGameStore"

function App() {
  const {
    map,
    spreadTo,
    currentPlayerIndex,
    players,
    endTurn,
    resetGame,
    winner,
    log = [], // historique des actions avec fallback par défaut
  } = useGameStore()

  const currentPlayer = players[currentPlayerIndex]

  const handleCellClick = (x, y) => {
    if (currentPlayer.type === "human") {
      spreadTo(x, y)
    }
  }

  const getColorText = (owner) => {
    switch (owner) {
      case "player":
        return "text-green-400"
      case "bot1":
        return "text-red-400"
      case "bot2":
        return "text-fuchsia-400"
      case "bot3":
        return "text-blue-400"
      default:
        return "text-white"
    }
  }

  const countOwnedCells = (playerId) => {
    return map.flat().filter((cell) => cell.owner === playerId).length
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold">Battle Grid: Physarum</h1>

      {/* Tableau des informations des joueurs */}
      <div className="w-full max-w-3xl bg-gray-900 p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">Joueurs</h2>
        <div className="grid grid-cols-2 gap-4">
          {players.map((p) => (
            <div
              key={p.id}
              className={`text-sm font-semibold ${getColorText(p.id)}`}
            >
              {p.id} : {countOwnedCells(p.id)} territoires
            </div>
          ))}
        </div>
      </div>

      {/* Grille du jeu */}
      <Grid map={map} onCellClick={handleCellClick} />

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={endTurn}
          className="bg-white text-black px-4 py-2 rounded hover:bg-yellow-300 transition font-semibold"
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

      {/* Historique des mouvements */}
      <div className="w-full max-w-3xl bg-gray-900 p-4 rounded shadow-md mt-4">
        <h2 className="text-xl font-semibold mb-2">Mouvements en direct</h2>
        <div className="h-40 overflow-y-auto text-sm font-mono space-y-1">
          {(log || []).map((entry, index) => (
            <div key={index} className="text-gray-400">
              {entry}
            </div>
          ))}
        </div>
      </div>

      {/* Message de victoire */}
      {winner && (
        <div className="text-center mt-6 text-2xl font-bold text-yellow-400 animate-bounce">
          🏆 {winner} a gagné la partie !
        </div>
      )}
    </div>
  )
}

export default App