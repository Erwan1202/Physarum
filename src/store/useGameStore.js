import { create } from 'zustand'

const GRID_SIZE = 10

const players = [
  { id: 'player', type: 'human', color: 'green' },
  { id: 'bot1', type: 'bot', strategy: 'random', color: 'red' },
  { id: 'bot2', type: 'bot', strategy: 'aggressive', color: 'purple' },
  { id: 'bot3', type: 'bot', strategy: 'defensive', color: 'blue' },
]

const createInitialMap = (players) => {
  const map = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      owner: null,
      biomass: 0,
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
    map[y][x] = { owner: player.id, biomass: 1 }
    console.log(`🎲 ${player.id} spawn en (${x},${y})`)
  }

  return map
}

export const useGameStore = create((set, get) => ({
  map: createInitialMap(players),
  players,
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

  setLogFilter: (filter) => set({ logFilter: filter }),

  spreadTo: (x, y) => {
    const { map, energy, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id

    const addLog = (message) => set({ log: [...get().log, message] })

    if (energy < 1) {
      const msg = `[${playerId}] ❌ Pas assez d'énergie pour se propager.`
      console.log(msg)
      addLog(msg)
      return
    }

    const getAdjacentCells = (x, y) => [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    ].filter(([i, j]) => i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE)

    const isAdjacent = getAdjacentCells(x, y).some(([i, j]) => map[j][i]?.owner === playerId)

    if (!isAdjacent) {
      const msg = `[${playerId}] ❌ Impossible de se propager ici, pas adjacent.`
      console.log(msg)
      addLog(msg)
      return
    }

    set((state) => {
      const newMap = [...state.map]
      newMap[y] = [...newMap[y]]
      const cell = { ...newMap[y][x] }

      if (!cell.owner) {
        cell.owner = playerId
        cell.biomass = 1
        newMap[y][x] = cell
        const msg = `[${playerId}] ✅ S'est propagé en (${x},${y}) [libre]`
        console.log(msg)
        addLog(msg)
        setTimeout(() => set({ lastConqueredCell: null }), 500)
        return {
          map: newMap,
          energy: state.energy - 1,
          biomass: state.biomass + 1,
          lastConqueredCell: { x, y },
        }
      }

      if (cell.owner !== playerId) {
        const conquestChance = Math.random()
        if (energy < 2) {
          const msg = `[${playerId}] ❌ Pas assez d'énergie pour conquérir.`
          console.log(msg)
          addLog(msg)
          return {}
        }
        if (conquestChance > 0.5) {
          cell.owner = playerId
          cell.biomass = 1
          newMap[y][x] = cell
          const msg = `[${playerId}] ⚔️ A conquis la case (${x},${y}) ! [chance: ${conquestChance.toFixed(2)}]`
          console.log(msg)
          addLog(msg)
          setTimeout(() => set({ lastConqueredCell: null }), 500)
          return {
            map: newMap,
            energy: state.energy - 2,
            biomass: state.biomass + 2,
            lastConqueredCell: { x, y },
          }
        } else {
          const msg = `[${playerId}] ❌ A échoué à conquérir (${x},${y}) [chance: ${conquestChance.toFixed(2)}]`
          console.log(msg)
          addLog(msg)
        }
      }

      return {}
    })
  },

  endTurn: () => {
    const { currentPlayerIndex, players } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length
    const currentPlayerId = players[currentPlayerIndex].id

    const map = get().map
    let ownedCells = 0
    for (let row of map) {
      for (let cell of row) {
        if (cell.owner === currentPlayerId) ownedCells++
      }
    }

    const energyGain = Math.floor(ownedCells / 5)
    const biomassGain = Math.floor(ownedCells / 10)

    const msg = `💰 ${currentPlayerId} gagne ${energyGain}⚡ et ${biomassGain}🧬 grâce à ses ${ownedCells} territoires.`
    console.log(msg)
    set((state) => ({
      currentPlayerIndex: nextIndex,
      energy: 5 + energyGain,
      biomass: state.biomass + biomassGain,
      turn: state.turn + 1,
      log: [...state.log, msg],
    }))

    const nextPlayer = players[nextIndex]
    if (nextPlayer.type === 'bot') {
      setTimeout(() => {
        console.log(`🤖 Le bot ${nextPlayer.id} joue...`)
        get().playBotTurn(nextPlayer.id)
        get().endTurn()
      }, 600)
    }

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
      set({ gameOver: true })
    }
    if (!alivePlayers.includes('bot1') && !alivePlayers.includes('bot2') && !alivePlayers.includes('bot3')) {
      console.log(`💀 Tous les bots ont été éliminés !`)
      set({ Victory: true, winner: 'player', gameOver: true })
    }
  },

  playBotTurn: (botId) => {
    const { map, players } = get()
    const bot = players.find(p => p.id === botId)
    const strategy = bot.strategy || 'random'
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

    let target = null

    if (strategy === 'random') {
      for (let [x, y] of owned) {
        const adjacent = getAdjacentCells([x, y]).filter(([i, j]) => map[j][i].owner !== botId)
        if (adjacent.length > 0) {
          target = adjacent[Math.floor(Math.random() * adjacent.length)]
          break
        }
      }
    }

    if (strategy === 'aggressive') {
      for (let [x, y] of owned) {
        const adjacent = getAdjacentCells([x, y])
        const enemies = adjacent.filter(([i, j]) => {
          const cell = map[j][i]
          return cell.owner && cell.owner !== botId
        })
        if (enemies.length > 0) {
          target = enemies[0]
          break
        }
      }
    }

    if (strategy === 'defensive') {
      for (let [x, y] of owned) {
        const adjacent = getAdjacentCells([x, y])
        const neutrals = adjacent.filter(([i, j]) => !map[j][i].owner)
        if (neutrals.length > 0) {
          target = neutrals[0]
          break
        }
      }
    }

    if (target) {
      const [tx, ty] = target
      const msg = `🤖 ${botId} (${strategy}) tente de se propager en (${tx},${ty})`
      console.log(msg)
      set((state) => ({ log: [...state.log, msg] }))
      get().spreadTo(tx, ty)
    } else {
      const msg = `🤖 ${botId} (${strategy}) ne trouve aucune case utile.`
      console.log(msg)
      set((state) => ({ log: [...state.log, msg] }))
    }
  },

  resetGame: () => set({
    map: createInitialMap(players),
    players,
    energy: 5,
    biomass: 1,
    currentPlayerIndex: 0,
    turn: 1,
    winner: null,
    gameOver: false,
    Victory: false,
    lastConqueredCell: null,
    log: [],
    logFilter: 'all'
  })
}))