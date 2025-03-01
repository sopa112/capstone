import express from "express";

import { createContainer} from '../repositories/container/container.js'


const {generalController} = createContainer();

const router = express.Router();

router.post("/validateMapConfig", generalController.validateMapConfig);
router.post("/validateRoute", generalController.validateRoute);
/*
router.post("/findOptimalPath", generalController.findOptimalPath);
router.post("/calculateOptimizedRoute", generalController.getOptimizedRoute);
router.post("/verifyRouteStoppingPoints", generalController.verifyRouteStoppingPoints);
router.post("/validateTraversal", generalController.validateTraversal);
*/
export default router;
