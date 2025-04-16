import { create } from 'zustand'

const GRID_SIZE = 10

const terrainTypes = ['normal', 'forest', 'swamp']

const defaultPlayers = [
  { id: 'player', type: 'human', color: 'green', name: 'Joueur', powers: {}, cooldowns: {} },
  { id: 'bot1', type: 'bot', strategy: 'adaptive', color: 'red', name: 'Bot 1', powers: {}, cooldowns: {} },
  { id: 'bot2', type: 'bot', strategy: 'adaptive', color: 'purple', name: 'Bot 2', powers: {}, cooldowns: {} },
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
      { id: 'bot1', type: 'bot', strategy: 'adaptive', color: 'red', name: 'Bot 1', powers: {}, cooldowns: {} },
      { id: 'bot2', type: 'bot', strategy: 'adaptive', color: 'purple', name: 'Bot 2', powers: {}, cooldowns: {} },
      { id: 'bot3', type: 'bot', strategy: 'adaptive', color: 'blue', name: 'Bot 3', powers: {}, cooldowns: {} },
    ].slice(0, botCount)

    const players = [
      { id: 'player', type: 'human', color: 'green', name: playerName, powers: {}, cooldowns: {} },
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
    const { currentPlayerIndex, players, map } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length
    const currentPlayerId = players[currentPlayerIndex].id

    let ownedCells = 0
    let energyBonus = 0

    for (let row of map) {
      for (let cell of row) {
        if (cell.owner === currentPlayerId) {
          ownedCells++
          if (cell.terrain === 'forest') energyBonus++
          if (cell.terrain === 'swamp') energyBonus--
        }
      }
    }

    const energyGain = Math.max(Math.floor(ownedCells / 5) + energyBonus, 0)
    const biomassGain = Math.floor(ownedCells / 10)

    const msg = `💰 ${currentPlayerId} gagne ${energyGain}⚡ et ${biomassGain}🧬 (+ terrain)`
    console.log(msg)
    set((state) => ({
      currentPlayerIndex: nextIndex,
      energy: 5 + energyGain,
      biomass: state.biomass + biomassGain,
      turn: state.turn + 1,
      log: [...state.log, msg],
      actionsLeft: 2,
    }))

    const nextPlayer = players[nextIndex]
    if (nextPlayer.type === 'bot') {
      setTimeout(() => {
        for (let i = 0; i < 2; i++) {
          get().playBotTurn(nextPlayer.id)
        }
        get().endTurn()
      }, 600)
    }

    const playerTerritories = {}
    for (let row of map) {
      for (let cell of row) {
        if (cell.owner) playerTerritories[cell.owner] = (playerTerritories[cell.owner] || 0) + 1
      }
    }
    const alivePlayers = Object.keys(playerTerritories)
    if (alivePlayers.length === 1) set({ winner: alivePlayers[0], gameOver: true })
    if (!alivePlayers.includes('player')) set({ gameOver: true })
    if (!alivePlayers.some(p => p.startsWith('bot'))) set({ Victory: true, winner: 'player', gameOver: true })
  },

  playBotTurn: (botId) => {
    const { map, players } = get()
    const GRID_SIZE = map.length
    const bot = players.find(p => p.id === botId)
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