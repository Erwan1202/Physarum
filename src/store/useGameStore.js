import { create } from 'zustand'

const GRID_SIZE = 10

const createInitialMap = () => {
  const map = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      owner: null,
      biomass: 0,
    }))
  )

  // placement initial
  map[0][0] = { owner: 'player', biomass: 1 }
  map[GRID_SIZE - 1][GRID_SIZE - 1] = { owner: 'bot1', biomass: 1 }

  return map
}

export const useGameStore = create((set, get) => ({
  map: createInitialMap(),
  energy: 5,
  biomass: 1,
  turn: 1,

  players: [
    { id: 'player', type: 'human' },
    { id: 'bot1', type: 'bot' }
  ],
  currentPlayerIndex: 0,

  spreadTo: (x, y) => {
    const { map, energy, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id

    if (energy < 1) {
      console.log(`[${playerId}] ❌ Pas assez d'énergie pour se propager.`)
      return
    }

    // Vérifie si adjacent à une cellule du joueur
    const getAdjacentCells = (x, y) => {
      return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].filter(([i, j]) => i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE)
    }

    const isAdjacent = getAdjacentCells(x, y).some(([i, j]) => {
      return map[j][i]?.owner === playerId
    })

    if (!isAdjacent) {
      console.log(`[${playerId}] ❌ Impossible de se propager ici, pas adjacent.`)
      return
    }

    set((state) => {
      const newMap = [...state.map]
      newMap[y] = [...newMap[y]]
      const cell = { ...newMap[y][x] }

      // Libre
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

      // Adverse & faible
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
    console.log(`🔁 Fin du tour du joueur ${players[currentPlayerIndex].id}`)

    set({
      currentPlayerIndex: nextIndex,
      energy: 5,
      turn: get().turn + 1,
    })

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
    const { map } = get()
    const owned = []

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (map[y][x].owner === botId) {
          owned.push([x, y])
        }
      }
    }

    for (let [x, y] of owned) {
      const adjacent = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].filter(([i, j]) =>
        i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE &&
        map[j][i].owner !== botId
      )

      if (adjacent.length > 0) {
        const [tx, ty] = adjacent[Math.floor(Math.random() * adjacent.length)]
        console.log(`🤖 ${botId} tente de se propager en (${tx},${ty})`)
        get().spreadTo(tx, ty)
        break
      }
    }
  },

  resetGame: () =>
    set({
      map: createInitialMap(),
      energy: 5,
      biomass: 1,
      currentPlayerIndex: 0,
      turn: 1,
    }),
}))
