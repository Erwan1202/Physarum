import Grid from "./Grid"
import { useGameStore } from "./../store/useGameStore"
import { useEffect, useRef, useState } from "react"

function App() {
  const {
    map,
    buildBaseAt,
    destroyBaseAt,
    spreadTo,
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
  const lastClick = useRef(null)
  const [showGuide, setShowGuide] = useState(false)


  const handleCellClick = (x, y) => {
    if (gameover || currentPlayer.type !== "human") return

    const cell = map[y][x]
    const now = Date.now()

    if (lastClick.current && now - lastClick.current < 250) {
      if (cell.owner === currentPlayer.id) buildBaseAt(x, y)
      lastClick.current = null
    } else {
      lastClick.current = now
      if (cell.owner !== currentPlayer.id) {
        spreadTo(x, y)
      } else {
        setSelectedCoords({ x, y })
      }
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
        bot4: "text-yellow-400",
        bot5: "text-orange-400",
        bot6: "text-pink-400",
    }[id] || "text-transparent"
  }

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [log])
  

  const filteredLog = filter === "all"
    ? log
    : log.filter(entry => entry.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"} p-4 overflow-x-hidden`}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_600px] gap-6 max-w-[1920px] mx-auto">
        {/* Colonne gauche = Jeu */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Battle Grid: Physarum</h1>
            </div>
            <button
  onClick={() => setShowGuide(true)}
  className="border px-2 py-1 rounded text-sm ml-2"
>
  📖 Guide
</button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="border px-2 py-1 rounded text-sm"
            >
              {darkMode ? "☀️ Mode Clair" : "🌙 Mode Sombre"}
            </button>
          </div>

          <div className= {` p-4 rounded shadow text-sm mt-2${darkMode ? "bg-[#111827] text-white" : "bg-white text-black"}`}>
            <h2 className="text-xl font-semibold mb-2">Joueurs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {players.map(p => (
                <div key={p.id} className={`${getColorText(p.id)} font-semibold`}>
                  {p.name || p.id} : {countOwnedCells(p.id)} territoires
                </div>
              ))}
            </div>
          </div>

          <div className={`bg-black/50 p-4 rounded text-sm font-mono mb-4 ${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>
            <p className="mb-1 text-green-400 font-bold">🎮 {currentPlayer.name}</p>
            <p>⚡ Énergie : <span className={`${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>{energy}</span> 
             🧬 Biomasse : <span className={`${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>{biomass}</span>
             ⏳ Tour : <span className={`${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>{turn}</span></p>
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
              ✋ Clic simple pour interagir, double clic sur votre territoire pour construire une base.
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

        <div className={`w-full flex flex-col p-4 rounded max-h-[calc(100vh-100px)] overflow-hidden ${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>
  <div className="sticky top-0 z-10 pb-2">
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
      <p className={`text-gray-500 italic${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>Aucun événement pour l’instant.</p>
    ) : (
      filteredLog.slice().reverse().map((entry, i) => (
        <div key={i} className={`text-gray-500 italic${darkMode ? "bg-[#0a0f1c] text-white" : "bg-white text-black"}`}>{entry}</div>
      ))
    )}
    <div ref={logEndRef} />
  </div>
</div>
      </div>
      {showGuide && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-white text-black dark:bg-gray-900 dark:text-white max-w-3xl w-full p-8 rounded shadow-xl overflow-y-auto max-h-[90vh] relative">
      <button
        onClick={() => setShowGuide(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
      >
        ✖
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center">🎮 Guide de jeu — <em>Battle Grid: Physarum</em></h2>
      
      <div className="text-sm space-y-6 leading-relaxed">
        
        <section>
          <h3 className="text-xl font-semibold mb-2">🧠 Objectif du jeu</h3>
          <p>Dominer la grille en propageant ton organisme, en absorbant de la biomasse et en éliminant les bots ennemis. Tu gagnes si <strong>tous les bots sont éliminés</strong> ou si tu es le <strong>dernier joueur en vie</strong>.</p>
        </section>

        <hr className="border-gray-600" />

        <section>
          <h3 className="text-xl font-semibold mb-2">🕹️ Contrôles et actions</h3>
          <p><strong>✅ Clic gauche sur une case :</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Si elle est adjacente : propagation simple ou attaque aléatoire.</li>
            <li>Si elle n’est pas adjacente : l’action échoue.</li>
          </ul>
          <p className="mt-2 italic text-yellow-400">Chaque propagation coûte 1 ⚡ énergie (ou 3⚡ pour un assaut).</p>

          <p className="mt-4"><strong>🟢 Double clic sur une case à toi :</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Construit une base.</li>
            <li>Coût : 2 ⚡ énergie.</li>
            <li>Effet : +1⚡ par base à chaque tour.</li>
          </ul>

          <p className="mt-4"><strong>❌ Destruction de base :</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Clique sur ta case avec une base.</li>
            <li>Utilise le bouton 💥 Détruire la base.</li>
            <li>Tu regagnes 2 ⚡ énergie.</li>
          </ul>
        </section>

        <hr className="border-gray-600" />

        <section>
          <h3 className="text-xl font-semibold mb-2">🔄 Fin de tour</h3>
          <p>Clique sur <strong>"Fin de tour"</strong> pour :</p>
          <ul className="list-disc list-inside ml-4">
            <li>Terminer ton tour.</li>
            <li>Gagner de l’énergie et de la biomasse selon tes territoires.</li>
            <li>Laisser le bot suivant jouer automatiquement.</li>
          </ul>
        </section>

        <hr className="border-gray-600" />

        <section>
          <h3 className="text-xl font-semibold mb-2">🧾 Ressources</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-500">
                <th className="py-2 px-4 text-left">Ressource</th>
                <th className="py-2 px-4 text-left">Gagnée comment ?</th>
                <th className="py-2 px-4 text-left">Utilisée pour...</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-4">⚡ Énergie</td>
                <td className="py-2 px-4">Par territoires + bases</td>
                <td className="py-2 px-4">Propager, construire</td>
              </tr>
              <tr>
                <td className="py-2 px-4">🧬 Biomasse</td>
                <td className="py-2 px-4">Par territoires</td>
                <td className="py-2 px-4">Mesure ton expansion (score)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <hr className="border-gray-600" />

        <section>
          <h3 className="text-xl font-semibold mb-2">🧠 Astuces</h3>
          <ul className="list-disc list-inside ml-4">
            <li>Construis des bases dans des zones protégées pour maximiser ton gain d’énergie.</li>
            <li>Attaque les bots faibles en priorité pour prendre l’avantage.</li>
            <li><strong>Attention :</strong> tu ne peux effectuer que 2 actions par tour!</li>
            <li>Une propagation peut échouer, prévois toujours un peu d’énergie en réserve.</li>
          </ul>
        </section>

        <hr className="border-gray-600" />

        <section>
          <h3 className="text-xl font-semibold mb-2">💀 Conditions de défaite</h3>
          <ul className="list-disc list-inside ml-4">
            <li>Tu perds si tu n’as plus aucun territoire.</li>
            <li>Tu gagnes si tous les bots sont éliminés.</li>
          </ul>
        </section>

      </div>
    </div>
  </div>
)}


    </div>
  )
}

export default App