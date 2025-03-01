const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};



const createWaitPointController = (waitPointService) => ({

  createWaitPoint: tryCatch(async (req, res) => {
    const newWaitPoint = await waitPointService.createWaitPoint(req.body);
    res.status(201).json(newWaitPoint);
  }),

  getWaitPoints: tryCatch(async (req, res) => {
    const waitPoints = await waitPointService.getAllPoints();
    res.status(200).json(waitPoints);
  }),


  getWaitPointsByMapId: tryCatch(async (req, res) => {
    const waitPoints = await waitPointService.getWaitPointsByMapId(req.params.mapId);
    res.status(200).json(waitPoints);
  }),


  getWaitPointById: tryCatch(async (req, res) => {
    const waitPoint = await waitPointService.getWaitPointById(req.params.id);
    res.status(200).json(waitPoint);
  }),


  updateWaitPoint: tryCatch(async (req, res) => {
    const updatedWaitPoint = await waitPointService.updateWaitPoint(req.params.id, req.body);
    res.status(200).json(updatedWaitPoint);
  }),

  deleteWaitPoint: tryCatch(async (req, res) => {
    const response = await waitPointService.deleteWaitPoint(req.params.id);
    res.status(200).json(response);
  }),
});

export default createWaitPointController;

