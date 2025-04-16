import Grid from "./components/Grid"
import { useGameStore } from "./store/useGameStore"

function App() {
  const map = useGameStore((s) => s.map)
  const spreadTo = useGameStore((s) => s.spreadTo)
  const energy = useGameStore((s) => s.energy)
  const biomass = useGameStore((s) => s.biomass)

  const handleCellClick = (x, y) => {
    spreadTo(x, y)
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Battle Grid: Physarum</h1>

      <div className="mb-4 text-center">
        <p>⚡️ Énergie : <span className="text-yellow-400 font-semibold">{energy}</span></p>
        <p>🧬 Biomasse : <span className="text-green-400 font-semibold">{biomass}</span></p>
      </div>

      <Grid map={map} onCellClick={handleCellClick} />
    </div>
  )
}

export default App
