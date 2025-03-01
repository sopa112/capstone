import { createError } from "../utils/error.js";
import { toResult, handleResult } from "../utils/resultUtils.js";

class WaitPointService {
  constructor(waitPointRepository, mapRepository) {
    this.waitPointRepository = waitPointRepository;
    this.mapRepository = mapRepository;
  }

  async createWaitPoint(waitPointData) {
    const { mapId, x, y } = waitPointData;

    const existingMapResult = await toResult(this.mapRepository.findById(mapId));
    const existingMap = handleResult(existingMapResult, "Map does not exist", 404);

    if (x < 0 || y < 0 || x >= existingMap.dimensions.width || y >= existingMap.dimensions.height) {
      throw createError("The wait point coordinates exceed the dimensions of the map.", 400);
    }

    const newWaitPointResult = await toResult(this.waitPointRepository.create(waitPointData));
    return handleResult(newWaitPointResult, "Error creating wait point", 500);
  }

  async getWaitPointsByMapId(mapId) {
    const existingMapResult = await toResult(this.mapRepository.findById(mapId));
    handleResult(existingMapResult, "Map does not exist", 404);

    const waitPointsResult = await toResult(this.waitPointRepository.find({ mapId }));
    return handleResult(waitPointsResult, "No wait points found for this map.", 404);
  }

  async getAllPoints() {
    const waitPointsResult = await toResult(this.waitPointRepository.findAll());
    return handleResult(waitPointsResult, "No wait points found.", 404);
  }

  async getWaitPointById(id) {
    const waitPointResult = await toResult(this.waitPointRepository.findById(id));
    return handleResult(waitPointResult, "Wait point does not exist", 404);
  }

  async updateWaitPoint(id, updateData) {
    const waitPointResult = await toResult(this.waitPointRepository.findById(id));
    const waitPoint = handleResult(waitPointResult, "Wait point does not exist", 404);

    const existingMapResult = await toResult(this.mapRepository.findById(waitPoint.mapId));
    const existingMap = handleResult(existingMapResult, "Map does not exist", 404);

    if (updateData.x !== undefined && updateData.y !== undefined) {
      if (updateData.x < 0 || updateData.y < 0 || updateData.x >= existingMap.dimensions.width || updateData.y >= existingMap.dimensions.height) {
        throw createError("The wait point coordinates exceed the dimensions of the map.", 400);
      }
    }

    const updatedWaitPointResult = await toResult(this.waitPointRepository.updateById(id, updateData));
    return handleResult(updatedWaitPointResult, "Error updating wait point", 500);
  }

  async deleteWaitPoint(id) {
    const deleteResult = await toResult(this.waitPointRepository.deleteById(id));
    handleResult(deleteResult, "Wait point does not exist", 404);
    return { message: "Wait point successfully deleted" };
  }
}

export default WaitPointService;
