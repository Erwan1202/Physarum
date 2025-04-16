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

const getAdjacentCells = (x, y) => {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ].filter(([i, j]) => i >= 0 && j >= 0 && i < GRID_SIZE && j < GRID_SIZE)
}

const INITIAL_ENERGY = 5
const INITIAL_BIOMASS = 0

export const useGameStore = create((set, get) => ({
  map: createInitialMap(),
  energy: INITIAL_ENERGY,
  biomass: INITIAL_BIOMASS,

  spreadTo: (x, y) => {
    const { map, energy } = get()

    if (energy < 1) return

    const isAdjacentToPlayer = getAdjacentCells(x, y).some(([i, j]) => {
      return map[j][i]?.owner === 'player'
    })
    if (!isAdjacentToPlayer) return

    set((state) => {
      const newMap = [...state.map]
      newMap[y] = [...newMap[y]]
      const cell = { ...newMap[y][x] }

      if (!cell.owner) {
        cell.owner = 'player'
        cell.biomass = 1
        newMap[y][x] = cell
        return {
          map: newMap,
          energy: state.energy - 1,
          biomass: state.biomass + 1,
        }
      }

      if (cell.owner !== 'player' && cell.biomass < 1) {
        cell.owner = 'player'
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

  resetGame: () => set({
    map: createInitialMap(),
    energy: INITIAL_ENERGY,
    biomass: INITIAL_BIOMASS,
  }),
}))
