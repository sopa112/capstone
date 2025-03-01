import express, { Router } from "express";

import { createContainer} from '../repositories/container/container.js'


const {userController} = createContainer();


const router = Router();

router.post("/", userController.createUser);

router.get("/:userId", userController.getUserById);

router.put("/:userId", userController.updateUser);

router.delete("/:userId", userController.deleteUser);


export default router;
