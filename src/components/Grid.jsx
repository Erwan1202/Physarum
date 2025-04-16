import React from "react";

const GRID_SIZE = 10;

const Grid = ({ map, onCellClick }) => {
  return (
    <div
      className="grid gap-1 p-4"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {map.map((row, y) =>
        row.map((cell, x) => (
          <button
            key={`${x}-${y}`}
            onClick={() => onCellClick(x, y)}
            className={`aspect-square w-full border rounded transition 
              ${cell.owner === 'player' ? 'bg-green-500' : 
                cell.owner === 'bot' ? 'bg-red-500' : 
                'bg-gray-700 hover:bg-gray-600'}`}
          >
            {cell.biomass > 0 ? cell.biomass : ''}
          </button>
        ))
      )}
    </div>
  );
};

export default Grid;
