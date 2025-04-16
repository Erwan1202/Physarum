import { create } from 'zustand'

const GRID_SIZE = 10

const createInitialMap = () => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      owner: null,
      biomass: 0,
    }))
  )
}

export const useGameStore = create((set, get) => ({
  map: createInitialMap(),
  energy: 5,
  biomass: 0,
  turn: 1,

  players: [
    { id: 'player', type: 'human' },
    { id: 'bot1', type: 'bot' }
  ],
  currentPlayerIndex: 0,

  spreadTo: (x, y) => {
    const { map, energy, players, currentPlayerIndex } = get()
    const playerId = players[currentPlayerIndex].id

    if (energy < 1) return

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

    if (!isAdjacent) return

    set((state) => {
      const newMap = [...state.map]
      newMap[y] = [...newMap[y]]
      const cell = { ...newMap[y][x] }

      if (!cell.owner) {
        cell.owner = playerId
        cell.biomass = 1
        newMap[y][x] = cell
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
        return {
          map: newMap,
          energy: state.energy - 2,
          biomass: state.biomass + 2,
        }
      }

      return {}
    })
  },

  endTurn: () => {
    const { currentPlayerIndex, players } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length
    set({
      currentPlayerIndex: nextIndex,
      energy: 5,
      turn: get().turn + 1,
    })

    // Si le bot joue
    const nextPlayer = players[nextIndex]
    if (nextPlayer.type === 'bot') {
      setTimeout(() => {
        get().playBotTurn(nextPlayer.id)
        get().endTurn()
      }, 500) // délai pour visualisation
    }
  },

  playBotTurn: (botId) => {
    const { map } = get()

    // stratégie simple : conquérir une case adjacente libre au hasard
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
        get().spreadTo(tx, ty)
        break
      }
    }
  },

  resetGame: () =>
    set({
      map: createInitialMap(),
      energy: 5,
      biomass: 0,
      currentPlayerIndex: 0,
      turn: 1,
    }),
}))
