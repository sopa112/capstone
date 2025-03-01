import map from "../models/mapModel.js";
import Obstacle from "../models/obstacleModel.js";
import GameRoute from "../models/gameRouteModel.js";
import WaitPoint from "../models/waitPointModel.js";


// Validate that a map exists
const validateMapExists = async (mapId) => {
  console.log(`Validating existence of map with ID: ${mapId}`);
  const existingMap = await map.findById(mapId);
  if (!existingMap) {
    console.error(`Map with ID ${mapId} not found.`);
    throw createError("The map does not exist.", 404);
  }
  console.log(`Map found: ${existingMap}`);
  return existingMap;
};


// Validate that coordinates are within the map's dimensions
const validateDimensions = (dimensions, coordinates) => {
  const { width, height } = dimensions;
  return coordinates.every(({ x, y }) =>
    x >= 0 && x <= width && y >= 0 && y <= height
  );
};

// Validate that coordinates are not occupied by obstacles, game routes, or wait points
const validatePositionNotOccupied = async (coordinates, mapId) => {
  const [obstacles, gameRoutes, waitPoints] = await Promise.all([
    Obstacle.find({ mapId }),
    GameRoute.find({ mapId }),
    WaitPoint.find({ mapId }),
  ]);

  const isOccupied = coordinates.some(({ x, y }) => {
    // Check obstacles
    const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
    if (isObstacle) {
      throw createError(`The position (${x}, ${y}) is occupied by an obstacle.`, 400);
    }

    // Check game routes
    const isGameRoute = gameRoutes.some(route =>
      (route.start.x === x && route.start.y === y) ||
      (route.end.x === x && route.end.y === y)
    );
    if (isGameRoute) {
      throw createError(`The position (${x}, ${y}) is occupied by a game route.`, 400);
    }

    // Check wait points
    const isWaitPoint = waitPoints.some(waitPoint =>
      waitPoint.position.x === x && waitPoint.position.y === y
    );
    if (isWaitPoint) {
      throw createError(`The position (${x}, ${y}) is occupied by a wait point.`, 400);
    }

    return false;
  });

  return !isOccupied;
};

// Validate that an obstacle belongs to a map
const validateObstacleBelongsToMap = async (obstacleId, mapId) => {
  const obstacle = await Obstacle.findById(obstacleId);
  if (!obstacle || obstacle.mapId.toString() !== mapId.toString()) {
    throw createError("The obstacle does not belong to this map.", 400);
  }
  return true;
};

// Validate that a point is not occupied by obstacles or game routes
const validatePointExists = async (point, mapId) => {
  const { x, y } = point;
  const [obstacles, gameRoutes] = await Promise.all([
    Obstacle.find({ mapId }),
    GameRoute.find({ mapId }),
  ]);

  // Check obstacles
  const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
  if (isObstacle) {
    throw createError(`The point (${x}, ${y}) is occupied by an obstacle.`, 400);
  }

  // Check game routes
  const isGameRoute = gameRoutes.some(route =>
    (route.start.x === x && route.start.y === y) ||
    (route.end.x === x && route.end.y === y)
  );
  if (isGameRoute) {
    throw createError(`The point (${x}, ${y}) is occupied by a game route.`, 400);
  }

  return true;
};

// Validate that a wait point exists
const validateWaitPointExists = async (id) => {
  const waitPoint = await WaitPoint.findById(id);
  if (!waitPoint) {
    throw createError("The wait point does not exist.", 404);
  }
  return waitPoint;
};

export {
  validateMapExists,
  validateDimensions,
  validatePositionNotOccupied,
  validateObstacleBelongsToMap,
  validatePointExists,
  validateWaitPointExists,
};
