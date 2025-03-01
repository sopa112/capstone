// mapRepository.js
import BaseRepository from "./BaseRepository.js";
import user from "../models/userModel.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(user);
  }

 
  async findByCustomField(customField) {
    try {
      return await this.model.findOne({ customField });
    } catch (error) {
      throw new Error(`Error finding record by custom field: ${error.message}`);
    }
  }
}

export default UserRepository;