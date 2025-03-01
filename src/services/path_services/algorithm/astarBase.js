// Function to initialize the map grid
const initializeGrid = (mapData) => {
  const { width, height, obstacles } = mapData;

  const grid = Array.from({ length: height }, () =>
    Array(width).fill(0)
  );

  obstacles.forEach(obs => {
    grid[obs.y][obs.x] = 1;
  });

  return grid;
};

// Function to calculate the heuristic (Manhattan distance)
const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Find valid neighbor nodes
const getNeighbors = (node, grid, width, height) => {
  const { x, y } = node.position;
  const neighbors = [];

  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  directions.forEach(dir => {
    const newX = x + dir.x;
    const newY = y + dir.y;
    if (
      newX >= 0 && newX < width &&
      newY >= 0 && newY < height &&
      grid[newY][newX] !== 1
    ) {
      neighbors.push({ x: newX, y: newY });
    }
  });

  return neighbors;
};

// Function to calculate the total distance of the path
const calculateDistance = (path) => {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    distance += Math.sqrt(
      Math.pow(path[i + 1].x - path[i].x, 2) +
      Math.pow(path[i + 1].y - path[i].y, 2)
    );
  }
  return distance;
};

// Function to calculate the estimated duration of the path
const calculateDuration = (distance, speed = 1) => {
  return distance / speed; // Assuming constant speed
};

export { initializeGrid, heuristic, getNeighbors, calculateDistance, calculateDuration };
