import { createError } from "../utils/error.js";
import {
  validateDimensions,
  validatePositionNotOccupied,
} from "../utils/validation.js";
import { toResult, handleResult } from "../utils/resultUtils.js";

class GameRouteService {
  constructor(gameRouteRepository, mapRepository) {
    this.gameRouteRepository = gameRouteRepository;
    this.mapRepository = mapRepository;
  }

  // Validate that the game route exists
  async validateGameRouteExists(id) {
    const routeResult = await toResult(this.gameRouteRepository.findById(id));
    const route = handleResult(routeResult, null, 404);

    if (!route) {
      throw createError("Game route does not exist", 404);
    }

    return route;
  }

  // Validate start and end coordinates
  async validateStartEndPositions(mapId, start, end) {
    const mapResult = await toResult(this.mapRepository.findById(mapId));
    const existingMap = handleResult(mapResult, "Map does not exist", 404);

    if (!existingMap || !existingMap.dimensions) {
      throw createError("Map does not exist or is invalid", 404);
    }

    if (!validateDimensions(existingMap.dimensions, [start, end])) {
      throw createError("Route coordinates exceed the map dimensions", 400);
    }

    await validatePositionNotOccupied([start, end], mapId);
  }

  async createGameRoute(gameRouteData) {
    const { mapId, start, end } = gameRouteData;

    await this.validateStartEndPositions(mapId, start, end);

    // Attempt to create the game route
    let routeResult;
    try {
      routeResult = await this.gameRouteRepository.create(gameRouteData);
    } catch (error) {
      console.error("Error creating game route:", error);
      throw createError("Error creating game route", 500);
    }

    if (!routeResult) {
      console.error("Error: routeResult is undefined or null");
      throw createError("Error creating game route", 500);
    }

    // Return the created route if everything went well
    return routeResult;
  }

  async getGameRoutesByMapId(mapId) {
    // Validate that the map exists
    const mapResult = await toResult(this.mapRepository.findById(mapId));
    const map = handleResult(mapResult, "Map not found", 404);

    // If the map does not exist, throw an error
    if (!map) {
      throw new Error("Map not found");
    }

    // Retrieve the routes associated with the map
    const routesResult = await toResult(
      this.gameRouteRepository.findByMapId(mapId)
    );
    return handleResult(routesResult, "Error fetching game routes", 500);
  }

  async getGameRouteById(id) {
    return await this.validateGameRouteExists(id);
  }

  // Update a game route by ID
  async updateGameRouteById(id, updateData) {
    const { start, end } = updateData;
    const gameRoute = await this.validateGameRouteExists(id);
    await this.validateStartEndPositions(gameRoute.mapId, start, end);

    const updateResult = await toResult(
      this.gameRouteRepository.updateById(id, updateData)
    );
    return handleResult(updateResult, "Game route does not exist", 404);
  }

  // Delete a game route by ID
  async deleteGameRouteById(id) {
    const route = await this.validateGameRouteExists(id);
    if (!route) {
      throw createError("Game route does not exist", 404);
    }

    const deleteResult = await toResult(
      this.gameRouteRepository.deleteById(id)
    );
    return handleResult(deleteResult, "Error deleting game route", 500);
  }
}

export default GameRouteService;
