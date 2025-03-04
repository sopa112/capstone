import ApiUsage from "../models/apiUsage.js"; // Importa el modelo de seguimiento

function trackApiUsage(req, res, next) {
  const startTime = Date.now(); // Tiempo inicial de la solicitud

  // Capturar la respuesta cuando termine
  res.on("finish", async () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Crear el objeto de seguimiento
    const apiUsageData = {
      endpointAccess: req.path, // Ruta del endpoint
      requestMethod: req.method, // Método HTTP (GET, POST, etc.)
      statusCode: res.statusCode, // Código de estado HTTP
      responseTime: {
        avg: responseTime,
        min: responseTime,
        max: responseTime,
      },
      requestCount: 1, // Contador de solicitudes
      timestamp: new Date(), // Fecha y hora de la solicitud
      userId: req.user ? req.user.id : null, // ID del usuario (si hay autenticación)
    };

    try {
      // Guardar en la base de datos
      await ApiUsage.create(apiUsageData);
    } catch (error) {
      console.error("Error al guardar el seguimiento de la API:", error);
    }
  });

  next(); // Continuar con el siguiente middleware o controlador
}

export default trackApiUsage;