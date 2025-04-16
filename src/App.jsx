import { useState } from "react"
import GameSetup from "./components/GameSetup"
import GameBoard from "./components/GameBoard" // <- ton écran principal avec la grille

function App() {
  const [started, setStarted] = useState(false)

  return (
    <>
      {started ? (
        <GameBoard />
      ) : (
        <GameSetup onStart={() => setStarted(true)} />
      )}
    </>
  )
}

export default App
