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

export const useGameStore = create((set) => ({
  map: createInitialMap(),

  spreadTo: (x, y, owner = 'player') => {
    set((state) => {
      const newMap = [...state.map]
      newMap[y] = [...newMap[y]]
      const cell = { ...newMap[y][x] }

      if (!cell.owner) {
        cell.owner = owner
        cell.biomass = 1
        newMap[y][x] = cell
      }

      return { map: newMap }
    })
  },

  resetGame: () => set({ map: createInitialMap() }),
}))
