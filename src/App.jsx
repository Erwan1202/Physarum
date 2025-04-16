import { useState } from "react"
import GameSetup from "./components/GameSetup"
import GameBoard from "./components/GameBoard"
function App() {
  const [started, setStarted] = useState(false)

  return started ? <GameBoard /> : <GameSetup onStart={() => setStarted(true)} />
}

export default App
