import mongoose from "mongoose";
import baseSchema from "./schema/baseSchema.js";

const obstacleSchema = new mongoose.Schema({

  ...baseSchema,
  x: {
    type: Number,
    required: true,
    min: 0,
  },
  y: {
    type: Number,
    required: true,
    min: 0,
  },
  size: {
    type: Number,
    default: 1,
  },
  mapId: {
    type: String, 
    ref: "Map",
    required: true,
  },
});

const Obstacle = mongoose.model("Obstacle", obstacleSchema);

export default Obstacle;
