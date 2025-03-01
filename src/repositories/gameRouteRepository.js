import BaseRepository from "./BaseRepository.js";
import gameRoute from "../models/gameRouteModel.js";

class gameRouteRepository extends BaseRepository {
  constructor() {
    super(gameRoute); 
  }

  async findByMapId(mapId) {
    return this.model.find({ mapId });
  }
}

export default gameRouteRepository;
