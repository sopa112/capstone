import { Router } from "express";
import {
  getRequestStats,
  getResponseTimes,
  getStatusCodes,
  getPopularEndpoints,
} from "../../controllers/apiUsage/apiUsageController.js"; // Importa los controladores

const router = Router();

// Endpoints de estadísticas
router.get("/requests", getRequestStats); // /stats/requests
router.get("/response-times", getResponseTimes); // /stats/response-times
router.get("/status-codes", getStatusCodes); // /stats/status-codes
router.get("/popular-endpoints", getPopularEndpoints); // /stats/popular-endpoints

export default router;