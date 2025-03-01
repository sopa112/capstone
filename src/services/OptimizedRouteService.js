import OptimizedRoute from "../../models/OptimizedRouteModel.js";
import { validateMapExists } from "../../utils/validation.js";

// Create a new optimized route
const createOptimizedRoute = async (mapId, optimizedPath) => {
  await validateMapExists(mapId); // Validate if map exists
  const newRoute = await OptimizedRoute.create({ mapId, optimizedPath });
  return newRoute;
};

// Read an optimized route by ID
const getOptimizedRouteById = async (routeId) => {
  const route = await OptimizedRoute.findById(routeId);
  if (!route) {
    throw new Error("Route not found.");
  }
  return route;
};

// Update an optimized route by ID
const updateOptimizedRouteById = async (routeId, updatedPath) => {
  const route = await OptimizedRoute.findById(routeId);
  if (!route) {
    throw new Error("Route not found.");
  }
  await validateMapExists(route.mapId); // Validate if map exists
  route.optimizedPath = updatedPath;
  await route.save();
  return route;
};

// Delete an optimized route by ID
const deleteOptimizedRouteById = async (routeId) => {
  const route = await OptimizedRoute.findByIdAndDelete(routeId);
  if (!route) {
    throw new Error("Route not found.");
  }
  return { message: "Route successfully deleted." };
};

export default { createOptimizedRoute, getOptimizedRouteById, updateOptimizedRouteById, deleteOptimizedRouteById };