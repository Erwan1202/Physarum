import Grid from "./components/Grid"
import { useGameStore } from "./store/useGameStore"

function App() {
  const { map, spreadTo, currentPlayerIndex, players, endTurn, resetGame, winner } = useGameStore()

  const currentPlayer = players[currentPlayerIndex]

  const handleCellClick = (x, y) => {
    if (currentPlayer.type === 'human') {
      spreadTo(x, y)
    }
  }

  // 🎨 Utilitaire pour la couleur du texte dans le scoreboard
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

  // 🧠 Calcul du nombre de cases possédées
  const countOwnedCells = (playerId) => {
    return map.flat().filter(cell => cell.owner === playerId).length
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold">Battle Grid: Physarum</h1>

      <div className="flex justify-center gap-4 my-2 text-white">
        {players.map(p => (
          <div key={p.id} className={`text-sm font-semibold ${getColorText(p.id)}`}>
            {p.id} : {countOwnedCells(p.id)} 🔷
          </div>
        ))}
      </div>

      <Grid map={map} onCellClick={handleCellClick} />

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

      {/* ✅ Message de victoire */}
      {winner && (
        <div className="text-center mt-6 text-2xl font-bold text-yellow-400 animate-bounce">
          🏆 {winner} a gagné la partie !
        </div>
      )}
    </div>
  )
}

export default App
