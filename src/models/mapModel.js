import mongoose from "mongoose";
import baseSchema from "./schema/baseSchema.js";

const mapSchema = new mongoose.Schema({
  ...baseSchema,

  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
    unique: true,
    index: true,
  },

  dimensions: {
    width: {
      type: Number,
      required: true,
      min: [2, 'The minimum width is 2'],
      max: [10, 'The maximum width is 10'],
      default: 5,
    },
    height: {
      type: Number,
      required: true,
      min: [2, 'The minimum height is 2'],
      max: [10, 'The maximum height is 10'],
      default: 5,
    },
  },

  obstacles: [
    {
      type: String, 
      ref: "Obstacle",
    },
  ],
});

const Map = mongoose.model("Map", mapSchema);

export default Map;
