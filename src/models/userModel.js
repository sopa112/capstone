import mongoose from 'mongoose';
import baseSchema from "./schema/baseSchema.js";

const userSchema = new mongoose.Schema({

    ...baseSchema,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    savedMaps: [
      {
        type: String, 
        ref: "Map",
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model('User', userSchema);

export default User;
