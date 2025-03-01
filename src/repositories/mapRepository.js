// mapRepository.js
import BaseRepository from "./BaseRepository.js";
import map from "../models/mapModel.js";

class MapRepository extends BaseRepository {
  constructor() {
    super(map); 
  }

async findByMapId(mapId) {

  if (!mongoose.Types.ObjectId.isValid(mapId)) {
    mapId = mongoose.Types.ObjectId(mapId);
  }
  return this.model.find({ mapId });
}
  
 
}

export default MapRepository;