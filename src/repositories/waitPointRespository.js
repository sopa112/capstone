// mapRepository.js
import BaseRepository from "./BaseRepository.js";
import waitPoint from "../models/waitPointModel.js";

class WaitPointRepository extends BaseRepository {
  constructor() {
    super(waitPoint); 
  }

  async findByMapId(mapId) {
    return await this.model.find({ mapId });
  }
}

export default WaitPointRepository;