import React from "react"
import { useGameStore } from "../store/useGameStore"
import "../index.css" 

const Grid = ({ map, onCellClick }) => {
  const { lastConqueredCell } = useGameStore()

  const getColorClass = (owner) => {
    switch (owner) {
      case "player":
        return "bg-green-600 text-white"
      case "bot1":
        return "bg-red-600 text-white"
      case "bot2":
        return "bg-fuchsia-600 text-white"
      case "bot3":
        return "bg-blue-600 text-white"
      default:
        return "bg-gray-800 text-transparent"
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${map.length}, minmax(1.5rem, 1fr))` }}
      >
        {map.map((row, y) =>
          row.map((cell, x) => {
            const isAnimated =
              lastConqueredCell?.x === x && lastConqueredCell?.y === y

            const content = cell.hasBase ? "🏠" : cell.biomass > 0 ? cell.biomass : ""

            return (
              <button
                key={`${x}-${y}`}
                onClick={() => onCellClick(x, y)}
                className={`cell w-8 h-8 border border-white/20 rounded text-xs font-bold transition duration-150 
                  ${getColorClass(cell.owner)} ${isAnimated ? "conquered" : ""} 
                  scale-105 shadow-inner ${cell.hasBase ? "ring-2 ring-yellow-300" : ""}`}
              >
                {content}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Grid