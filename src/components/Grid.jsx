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
        return "bg-gray-800 text-white"
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid gap-1"
        style={{gridTemplateColumns: `repeat(${map.length}, minmax(1.5rem, 1fr))` }}
      >
        {map.map((row, y) =>
          row.map((cell, x) => {
            const isAnimated =
              lastConqueredCell?.x === x && lastConqueredCell?.y === y
            return (
                <button
                key={`${x}-${y}`}
                onClick={() => onCellClick(x, y)}
                className={`cell w-8 h-8 border border-white/20 rounded text-xs font-bold transition duration-150 
                  ${getColorClass(cell.owner)} ${isAnimated ? "conquered" : ""} 
                  scale-105 shadow-inner`}
              >
                {cell.biomass > 0 ? cell.biomass : ""}
              </button>
            )
          })
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-white mt-4">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-600 rounded-sm inline-block" />
          Joueur
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-600 rounded-sm inline-block" />
          Bot 1
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-fuchsia-600 rounded-sm inline-block" />
          Bot 2
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-600 rounded-sm inline-block" />
          Bot 3
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-800 border border-white rounded-sm inline-block" />
          Vide
        </span>
      </div>
    </div>
  )
}

export default Grid