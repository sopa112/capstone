import express, { Router } from "express";


import { createContainer} from '../repositories/container/container.js'



const router = Router();
const {waitPointController} = createContainer();

router.post("/", waitPointController.createWaitPoint);

router.get("/", waitPointController.getWaitPoints);

router.get("/map/:id", waitPointController.getWaitPointsByMapId);

router.get("/:id", waitPointController.getWaitPointById);

router.put("/:id", waitPointController.updateWaitPoint);

router.delete("/:id", waitPointController.deleteWaitPoint);

export default router;
