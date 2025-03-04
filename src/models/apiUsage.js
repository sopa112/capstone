import mongoose from "mongoose";
import baseSchema from "./schema/baseSchema.js";

const apiUsageSchema = new mongoose.Schema({
    ...baseSchema,
  endpointAccess: { type: String, required: true }, // Ruta del endpoint
  requestMethod: { type: String, required: true }, // Método HTTP
  statusCode: { type: Number, required: true }, // Código de estado HTTP
  responseTime: {
    avg: { type: Number, required: true }, // Tiempo de respuesta promedio
    min: { type: Number, required: true }, // Tiempo de respuesta mínimo
    max: { type: Number, required: true }, // Tiempo de respuesta máximo
  },
  requestCount: { type: Number, default: 1 }, // Contador de solicitudes
  timestamp: { type: Date, default: Date.now }, // Fecha y hora de la solicitud
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", optional: true }, // ID del usuario (opcional)
});

export default mongoose.model("ApiUsage", apiUsageSchema);