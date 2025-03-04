import express from "express";
import mapRouter from './routes/mapRoutes.js'
import obstacleRoute from  './routes/obstacleRoutes.js'
import waitPointRoutes from "./routes/waitPointsRoutes.js";
import errorMiddleware from "./middlewares/errorHandler.js";
import userRoute from './routes/userRoutes.js'
import gameRoutes from "./routes/gameRouteRoutes.js";
import navegation from "./routes/generalRoutes.js"
import memoizationMiddleware from "./middlewares/memorizationMiddleware.js";
import trackApiUsage from "./middlewares/trackApiUsage.js";
import apiUsage from "./routes/usage/apiUsageRoute.js";



const app = express();

// Middlewares
app.use(express.json());

app.use(trackApiUsage);



//routes
app.use('/api/map',mapRouter)
app.use('/api/obstacle',obstacleRoute)
app.use('/api/waitpoint',waitPointRoutes)
app.use('/api/users',userRoute)
app.use('/api/gameroutes',gameRoutes)

app.use('/api/navegation',navegation)

app.use('/api',apiUsage)
/*
app.use('/api/OptimizedRoute',OptimizedRoute)
*/


app.use(errorMiddleware)
// Base route
app.get("/", (req, res) => {
  res.send("Welcome to my api");
});

export default app;
