import mongoose from "mongoose";
import baseSchema from "./schema/baseSchema.js";

const optimizedRouteSchema = new mongoose.Schema({
  ...baseSchema,
  mapId: {
    type: String, 
    ref: "Map",
    required: true,
  },
  optimizedPath: [
    {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const OptimizedRoute = mongoose.model("OptimizedRoute", optimizedRouteSchema);

export default OptimizedRoute;
