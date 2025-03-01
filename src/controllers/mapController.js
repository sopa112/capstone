
const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};


const createMapController = (mapService) => ({

  createMap: tryCatch(async (req, res) => {
    const newMap = await mapService.createMap(req.body);
    res.status(201).json(newMap);
  }),


  getAllMaps: tryCatch(async (req, res) => {
    const maps = await mapService.getMaps();
    res.status(200).json(maps);
  }),


  getMapById: tryCatch(async (req, res) => {
    const map = await mapService.getMapById(req.params.id);
    res.status(200).json(map);
  }),


  updateMap: tryCatch(async (req, res) => {
    const updatedMap = await mapService.updateMapById(req.params.id, req.body);
    res.status(200).json(updatedMap);
  }),

  deleteMap: tryCatch(async (req, res) => {
    const result = await mapService.deleteMap(req.params.id);
    res.status(200).json(result);
  }),
});

export default createMapController;