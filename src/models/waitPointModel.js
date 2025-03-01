import mongoose from "mongoose";
import baseSchema from "./schema/baseSchema.js";
const waitPointSchema = new mongoose.Schema({
  ...baseSchema,
  mapId: {
    type: String, 
    ref: "Map",
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
});

const WaitPoint = mongoose.model("WaitPoint", waitPointSchema);

export default WaitPoint;
