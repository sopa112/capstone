import { createError } from "../utils/error.js";
import { toResult, handleResult } from "../utils/resultUtils.js";
import { validateMapExists } from "../utils/idValidator.js";
import validateMapObstacles from "./path_services/principalPathService.js"


class GeneralService {
  constructor(mapRepository, obstacleRepository, waitPointRepository, gameRouteRepository) {
    this.mapRepository = mapRepository;
    this.obstacleRepository = obstacleRepository;
    this.waitPointRepository = waitPointRepository;
    this.gameRouteRepository = gameRouteRepository;
  }

  async validateMapConfiguration(mapId) {
    console.log(`Validating configuration for map with ID: ${mapId}`);
  
    // Validar que el mapa existe
    const existingMap = await validateMapExists(mapId);
    console.log(`Map found: ${JSON.stringify(existingMap, null, 2)}`);
  
    // Validar que el mapa tenga obstáculos
    const obstaclesResult = await toResult(this.obstacleRepository.findByMapId(mapId));
    const obstacles = handleResult(obstaclesResult, "Error fetching obstacles", 500);
    console.log(`Obstacles found: ${obstacles.length}`);
  
    // Validar que el mapa tenga puntos de espera
    const waitPointsResult = await toResult(this.waitPointRepository.findByMapId(mapId));
    const waitPoints = handleResult(waitPointsResult, "Error fetching wait points", 500);
    console.log(`Wait points found: ${waitPoints.length}`);
  
    // Verificar si el mapa está completamente configurado
    if (obstacles.length === 0 && waitPoints.length === 0) {
      return { message: "The map is not configured. It has no obstacles and no wait points." };
    } else if (obstacles.length === 0) {
      return { message: "The map is partially configured. It has no obstacles." };
    } else if (waitPoints.length === 0) {
      return { message: "The map is partially configured. It has no wait points." };
    } else {
      return { message: "The map has been correctly configured with obstacles and wait points." };
    }
  }

  async validateRoute(mapId, startPoint, destinationPoint, newObstacles = []) {
    try {
      console.log(`Validating route for map with ID: ${mapId}`);

      // Validar que el mapa existe
      const existingMap = await validateMapExists(mapId);
      console.log(`Map found: ${JSON.stringify(existingMap, null, 2)}`);

      // Validar los obstáculos (existentes y nuevos)
      const obstaclesValidation = await validateMapObstacles(
        this.mapRepository,
        this.obstacleRepository
      )(mapId, newObstacles);

      // Validar que el punto de inicio esté dentro del mapa
      const startValidation = await this.mapRepository.validateCoordinates(
        mapId,
        startPoint.x,
        startPoint.y
      );
      if (!startValidation) {
        throw createError("Start point is outside the map boundaries", 400);
      }

      // Validar que el punto de destino esté dentro del mapa
      const destinationValidation = await this.mapRepository.validateCoordinates(
        mapId,
        destinationPoint.x,
        destinationPoint.y
      );
      if (!destinationValidation) {
        throw createError("Destination point is outside the map boundaries", 400);
      }

      // Si todo es válido, retornar un mensaje de éxito
      return {
        valid: true,
        message: "Route and obstacles are valid",
        obstaclesValidation,
      };
    } catch (error) {
      console.error("Error validating route:", error.message);
      throw error;
    }
  
  }
}

export default GeneralService;
