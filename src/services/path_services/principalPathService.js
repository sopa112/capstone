// principalPathService.js
const validateMapObstacles = (mapService, obstacleRepository) => async (mapId, newObstacles) => {
  try {
    console.log("Validating obstacles for map with ID:", mapId);

    // Validar que los obstáculos tengan el formato correcto
    if (newObstacles && Array.isArray(newObstacles)) {
      for (const obstacle of newObstacles) {
        if (!obstacle.position || typeof obstacle.position.x !== "number" || typeof obstacle.position.y !== "number") {
          throw new Error("Invalid obstacle format. Each obstacle must have a position with x and y coordinates.");
        }
      }
    }

    // Obtener los obstáculos existentes en la base de datos para este mapa
    const existingObstacles = await obstacleRepository.findByMapId(mapId);

    // Combinar los obstáculos existentes con los nuevos obstáculos
    const allObstacles = [...existingObstacles, ...newObstacles];

    // Validar cada obstáculo
    const validationResults = await Promise.all(
      allObstacles.map(async (obstacle) => {
        const { x, y } = obstacle.position; // Ahora es seguro acceder a obstacle.position
        return await mapService.validateCoordinates(mapId, x, y);
      })
    );

    // Verificar si todas las posiciones de los obstáculos son válidas
    const allValid = validationResults.every((isValid) => isValid === true);

    if (!allValid) {
      throw new Error("One or more obstacles exceed the map dimensions");
    }

    return { valid: true, message: "All obstacles are within the map dimensions" };
  } catch (error) {
    console.error("Error validating obstacles:", error.message);
    throw error;
  }
};

export default validateMapObstacles;