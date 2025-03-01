// repositories/obstacleRepository.js
import BaseRepository from "./BaseRepository.js";
import Obstacle from "../models/obstacleModel.js";

class ObstacleRepository extends BaseRepository {
  constructor() {
    super(Obstacle);
  }


  async findByMapId(mapId) {
    return await this.model.find({ mapId });
  }
}

export default ObstacleRepository;