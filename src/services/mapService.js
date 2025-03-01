
import { createError } from "../utils/error.js";
import { toResult, handleResult } from "../utils/resultUtils.js";

class MapService {
  constructor(mapRepository, obstacleRepository) {
    this.mapRepository = mapRepository;
    this.obstacleRepository = obstacleRepository;
  }

  
  async createMap(mapData) {
    try {
      console.log("Iniciando createMap con datos:", mapData);
  
      // Validar dimensiones del mapa
      if (mapData.dimensions.width < 2 || mapData.dimensions.height < 2) {
        throw createError("Invalid map dimensions", 400);
      }
  

      const existingMap = await this.mapRepository.findOne({ name: mapData.name });
      if (existingMap) {
        throw createError("El nombre del mapa ya está en uso", 409); // 409: Conflict
      }
      // Crear el mapa sin obstáculos
      const mapToCreate = {
        name: mapData.name,
        dimensions: mapData.dimensions,
        obstacles: [], // Inicialmente sin obstáculos
      };
  
      // Crear el mapa usando el repositorio
      const newMapResult = await toResult(this.mapRepository.create(mapToCreate));
      const newMap = handleResult(newMapResult, "Error creating map", 500);
      console.log("Mapa creado exitosamente:", newMap);
  
      // Crear los obstáculos (si existen) y obtener sus IDs
      if (mapData.obstacles && mapData.obstacles.length > 0) {
        const obstaclesWithMapId = mapData.obstacles.map((obstacle) => ({
          ...obstacle,
          mapId: newMap._id, // Asignar el ID del mapa a cada obstáculo
        }));
  
        // Crear todos los obstáculos en una sola operación
        const createdObstaclesResult = await toResult(
          this.obstacleRepository.create(obstaclesWithMapId)
        );
        const createdObstacles = handleResult(createdObstaclesResult, "Error creating obstacles", 500);
  
        // Obtener los IDs de los obstáculos creados
        const obstacleIds = createdObstacles.map((obstacle) => obstacle._id);
        console.log("Obstacle IDs:", obstacleIds);
  
        // Actualizar el mapa con los IDs de los obstáculos
        const updatedMapResult = await toResult(
          this.mapRepository.updateById(newMap._id, { obstacles: obstacleIds })
        );
        const updatedMap = handleResult(updatedMapResult, "Error updating map with obstacles", 500);
        console.log("Mapa actualizado con obstáculos:", updatedMap);
  
        return updatedMap;
      }
  
      // Si no hay obstáculos, devolver el mapa sin actualizar
      return newMap;
    } catch (error) {
      console.error("Error en createMap:", error);
      throw error;
    }
  }


  async getMaps() {
    const mapsResult = await toResult(this.mapRepository.findAll());
    return handleResult(mapsResult, "Error fetching maps", 500);
  }


  async getMapById(id) {
    const mapResult = await toResult(this.mapRepository.findById(id));
    const foundMap = handleResult(mapResult, "Map does not exist", 404);
    return foundMap;
  }

  async updateMapById(id, updateData) {
    const updateResult = await toResult(this.mapRepository.updateById(id, updateData));
    const updatedMap = handleResult(updateResult, "Map does not exist", 404);
    return updatedMap;
  }


  async deleteMap(id) {
    const deleteResult = await toResult(this.mapRepository.deleteById(id));
    const deletedMap = handleResult(deleteResult, "Element does not exist", 500);
    return { message: "Map successfully deleted" };
  }



  async validateCoordinates(mapId, x, y) {
    try {
      // Buscar el mapa por su ID
      const mapResult = await toResult(this.mapRepository.findById(mapId));
      const map = handleResult(mapResult, "Map does not exist", 404);

      // Obtener las dimensiones del mapa
      const { width, height } = map.dimensions;

      // Validar que las coordenadas no excedan las dimensiones del mapa
      if (x < 0 || x >= width || y < 0 || y >= height) {
        throw createError("Coordinates exceed map dimensions", 400);
      }

      // Si las coordenadas son válidas, retornar true
      return true;
    } catch (error) {
      console.error("Error in validateCoordinates:", error);
      throw error;
    }
  }



}

export default MapService;