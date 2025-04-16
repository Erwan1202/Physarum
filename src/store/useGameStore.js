import { create } from 'zustand'

const GRID_SIZE = 10

const terrainTypes = ['normal', 'forest', 'swamp']

const defaultPlayers = [
  { id: 'player', type: 'human', color: 'green', name: 'Joueur', powers: { reveal: true }, cooldowns: { reveal: 0 } },
  { id: 'bot1', type: 'bot', strategy: 'adaptive', color: 'red', name: 'Bot 1', powers: { boost: true }, cooldowns: { boost: 0 } },
  { id: 'bot2', type: 'bot', strategy: 'adaptive', color: 'purple', name: 'Bot 2', powers: { scout: true }, cooldowns: { scout: 0 } },
  { id: 'bot3', type: 'bot', strategy: 'adaptive', color: 'blue', name: 'Bot 3', powers: {}, cooldowns: {} },
]

const createInitialMap = (players) => {
  const map = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      owner: null,
      biomass: 0,
      terrain: terrainTypes[Math.floor(Math.random() * terrainTypes.length)],
      visibleTo: [],
    }))
  )

  const used = new Set()
  const getRandomEmptyCoord = () => {
    let x, y
    do {
      x = Math.floor(Math.random() * GRID_SIZE)
      y = Math.floor(Math.random() * GRID_SIZE)
    } while (used.has(`${x},${y}`))
    used.add(`${x},${y}`)
    return [x, y]
  }

  for (const player of players) {
    const [x, y] = getRandomEmptyCoord()
    map[y][x].owner = player.id
    map[y][x].biomass = 1
    console.log(`🎲 ${player.name} spawn en (${x},${y})`)
  }

  return map
}

