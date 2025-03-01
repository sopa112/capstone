import express, { Router } from "express";

import { createContainer} from '../repositories/container/container.js'


const router = Router();
const {obstacleController} = createContainer();



router.post("/", obstacleController.createObstacle);
router.get("/",obstacleController.getAllObstacles);
router.get("/:id", obstacleController.getObstacleById);
router.get("/map/:id", obstacleController.getObstacleByMapId);
router.put("/:id", obstacleController.updateObstacle);
router.delete("/:id", obstacleController.deleteObstacle);

export default router;
