
const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

const createObstacleController = (obstacleService) => ({

  createObstacle: tryCatch(async (req, res) => {
    const newObstacle = await obstacleService.createObstacle(req.body);
    res.status(201).json(newObstacle);
  }),


  getObstaclesByMapId: tryCatch(async (req, res) => {
    const obstacles = await obstacleService.getObstaclesByMapId(req.params.mapId);
    res.status(200).json(obstacles);
  }),


  getAllObstacles: tryCatch(async (req, res) => {
    console.log('[CONTROLLER] Ejecutando getAllObstacles');
    const obstacles = await obstacleService.getObstacles();
    res.status(200).json(obstacles);
  }),


  getObstacleById: tryCatch(async (req, res) => {
    console.log('[CONTROLLER] Ejecutando getAllObstacles');
    const obstacle = await obstacleService.getObstacleById(req.params.id);
    res.status(200).json(obstacle);
  }),


  getObstacleByMapId: tryCatch(async (req, res) => {
    console.log('[CONTROLLER] Ejecutando getAllObstacles');
    const obstacle = await obstacleService.getObstaclesByMapId(req.params.id);
    res.status(200).json(obstacle);
  }),


  updateObstacle: tryCatch(async (req, res) => {
    const updatedObstacle = await obstacleService.updateObstacle(req.params.id, req.body);
    res.status(200).json(updatedObstacle);
  }),

  deleteObstacle: tryCatch(async (req, res) => {
    const result = await obstacleService.deleteObstacle(req.params.id);
    res.status(200).json(result);
  }),
});

export default createObstacleController;