export const useGameStore = create((set, get) => ({
  map: createInitialMap(defaultPlayers),
  players: defaultPlayers,
  energy: 5,
  biomass: 1,
  turn: 1,
  currentPlayerIndex: 0,
  winner: null,
  gameOver: false,
  Victory: false,
  lastConqueredCell: null,
  log: [],
  logFilter: 'all',
  actionsLeft: 2,

  setLogFilter: (filter) => set({ logFilter: filter }),

  setCustomPlayers: ({ playerName = 'Joueur', botCount = 3 }) => {
    const bots = [
      { id: 'bot1', type: 'bot', strategy: 'adaptive', color: 'red', name: 'Bot 1', powers: { boost: true }, cooldowns: { boost: 0 } },
      { id: 'bot2', type: 'bot', strategy: 'adaptive', color: 'purple', name: 'Bot 2', powers: { scout: true }, cooldowns: { scout: 0 } },
      { id: 'bot3', type: 'bot', strategy: 'adaptive', color: 'blue', name: 'Bot 3', powers: {}, cooldowns: {} },
    ].slice(0, botCount)

    const players = [
      { id: 'player', type: 'human', color: 'green', name: playerName, powers: { reveal: true }, cooldowns: { reveal: 0 } },
      ...bots,
    ]

    set({
      players,
      map: createInitialMap(players),
      energy: 5,
      biomass: 1,
      turn: 1,
      currentPlayerIndex: 0,
      winner: null,
      gameOver: false,
      Victory: false,
      lastConqueredCell: null,
      log: [],
      actionsLeft: 2,
    })
  },

  buildBaseAt: (x, y) => {
    const { map, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id
    const cell = map[y][x]
    const state = get()

    if (cell.owner !== playerId) return
    if (cell.hasBase) return
    if (state.energy < 2) {
        return {
          log: [...state.log, `[${playerId}] ❌ Pas assez d'énergie pour construire une base.`]
        }
      }
      

    const newMap = [...map]
    newMap[y] = [...newMap[y]]
    newMap[y][x] = { ...cell, hasBase: true }

    set((state) => ({
      map: newMap,
      log: [...state.log, `[${playerId}] 🏗️ A construit une base en (${x},${y})`],
      energy: state.energy - 2,
    }))
  },

  baseBonus: () => {
    const { map, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id
    let baseCount = 0
    for (let row of map) {
      for (let cell of row) {
        if (cell.owner === playerId && cell.hasBase) baseCount++
      }
    }
    set((state) => ({
      energy: state.energy + baseCount,
      log: [...state.log, `[${playerId}] 🏕️ ${baseCount} base(s) fournissent +${baseCount}⚡`]
    }))
  },

  destroyBaseAt: (x, y) => {
    const { map, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id
    const cell = map[y][x]

    if (!cell.hasBase) return
    if (cell.owner !== playerId) return

    const newMap = [...map]
    newMap[y] = [...newMap[y]]
    newMap[y][x] = { ...cell, hasBase: false }

    set((state) => ({
      map: newMap,
      log: [...state.log, `[${playerId}] 💥 A détruit sa base en (${x},${y})`]
    }))
  },


  triggerGameOver: (winnerId) => {
    set({ gameOver: true, winner: winnerId })
    const msg = `🏁 ${winnerId} remporte la partie !`
    console.log(msg)
    set((state) => ({ log: [...state.log, msg] }))
  },  

  spreadTo: (x, y, mode = 'standard') => {
    const { map, energy, players, currentPlayerIndex, actionsLeft } = get()
    const playerId = players[currentPlayerIndex].id
    const addLog = (message) => set({ log: [...get().log, message] })

    if (actionsLeft <= 0) {
      addLog(`[${playerId}] ❌ Plus d'actions restantes ce tour.`)
      return
    }

    if (mode === 'infiltration') {
      addLog(`[${playerId}] 👀 Infiltration en (${x},${y})`)
      map[y][x].visibleTo.push(playerId)
      set({ map, actionsLeft: actionsLeft - 1 })
      return
    }

    if (mode === 'assault' && energy < 3) {
      addLog(`[${playerId}] ❌ Pas assez d'énergie pour un assaut.`)
      return
    }

    if (energy < 1) {
      addLog(`[${playerId}] ❌ Pas assez d'énergie pour se propager.`)
      return
    }

    const getAdjacentCells = (x, y) => [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    ].filter(([i, j]) => i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE)

    const isAdjacent = getAdjacentCells(x, y).some(([i, j]) => map[j][i]?.owner === playerId)

    if (!isAdjacent) {
      addLog(`[${playerId}] ❌ Pas adjacent à un territoire.`)
      return
    }

    set((state) => {
      const newMap = [...state.map.map(row => [...row])]
      const cell = { ...newMap[y][x] }
      let cost = mode === 'assault' ? 3 : 1
      let success = Math.random() < (mode === 'assault' ? 0.75 : 0.5)

      if (!cell.owner) {
        cell.owner = playerId
        cell.biomass = 1
        newMap[y][x] = cell
        addLog(`[${playerId}] ✅ S'est propagé en (${x},${y}) [libre]`)
        return {
          map: newMap,
          energy: state.energy - cost,
          biomass: state.biomass + 1,
          lastConqueredCell: { x, y },
          actionsLeft: state.actionsLeft - 1,
        }
      } else if (cell.owner !== playerId) {
        if (state.energy < cost) {
          addLog(`[${playerId}] ❌ Pas assez d'énergie pour conquérir.`)
          return {}
        }
        if (success) {
          cell.owner = playerId
          cell.biomass = 1
          newMap[y][x] = cell
          addLog(`[${playerId}] ⚔️ A conquis (${x},${y}) [${mode}, succès]`)
          return {
            map: newMap,
            energy: state.energy - cost,
            biomass: state.biomass + 2,
            lastConqueredCell: { x, y },
            actionsLeft: state.actionsLeft - 1,
          }
        } else {
          addLog(`[${playerId}] ❌ A échoué à conquérir (${x},${y}) [${mode}]`)
        }
      }
      return {}
    })
  },

  endTurn: () => {
    get().baseBonus()
  
    const { map, players, currentPlayerIndex } = get()
    const currentPlayerId = players[currentPlayerIndex].id
  
    // 🔁 On re-récupère la map après baseBonus
    const freshMap = get().map
  
    const ownedCells = freshMap.flat().filter(cell => cell.owner === currentPlayerId).length
    const baseCount = freshMap.flat().filter(cell => cell.owner === currentPlayerId && cell.hasBase).length

    const nextIndex = (currentPlayerIndex + 1) % players.length
  
    const energyGain = Math.floor(ownedCells / 5) + baseCount
    const biomassGain = Math.floor(ownedCells / 10)
  
    const gainMsg = `💰 ${currentPlayerId} gagne ${energyGain}⚡ et ${biomassGain}🧬 grâce à ses ${ownedCells} territoires.`
  
    set((s) => ({
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      energy: 5 + energyGain,
      biomass: s.biomass + biomassGain,
      turn: s.turn + 1,
      log: [...s.log, gainMsg],
      actionsLeft: 2,
    }))
  
    const nextPlayer = players[nextIndex]
    if (nextPlayer.type === 'bot') {
      setTimeout(() => {
        get().playBotTurn(nextPlayer.id)
        get().endTurn()
      }, 600)
    }
  
    // Vérifie la fin de partie
    const playerTerritories = {}
    for (let row of map) {
      for (let cell of row) {
        if (cell.owner) {
          playerTerritories[cell.owner] = (playerTerritories[cell.owner] || 0) + 1
        }
      }
    }
  
    const alivePlayers = Object.keys(playerTerritories)
  
    if (alivePlayers.length === 1) {
      const winnerId = alivePlayers[0]
      console.log(`🏆 ${winnerId} a gagné la partie !`)
      set({ winner: winnerId, gameOver: true })
    }
  
    if (!alivePlayers.includes('player')) {
      console.log(`💀 Le joueur a été éliminé !`)
      get().triggerGameOver('bots')
    }
  },
    
  

  playBotTurn: (botId) => {
    const { map, players, buildBaseAt } = get()
    const GRID_SIZE = map.length
    const owned = []
  
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (map[y][x].owner === botId) owned.push([x, y])
      }
    }
  
    // Tentative de construction d'une base
    const energy = get().energy
    if (energy >= 2) {
      for (let [x, y] of owned) {
        const cell = map[y][x]
        if (!cell.hasBase && Math.random() < 0.25) {
          buildBaseAt(x, y)
          get().log.push(`🤖 ${botId} 🏗️ a construit une base en (${x},${y})`)
          return
        }
      }
    }
  
    // Attaque ou expansion
    const getAdjacentCells = ([x, y]) => [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    ].filter(([i, j]) => i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE)
  
    const countTerritories = (ownerId) =>
      map.flat().filter(cell => cell.owner === ownerId).length
  
    const weakestEnemy = players
      .filter(p => p.id !== botId)
      .sort((a, b) => countTerritories(a.id) - countTerritories(b.id))[0]?.id
  
    let bestTarget = null
    let bestScore = -Infinity
  
    for (let [x, y] of owned) {
      const adjacent = getAdjacentCells([x, y])
      for (let [i, j] of adjacent) {
        const cell = map[j][i]
        let score = 0
        if (!cell.owner) score = 2
        else if (cell.owner !== botId && cell.owner === weakestEnemy) score = 6
        else if (cell.owner !== botId) score = 4
        if (score > bestScore) {
          bestScore = score
          bestTarget = [i, j]
        }
      }
    }
  
    if (bestTarget) {
      get().spreadTo(bestTarget[0], bestTarget[1], 'standard')
    } else {
      set((state) => ({
        log: [...state.log, `🤖 ${botId} ne trouve aucune cible valable`]
      }))
    }
  }
  ,
}))