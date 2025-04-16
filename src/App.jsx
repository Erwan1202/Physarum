import React, { useState } from "react";
import Grid from "./components/Grid";

const GRID_SIZE = 10;

const createInitialMap = () => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      owner: null,
      biomass: 0,
    }))
  );
};

function App() {
  const [map, setMap] = useState(createInitialMap());

  const handleCellClick = (x, y) => {
    setMap((prevMap) => {
      const newMap = [...prevMap];
      newMap[y] = [...prevMap[y]];
      const cell = { ...newMap[y][x] };
      // test: clic = colonisation par le joueur
      if (!cell.owner) {
        cell.owner = "player";
        cell.biomass = 1;
        newMap[y][x] = cell;
      }
      return newMap;
    });
  };

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Battle Grid: Physarum</h1>
      <Grid map={map} onCellClick={handleCellClick} />
    </div>
  );
}

export default App;
