// routes/mapRoutes.js
import express from "express";

import { createContainer} from '../repositories/container/container.js'


const {mapController} = createContainer();

// Crear instancias

const router = express.Router();



// Definir rutas
router.post("/", mapController.createMap);
router.get("/", mapController.getAllMaps);
router.get("/:id", mapController.getMapById);
router.put("/:id", mapController.updateMap);
router.delete("/:id", mapController.deleteMap);

export default router;