import { validate as isUUID } from "uuid";
import { createError } from "../utils/error.js";
import MapRepository from "../repositories/mapRepository.js";


const mapRepository = new MapRepository();

// Validar que el ID del mapa sea un UUID válido y que el mapa exista
const validateMapExists = async (mapId) => {
  console.log(`Received mapId: ${mapId}`); // Agrega este log
  if (!isUUID(mapId)) {
    throw createError("Invalid map ID format. Must be a UUID.", 400);
  }

  console.log(`Validating existence of map with ID: ${mapId}`);
  const existingMap = await mapRepository.findById(mapId);

  if (!existingMap) {
    console.error(`Map with ID ${mapId} not found.`);
    throw createError("The map does not exist.", 404);
  }

  console.log(`Map found: ${JSON.stringify(existingMap, null, 2)}`);
  return existingMap;
};

export { validateMapExists };