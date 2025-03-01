import mongoose from "mongoose";
import baseSchema from "./schema/baseSchema.js";

const gameRouteSchema = new mongoose.Schema({
  ...baseSchema,
  mapId: {
    type: String, 
    ref: "Map",
    required: true,
  },
  start: {
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
  },
  end: {
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
  },
  distance: {
    type: Number,
    required: true,
    min: 0,
  },
});

const GameRoute = mongoose.model("GameRoute", gameRouteSchema);

export default GameRoute;