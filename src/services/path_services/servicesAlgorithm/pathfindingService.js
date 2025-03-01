import { initializeGrid, heuristic, getNeighbors } from '../algorithm/astarBase.js';

// Function to find the optimal path using the A* algorithm
const findPath = (start, end, mapData) => {
  const { width, height } = mapData;
  const grid = initializeGrid(mapData);

  const openList = [];
  const closedList = [];
  
  // Initial node
  const startNode = { position: start, parent: null, g: 0, h: 0, f: 0 };
  const endNode = { position: end, parent: null, g: 0, h: 0, f: 0 };

  openList.push(startNode);

  while (openList.length > 0) {
    // Get the node with the lowest f value
    const currentNode = openList.reduce((prev, curr) =>
      prev.f < curr.f ? prev : curr
    );

    // Move the current node from the open list to the closed list
    openList.splice(openList.indexOf(currentNode), 1);
    closedList.push(currentNode);

    // If we reach the end node, reconstruct the path
    if (currentNode.position.x === endNode.position.x && currentNode.position.y === endNode.position.y) {
      const path = [];
      let current = currentNode;
      while (current) {
        path.push(current.position);
        current = current.parent;
      }
      return path.reverse();
    }

    // Get the neighbors of the current node
    const neighbors = getNeighbors(currentNode, grid, width, height);

    neighbors.forEach(neighbor => {
      if (closedList.find(closedNode => closedNode.position.x === neighbor.x && closedNode.position.y === neighbor.y)) {
        return;
      }

      const g = currentNode.g + 1;
      const h = heuristic(neighbor, endNode.position);
      const f = g + h;

      const existingNode = openList.find(openNode => openNode.position.x === neighbor.x && openNode.position.y === neighbor.y);
      if (existingNode && g > existingNode.g) {
        return;
      }

      openList.push({ position: neighbor, parent: currentNode, g, h, f });
    });
  }

  return []; // Return an empty list if no path is found
};

export { findPath };
