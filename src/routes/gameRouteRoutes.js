import { Router } from "express";

import { createContainer } from "../repositories/container/container.js";

const { gameRouteController } = createContainer();

const router = Router();

router.post("/", gameRouteController.createGameRoute);

router.get("/map/:mapId", gameRouteController.getGameRoutesByMapId);

router.put("/:id", gameRouteController.updateGameRoute);

router.delete("/:id", gameRouteController.deleteGameRoute);

router.get("/:id", gameRouteController.getGameRouteById);

export default router;
