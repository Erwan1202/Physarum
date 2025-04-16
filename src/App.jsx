import Grid from "./components/Grid"
import { useGameStore } from "./store/useGameStore"

function App() {
  const map = useGameStore((state) => state.map)
  const spreadTo = useGameStore((state) => state.spreadTo)

  const handleCellClick = (x, y) => {
    spreadTo(x, y)
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Battle Grid: Physarum</h1>
      <Grid map={map} onCellClick={handleCellClick} />
    </div>
  )
}

export default App
