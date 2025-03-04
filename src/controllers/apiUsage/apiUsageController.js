import ApiUsage from "../../models/apiUsage.js"; // Importa el modelo de seguimiento


export const getRequestStats = async (req, res) => {
  try {
    const stats = await ApiUsage.aggregate([
      {
        $group: {
          _id: { endpoint: "$endpointAccess", method: "$requestMethod" },
          total_requests: { $sum: "$requestCount" },
        },
      },
      {
        $group: {
          _id: "$_id.endpoint",
          methods: {
            $push: {
              method: "$_id.method",
              count: "$total_requests",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: "$_id",
          methods: 1,
        },
      },
    ]);

    const result = {
      total_requests: stats.reduce((acc, curr) => acc + curr.methods.reduce((a, c) => a + c.count, 0), 0),
      breakdown: stats.reduce((acc, curr) => {
        acc[curr.endpoint] = curr.methods.reduce((a, c) => {
          a[c.method] = c.count;
          return a;
        }, {});
        return acc;
      }, {}),
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas de solicitudes", error });
  }
};

// Endpoint: /stats/response-times
export const getResponseTimes = async (req, res) => {
  try {
    const stats = await ApiUsage.aggregate([
      {
        $group: {
          _id: "$endpointAccess",
          avg: { $avg: "$responseTime.avg" },
          min: { $min: "$responseTime.min" },
          max: { $max: "$responseTime.max" },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: "$_id",
          avg: 1,
          min: 1,
          max: 1,
        },
      },
    ]);

    const result = stats.reduce((acc, curr) => {
      acc[curr.endpoint] = {
        avg: curr.avg,
        min: curr.min,
        max: curr.max,
      };
      return acc;
    }, {});

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tiempos de respuesta", error });
  }
};

// Endpoint: /stats/status-codes
export const getStatusCodes = async (req, res) => {
  try {
    const stats = await ApiUsage.aggregate([
      {
        $group: {
          _id: "$statusCode",
          count: { $sum: "$requestCount" },
        },
      },
      {
        $project: {
          _id: 0,
          statusCode: "$_id",
          count: 1,
        },
      },
    ]);

    const result = stats.reduce((acc, curr) => {
      acc[curr.statusCode] = curr.count;
      return acc;
    }, {});

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener códigos de estado", error });
  }
};

// Endpoint: /stats/popular-endpoints
export const getPopularEndpoints = async (req, res) => {
  try {
    const stats = await ApiUsage.aggregate([
      {
        $group: {
          _id: "$endpointAccess",
          requestCount: { $sum: "$requestCount" },
        },
      },
      {
        $sort: { requestCount: -1 },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          endpoint: "$_id",
          requestCount: 1,
        },
      },
    ]);

    const result = {
      most_popular: stats[0].endpoint,
      request_count: stats[0].requestCount,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener endpoints populares", error });
  }
};