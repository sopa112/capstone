import { toResult, handleResult } from "../utils/resultUtils.js";

export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const result = await toResult(this.model.create(data));
    return handleResult(result, "Error creating record", 500);
  }

  async findAll() {
    const result = await toResult(this.model.find());
    return handleResult(result, "Error finding all records", 500);
  }

  async findById(id) {
    console.log(`Buscando mapa con ID: ${id}`);
    const result = await toResult(this.model.findOne({ _id: id })); // Buscar por _id
    console.log(`Resultado de la búsqueda: ${JSON.stringify(result, null, 2)}`);
    return handleResult(result, "Error finding record by ID", 404, true); // allowNotFound: true
  }

  async findOne(query) {
    const result = await toResult(this.model.findOne(query));
    return handleResult(result, "Error finding record", 404, true); // allowNotFound: true
  }

  async updateById(id, updateData) {
    // Buscar y actualizar por _id (campo principal de MongoDB)
    const result = await toResult(
      this.model.findOneAndUpdate({ _id: id }, updateData, { new: true, runValidators: true })
    );
    return handleResult(result, "Error updating record by ID", 500);
  }

  async deleteById(id) {
    // Buscar y eliminar por _id (campo principal de MongoDB)
    const result = await toResult(this.model.findOneAndDelete({ _id: id }));
    return handleResult(result, "Error deleting record by ID", 500);
  }
}