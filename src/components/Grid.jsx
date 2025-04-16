import React from "react"

const Grid = ({ map, onCellClick }) => {
  const getColorClass = (owner) => {
    if (owner === "player") return "bg-green-500 hover:bg-green-600 text-white"
    if (owner === "bot1") return "bg-red-500 hover:bg-red-600 text-white"
    if (owner === "bot2") return "bg-purple-500 hover:bg-purple-600 text-white"
    if (owner === "bot3") return "bg-blue-500 hover:bg-blue-600 text-white"
    return "bg-gray-700 hover:bg-gray-600 text-white"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${map.length}, 2rem)`,
        }}
      >
        {map.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => onCellClick(x, y)}
              className={`w-8 h-8 border rounded text-xs font-bold transition duration-150 ${getColorClass(cell.owner)}`}
            >
              {cell.biomass > 0 ? cell.biomass : ""}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-white mt-4">
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
