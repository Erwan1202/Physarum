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

  usePower: (powerName) => {
    const { players, currentPlayerIndex, map } = get()
    const currentPlayer = players[currentPlayerIndex]
    const playerId = currentPlayer.id
    const cooldowns = currentPlayer.cooldowns
    const addLog = (message) => set({ log: [...get().log, message] })

    if (!currentPlayer.powers[powerName]) {
      addLog(`[${playerId}] ❌ Pouvoir ${powerName} non disponible.`)
      return
    }
    if (cooldowns[powerName] > 0) {
      addLog(`[${playerId}] ❌ Pouvoir ${powerName} en recharge (${cooldowns[powerName]} tours restants).`)
      return
    }

    switch (powerName) {
      case 'reveal': {
        const visibleCells = []
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            if (map[y][x].owner && map[y][x].owner !== playerId) {
              map[y][x].visibleTo.push(playerId)
              visibleCells.push(`(${x},${y})`)
            }
          }
        }
        cooldowns.reveal = 3
        addLog(`[${playerId}] 🔍 Utilise "Révélation" et aperçoit les cellules : ${visibleCells.join(', ')}`)
        break
      }
      case 'boost': {
        set((state) => ({ energy: state.energy + 3 }))
        cooldowns.boost = 2
        addLog(`[${playerId}] ⚡ Utilise "Boost" et gagne +3 énergie !`)
        break
      }
      case 'scout': {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            if (!map[y][x].owner) map[y][x].visibleTo.push(playerId)
          }
        }
        cooldowns.scout = 4
        addLog(`[${playerId}] 👁️ Utilise "Scout" pour révéler les zones neutres.`)
        break
      }
      default:
        addLog(`[${playerId}] ❌ Pouvoir inconnu.`)
        return
    }
    set({ map, players })
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
    const state = get()
    const { currentPlayerIndex, players, map } = state
    const currentPlayerId = players[currentPlayerIndex].id
  
    // Vérifie combien de territoires possède le joueur actuel
    const ownedCells = map.flat().filter(cell => cell.owner === currentPlayerId).length
  
    // Si le joueur n’a plus de territoire
    if (ownedCells === 0) {
      const msg = `💀 ${currentPlayerId} a été éliminé !`
      console.log(msg)
      set((s) => ({ log: [...s.log, msg] }))
    }
  
    const nextIndex = (currentPlayerIndex + 1) % players.length
  
    // Calcul des gains d’énergie/biomasse
    const energyGain = Math.floor(ownedCells / 5)
    const biomassGain = Math.floor(ownedCells / 10)
  
    const gainMsg = `💰 ${currentPlayerId} gagne ${energyGain}⚡ et ${biomassGain}🧬 grâce à ses ${ownedCells} territoires.`
    console.log(gainMsg)
  
    set((s) => ({
      currentPlayerIndex: nextIndex,
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
      return
    }
  
    if (!alivePlayers.includes('player')) {
        console.log(`💀 Le joueur a été éliminé !`)
        get().triggerGameOver('bots')
      }      
  },
  

  playBotTurn: (botId) => {
    const { map, players } = get()
    const GRID_SIZE = map.length
    const owned = []

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (map[y][x].owner === botId) owned.push([x, y])
      }
    }

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
        else if (cell.owner !== botId && cell.owner === weakestEnemy) score = 4
        else if (cell.owner !== botId) score = 3
        if (score > bestScore) {
          bestScore = score
          bestTarget = [i, j]
        }
      }
    }

    if (bestTarget) {
      get().spreadTo(bestTarget[0], bestTarget[1], 'standard')
    } else {
      set((state) => ({ log: [...state.log, `🤖 ${botId} ne trouve aucune cible valable`] }))
    }
  },
}))