import OptimizedRouteService from "../services/path_services/OptimizedRouteService.js";


const createRoute = async (req, res, next) => {
  try {
    const { mapId, optimizedPath } = req.body;
    console.log(`Recibido mapId: ${mapId}`);  // Agrega un log para depuración
    const newRoute = await OptimizedRouteService.createOptimizedRoute(mapId, optimizedPath);
    res.status(201).json(newRoute);
  } catch (error) {
    next(error);
  }
};


const getRouteById = async (req, res, next) => {
  const { route_id } = req.params;

  try {
    const route = await OptimizedRouteService.getOptimizedRouteById(route_id);
    if (!route) {
      res.status(404).json({ message: "Ruta no encontrada." });
    } else {
      res.status(200).json(route);
    }
  } catch (error) {
    next(error);
  }
};


const updateRouteById = async (req, res, next) => {
  const { route_id } = req.params;
  const { optimized_path } = req.body;

  try {
    const updatedRoute = await OptimizedRouteService.updateOptimizedRouteById(route_id, optimized_path);
    if (!updatedRoute) {
      res.status(404).json({ message: "Ruta no encontrada." });
    } else {
      res.status(200).json({ message: "Ruta actualizada con éxito.", route: updatedRoute });
    }
  } catch (error) {
    next(error);
  }
};

// Eliminar una ruta optimizada por ID
const deleteRouteById = async (req, res, next) => {
  const { route_id } = req.params;

  try {
    await OptimizedRouteService.deleteOptimizedRouteById(route_id);
    res.status(200).json({ message: "Ruta eliminada con éxito." });
  } catch (error) {
    next(error);
  }
};

export default { createRoute, getRouteById, updateRouteById, deleteRouteById };
