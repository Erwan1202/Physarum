import Grid from "./Grid"
import { useGameStore } from "./../store/useGameStore"
import { useEffect, useRef, useState } from "react"

function App() {
  const {
    map,
    buildBaseAt,
    destroyBaseAt,
    currentPlayerIndex,
    players,
    endTurn,
    winner,
    log,
    gameover,
    biomass,
    energy,
    turn,
  } = useGameStore()

  const currentPlayer = players[currentPlayerIndex]
  const [filter, setFilter] = useState("all")
  const logEndRef = useRef(null)
  const [darkMode, setDarkMode] = useState(true)
  const [selectedCoords, setSelectedCoords] = useState(null)

  const handleCellClick = (x, y) => {
    if (gameover) return
    if (currentPlayer.type === "human") {
      setSelectedCoords({ x, y })
    }
  }

  const confirmBuildBase = () => {
    if (selectedCoords) buildBaseAt(selectedCoords.x, selectedCoords.y)
    setSelectedCoords(null)
  }

  const confirmDestroyBase = () => {
    if (selectedCoords) destroyBaseAt(selectedCoords.x, selectedCoords.y)
    setSelectedCoords(null)
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

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log])

  const filteredLog = filter === "all"
    ? log
    : log.filter(entry => entry.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"} p-4`}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_600px] gap-6 max-w-[1920px] mx-auto">
        {/* Colonne gauche = Jeu */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Battle Grid: Physarum</h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="border px-2 py-1 rounded text-sm"
            >
              {darkMode ? "☀️ Mode Clair" : "🌙 Mode Sombre"}
            </button>
          </div>

          <div className="bg-[#111827] p-4 rounded shadow text-sm mt-2">
            <h2 className="text-xl font-semibold mb-2">Joueurs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {players.map(p => (
                <div key={p.id} className={`${getColorText(p.id)} font-semibold`}>
                  {p.name || p.id} : {countOwnedCells(p.id)} territoires
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded text-sm font-mono mb-4">
            <p className="mb-1 text-green-400 font-bold">🎮 {currentPlayer.name}</p>
            <p>⚡ Énergie : <span className="text-yellow-300">{energy}</span> 
             🧬 Biomasse : <span className="text-pink-300">{biomass}</span>
             ⏳ Tour : <span className="text-gray-300">{turn}</span></p>
          </div>

          <Grid map={map} onCellClick={handleCellClick} showBases />

          {selectedCoords && (
            <div className="bg-gray-800 p-3 rounded mt-2 flex gap-4 justify-center">
              <button
                onClick={confirmBuildBase}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
              >
                🏗️ Construire une base en ({selectedCoords.x}, {selectedCoords.y})
              </button>
              <button
                onClick={confirmDestroyBase}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
              >
                💥 Détruire la base
              </button>
              <button
                onClick={() => setSelectedCoords(null)}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                ❌ Annuler
              </button>
            </div>
          )}

          {currentPlayer.type === 'human' && !gameover && (
            <div className="text-yellow-300 text-center font-semibold animate-pulse">
              ✋ À vous de jouer ! Cliquez sur une case pour interagir.
            </div>
          )}

          {winner && (
            <div className="text-center mt-6 text-2xl font-bold text-yellow-400 animate-bounce">
              🏆 {winner} a gagné la partie !
            </div>
          )}

          {gameover && !winner && (
            <div className="text-center mt-6 text-2xl font-bold text-red-400 animate-bounce">
              🚫 La partie est terminée !
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <button
              onClick={endTurn}
              disabled={gameover}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Fin de tour
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700 transition"
            >
              Nouvelle Partie
            </button>
          </div>
        </div>

        {/* Colonne droite = Historique */}
        <div className="w-full flex flex-col bg-[#111827] p-4 rounded max-h-[calc(100vh-100px)]">
          <div className="sticky top-0 z-10 bg-[#111827] pb-2">
            <h2 className="text-xl font-bold mb-3">📜 Historique</h2>
            <div className="flex gap-2 mb-2 text-xs flex-wrap">
              {['all', ...players.map(p => p.id)].map(p => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-2 py-1 rounded border ${filter === p ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
                >
                  {p === 'all' ? 'Tous' : players.find(pl => pl.id === p)?.name || p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm overflow-y-auto pr-2">
            {filteredLog.length === 0 ? (
              <p className="text-gray-500 italic">Aucun événement pour l’instant.</p>
            ) : (
              filteredLog.slice().reverse().map((entry, i) => (
                <div key={i} className="text-gray-300 whitespace-pre-wrap">{entry}</div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App