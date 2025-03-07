import MapRepository from "../../repositories/mapRepository.js";
import MapService from "../../services/mapService.js";
import createMapController from "../../controllers/mapController.js";

import ObstacleRepository from "../../repositories/obstacleRepository.js";
import ObstacleService from "../../services/obstacleService.js";
import createObstacleController from "../../controllers/obstacleController.js";

import WaitPointRepository from "../../repositories/waitPointRespository.js";                                                             
import WaitPointService from "../../services/waitPointService.js";
import createWaitPointController from "../../controllers/waitPointController.js";

import UserRepository from "../../repositories/userRepository.js";
import UserService from "../../services/userService.js";
import createUserController from "../../controllers/userController.js";

import GameRouteRepository from "../../repositories/gameRouteRepository.js";
import GameRouteService from "../../services/gameRouteService.js";
import createGameRouteController from "../../controllers/gameRouteController.js";


import GeneralService from "../../services/generalService.js";
import createGeneralController from '../../controllers/generalController.js'

export function createContainer() {
  const mapRepository = new MapRepository();
  const obstacleRepository = new ObstacleRepository();
  const waitPointRepository = new WaitPointRepository();
  const userRepository = new UserRepository();
  const gameRouteRepository = new GameRouteRepository();

  const mapService = new MapService(mapRepository, obstacleRepository);
  const obstacleService = new ObstacleService(obstacleRepository);
  const waitPointService = new WaitPointService(waitPointRepository, mapRepository);
  const userService = new UserService(userRepository);
  const gameRouteService = new GameRouteService(gameRouteRepository, mapRepository, obstacleRepository, obstacleService);
  const generalService = new GeneralService(mapRepository,obstacleRepository,waitPointRepository,gameRouteRepository)
  

  const mapController = createMapController(mapService);
  const obstacleController = createObstacleController(obstacleService);
  const waitPointController = createWaitPointController(waitPointService);
  const userController = createUserController(userService);
  const gameRouteController = createGameRouteController(gameRouteService);

  const generalController = createGeneralController(generalService);



  return {
    mapRepository,
    obstacleRepository,
    mapService,
    mapController,
    obstacleController,
    waitPointController,
    userController,
    gameRouteController,
    generalController,
  

  };
}
