
import { v4 as uuidv4 } from "uuid";

const baseSchema = {
  _id: {
    type: String,
    default: uuidv4,
  },
};

export default baseSchema;
