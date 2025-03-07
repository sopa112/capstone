// controllers/gameRouteController.js

// Función para manejar errores
const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};


const createGameRouteController = (gameRouteService) => ({

  createGameRoute: tryCatch(async (req, res) => {
    // console.log("Request body:", req.body);
    const newGameRoute = await gameRouteService.createGameRoute(req.body);
    // console.log(newGameRoute);
    res.status(201).json({ message: "Route created successfully", newGameRoute });
  }),
  


  getGameRouteById: tryCatch(async (req, res) => {
    const route = await gameRouteService.getGameRouteById(req.params.id);
    res.status(200).json(route);
  }),


  getGameRoutesByMapId: tryCatch(async (req, res) => {
    const routes = await gameRouteService.getGameRoutesByMapId(req.params.mapId);
    res.status(200).json(routes);
  }),


  updateGameRoute: tryCatch(async (req, res) => {
    const updatedRoute = await gameRouteService.updateGameRouteById(req.params.id, req.body);
    res.status(200).json(updatedRoute);
  }),


  deleteGameRoute: tryCatch(async (req, res) => {
    const result = await gameRouteService.deleteGameRouteById(req.params.id);
    res.status(200).json(result);
  }),
});

export default createGameRouteController;
