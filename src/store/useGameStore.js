import { create } from 'zustand'

const GRID_SIZE = 10

const players = [
  { id: 'player', type: 'human' },
  { id: 'bot1', type: 'bot', strategy: 'random' },
  { id: 'bot2', type: 'bot', strategy: 'aggressive' },
  { id: 'bot3', type: 'bot', strategy: 'defensive' },
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

  spreadTo: (x, y) => {
    const { map, energy, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id

    if (energy < 1) {
      console.log(`[${playerId}] ❌ Pas assez d'énergie pour se propager.`)
      return
    }

    const getAdjacentCells = (x, y) => [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    ].filter(([i, j]) => i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE)

    const isAdjacent = getAdjacentCells(x, y).some(([i, j]) => map[j][i]?.owner === playerId)

    if (!isAdjacent) {
      console.log(`[${playerId}] ❌ Impossible de se propager ici, pas adjacent.`)
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
        console.log(`[${playerId}] ✅ S'est propagé en (${x},${y}) [libre]`)
        return {
          map: newMap,
          energy: state.energy - 1,
          biomass: state.biomass + 1,
        }
      }

      if (cell.owner !== playerId && cell.biomass < 1) {
        cell.owner = playerId
        cell.biomass = 1
        newMap[y][x] = cell
        console.log(`[${playerId}] ⚔️ A conquis la case (${x},${y}) !`)
        return {
          map: newMap,
          energy: state.energy - 2,
          biomass: state.biomass + 2,
        }
      }

      console.log(`[${playerId}] ❌ Impossible de conquérir la case (${x},${y})`)
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

    console.log(`💰 ${currentPlayerId} gagne ${energyGain}⚡ et ${biomassGain}🧬 grâce à ses ${ownedCells} territoires.`)

    set((state) => ({
      currentPlayerIndex: nextIndex,
      energy: 5 + energyGain,
      biomass: state.biomass + biomassGain,
      turn: state.turn + 1,
    }))

    const nextPlayer = players[nextIndex]
    if (nextPlayer.type === 'bot') {
      setTimeout(() => {
        console.log(`🤖 Le bot ${nextPlayer.id} joue...`)
        get().playBotTurn(nextPlayer.id)
        get().endTurn()
      }, 600)
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
      console.log(`🤖 ${botId} (${strategy}) tente de se propager en (${tx},${ty})`)
      get().spreadTo(tx, ty)
    } else {
      console.log(`🤖 ${botId} (${strategy}) ne trouve aucune case utile.`)
    }
  },

  resetGame: () => set({
    map: createInitialMap(players),
    players,
    energy: 5,
    biomass: 1,
    currentPlayerIndex: 0,
    turn: 1,
  })
}))