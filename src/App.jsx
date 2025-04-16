import Grid from "./components/Grid"
import { useGameStore } from "./store/useGameStore"

function App() {
  const {map, spreadTo, currentPlayerIndex, players, endTurn, resetGame, winner} = useGameStore()

  const currentPlayer = players[currentPlayerIndex]

  const handleCellClick = (x, y) => {
    if (currentPlayer.type === 'human') {
      spreadTo(x, y)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold">Battle Grid: Physarum</h1>
  
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
