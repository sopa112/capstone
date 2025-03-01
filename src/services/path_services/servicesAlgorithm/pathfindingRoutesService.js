import { findPath } from './pathfindingService';

// Function to validate a path provided by the user
const validatePath = (optimalPath, mapData) => {
  const { obstacles, wait_points } = mapData;

  // Check that the path avoids obstacles
  const avoidsObstacles = optimalPath.every(point =>
    !obstacles.some(obstacle => obstacle.x === point.x && obstacle.y === point.y)
  );

  if (!avoidsObstacles) {
    throw new Error("The path did not avoid all obstacles.");
  }

  // Check that the path passes through wait points
  const passesWaitPoints = wait_points.every(waitPoint =>
    optimalPath.some(point => point.x === waitPoint.x && point.y === waitPoint.y)
  );

  if (!passesWaitPoints) {
    throw new Error("The path did not pass through all wait points.");
  }

  // Check that the path is valid in terms of connectivity and continuity using A*
  const isConnected = optimalPath.slice(0, -1).every((start, index) => {
    const end = optimalPath[index + 1];
    const pathSegment = findPath(start, end, mapData);
    return pathSegment.length > 0;
  });

  if (!isConnected) {
    throw new Error("The path is not valid in terms of connectivity and continuity.");
  }

  return true;
};

export { validatePath };
