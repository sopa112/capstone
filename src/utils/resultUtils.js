import Result from "folktale/result/index.js";
import { createError } from "./error.js";

// Function to wrap an asynchronous operation in a Result
const toResult = async (promise) => {
  try {
    const data = await promise;
    return Result.Ok(data); // Siempre devolver Result.Ok, incluso si data es null o undefined
  } catch (error) {
    return Result.Error(error);
  }
};

// Function to handle the result and throw errors if necessary
const handleResult = (result, errorMessage, statusCode, allowNotFound = false) => {
  console.log(`Handling result: ${JSON.stringify(result, null, 2)}`); // Log del resultado
  console.log(`allowNotFound: ${allowNotFound}`); // Log del valor de allowNotFound

  if (result.isError) {
    const error = result.value;
    console.log(`Error found: ${JSON.stringify(error, null, 2)}`); // Log del error
    if (error.statusCode === 404 && allowNotFound) {
      return null; // No lanzar error si allowNotFound es true
    }
    throw createError(error.message || errorMessage, error.statusCode || statusCode);
  }

  // Si el valor es null o undefined y allowNotFound es true, no lanzar error
  if ((result.value === null || result.value === undefined) && allowNotFound) {
    console.log("Returning null because allowNotFound is true"); // Log adicional
    return null;
  }

  // Si el valor es null o undefined y allowNotFound es false, lanzar error
  if (result.value === null || result.value === undefined) {
    throw createError(errorMessage || "No result found", statusCode || 404);
  }

  return result.value;
};
export { toResult, handleResult };
