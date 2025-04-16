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
    log,
  } = useGameStore()

  const currentPlayer = players[currentPlayerIndex]

  const handleCellClick = (x, y) => {
    if (currentPlayer.type === "human") {
      spreadTo(x, y)
    }
  }

  const countOwnedCells = (playerId) => {
    return map.flat().filter(cell => cell.owner === playerId).length
  }

  const getColorText = (id) => {
    return {
      player: "text-green-400",
      bot1: "text-red-400",
      bot2: "text-purple-400",
      bot3: "text-blue-400",
    }[id] || "text-white"
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col lg:flex-row">
      
      {/* Colonne gauche = Jeu */}
      <div className="flex flex-col gap-4 p-4 w-full lg:w-3/4">
        <h1 className="text-4xl font-bold">Battle Grid: Physarum</h1>

        <div className="bg-[#111827] p-4 rounded shadow text-sm">
          <h2 className="text-xl font-semibold mb-2">Joueurs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {players.map(p => (
              <div key={p.id} className={`${getColorText(p.id)} font-semibold`}>
                {p.id} : {countOwnedCells(p.id)} territoires
              </div>
            ))}
          </div>
        </div>

        <Grid map={map} onCellClick={handleCellClick} />

        {/* Légende et actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex flex-wrap gap-4 text-sm text-white">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-green-500 rounded-sm" /> Joueur
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-500 rounded-sm" /> Bot 1
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-purple-500 rounded-sm" /> Bot 2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 rounded-sm" /> Bot 3
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-gray-500 border border-white rounded-sm" /> Vide
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={endTurn}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Fin de tour
            </button>
            <button
              onClick={resetGame}
              className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700 transition"
            >
              Nouvelle Partie
            </button>
          </div>
        </div>

        {winner && (
          <div className="text-center mt-6 text-2xl font-bold text-yellow-400 animate-bounce">
            🏆 {winner} a gagné la partie !
          </div>
        )}
      </div>

      {/* Colonne droite = Historique */}
      <div className="w-full lg:w-1/4 max-h-screen overflow-y-auto bg-[#111827] p-4">
        <h2 className="text-xl font-bold mb-3">📜 Historique</h2>
        <div className="flex flex-col gap-1 text-sm">
          {log.length === 0 ? (
            <p className="text-gray-500 italic">Aucun événement pour l’instant.</p>
          ) : (
            log.slice().reverse().map((entry, i) => (
              <div key={i} className="text-gray-300">{entry}</div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
