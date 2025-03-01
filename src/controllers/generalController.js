const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

const createPathController = (generalService, optimizedPathService, validationPathService) => ({

  validateMapConfig: tryCatch(async (req, res) => {
    const { map_id } = req.body;
    const result = await generalService.validateMapConfiguration(map_id);
    res.status(200).json(result);
  }),

  validateRoute: tryCatch(async (req, res) => {
    const { map_id, start_point, destination_point } = req.body;
    const result = await generalService.validateGameRoute(map_id, start_point, destination_point);
    res.status(200).json(result);
  }),

  findOptimalPath: tryCatch(async (req, res) => {
    const { start_point, destination_point, map_data, userPreferences } = req.body;
    const optimalPath = validationPathService.calculateOptimalPath(start_point, destination_point, map_data, userPreferences);
    if (optimalPath.length === 0) {
      res.status(404).json({ message: "No valid path found." });
    } else {
      res.status(200).json({ optimal_path: optimalPath });
    }
  }),

  getOptimizedRoute: tryCatch(async (req, res) => {
    const { start_point, destination_point, map_data, user_preferences } = req.body;
    const result = optimizedPathService(start_point, destination_point, map_data, user_preferences);
    res.status(200).json(result);
  }),

  verifyRouteStoppingPoints: tryCatch(async (req, res) => {
    const { optimized_path, stopping_points } = req.body;
    validationPathService.verifyStoppingPoints(optimized_path, stopping_points);
    res.status(200).json({ message: "The calculated route meets all stopping point restrictions." });
  }),

  validateTraversal: tryCatch(async (req, res) => {
    const { optimal_path, map_data } = req.body;
    validationPathService.validatePath(optimal_path, map_data);
    res.status(200).json({ message: "Map traversal successfully completed, avoiding obstacles and passing through stopping points." });
  })
});

export default createPathController;
