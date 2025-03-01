import { createError } from "../utils/error.js";
import { toResult, handleResult } from "../utils/resultUtils.js";

class ObstacleService {
  constructor(obstacleRepository) {
    this.obstacleRepository = obstacleRepository;
  }

  async createObstacle(obstacleData) {
    try {
      console.log("Received obstacleData:", obstacleData);

 
      if (obstacleData.width < 1 || obstacleData.height < 1) {
        throw createError("Invalid obstacle dimensions", 400);
      }


      const newObstacleResult = await toResult(
        this.obstacleRepository.create(obstacleData)
      );

      console.log("newObstacleResult:", newObstacleResult);

      const newObstacle = handleResult(newObstacleResult, "Error creating obstacle", 500);

      console.log("Obstacle created successfully:", newObstacle);
      return newObstacle;
    } catch (error) {
      console.error("Error in createObstacle:", error);
      throw error;
    }
  }

  async getObstaclesByMapId(id){

    const obstacleResult = await toResult(this.obstacleRepository.findByMapId(id))
    const foundObstacle = handleResult(obstacleResult, "Obstacle does not exist", 404);
    return foundObstacle;

  }

  async getObstacles() {
    const obstaclesResult = await toResult(this.obstacleRepository.findAll());
    return handleResult(obstaclesResult, "Error fetching obstacles", 500);
  }


  async getObstacleById(id) {
    const obstacleResult = await toResult(this.obstacleRepository.findById(id));
    const foundObstacle = handleResult(obstacleResult, "Obstacle does not exist", 404);
    return foundObstacle;
  }


  async updateObstacleById(id, updateData) {
    const updateResult = await toResult(this.obstacleRepository.updateById(id, updateData));
    const updatedObstacle = handleResult(updateResult, "Obstacle does not exist", 404);
    return updatedObstacle;
  }


  async deleteObstacle(id) {
    const deleteResult = await toResult(this.obstacleRepository.deleteById(id));
    handleResult(deleteResult, "Obstacle does not exist", 500);
    return { message: "Obstacle successfully deleted" };
  }
}

export default ObstacleService;
