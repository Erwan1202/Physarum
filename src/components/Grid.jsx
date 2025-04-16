import React from "react"
import classNames from "classnames"

const Grid = ({ map, onCellClick }) => {
  const getCellClass = (owner) => {
    return classNames(
      "aspect-square w-full border rounded text-sm font-bold text-white transition",
      {
        "bg-green-500 hover:bg-green-600": owner === "player",
        "bg-red-500 hover:bg-red-600": owner === "bot1",
        "bg-purple-500 hover:bg-purple-600": owner === "bot2",
        "bg-blue-500 hover:bg-blue-600": owner === "bot3",
        "bg-gray-700 hover:bg-gray-600": !owner,
      }
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${map.length}, minmax(0, 1fr))`,
        }}
      >
        {map.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => onCellClick(x, y)}
              className={getCellClass(cell.owner)}
            >
              {cell.biomass > 0 ? cell.biomass : ""}
            </button>
          ))
        )}
      </div>

      {/* Légende */}
      <div className="flex gap-4 text-sm text-white mt-4 flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-500 rounded-sm inline-block" />
          Joueur
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-500 rounded-sm inline-block" />
          Bot 1
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-purple-500 rounded-sm inline-block" />
          Bot 2
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-500 rounded-sm inline-block" />
          Bot 3
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-700 border border-white rounded-sm inline-block" />
          Vide
        </span>
      </div>
    </div>
  )
}

export default Grid
