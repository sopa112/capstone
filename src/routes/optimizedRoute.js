import express from "express";
import optimizedRouteController from "../controllers/optimizedRouteController.js";

const router = express.Router();

router.post("/", optimizedRouteController.createRoute);
router.get("/:route_id", optimizedRouteController.getRouteById);
router.put("/:route_id", optimizedRouteController.updateRouteById);
router.delete("/:route_id", optimizedRouteController.deleteRouteById);

export default router;
