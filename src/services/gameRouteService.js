import {createError} from "../utils/error.js";
import {
    validateDimensions,
    validatePositionNotOccupied,
} from "../utils/validation.js";
import {toResult, handleResult} from "../utils/resultUtils.js";
import obstacleRepository from "../repositories/obstacleRepository.js";

// import sleep from "sleep"


/**
 *
 * @param x {number}
 * @param y {number}
 * @constructor
 */
function Position(x, y) {
    this.x = x
    this.y = y
}

/**
 *
 * @param data {Position}
 * @param type {String}
 * @param from {Cell?}
 * @constructor
 */
function Cell(data, type, from) {
    this.position = data
    this.from = from
    this.type = type
    this.h = 0
    this.g = 0

    this.getF = function () {
        return this.h + this.g
    }

    this.setH = function (h) {
        this.h = h
        return this
    }

    this.setG = function (g) {
        this.g = g
        return this
    }
    this.getG = function () {
        return this.g
    }

}

class MyMap {
    /**
     * @property start
     * @type {{x: number, y: number}}
     */
    start

    /**
     * @property end
     * @type {{x: number, y: number}}
     */
    end

    /**
     * @property dimensions
     * @type {{width: number, height: number}}
     */
    dimensions

    /**
     *
     * @property obstacles
     * @type {{x: number, y: number}[]}
     */
    obstacles

    /**
     * @property waitPoints
     * @type {{
     *      points: {[key:string]: {x:number, y:number}},
     *      relation: {from:string, to:string}[]
     *  }}
     */
    waitPoints


    constructor(map) {
        this.map = map
        console.log("Dimensions: ", map.value.dimensions)

        this.dimensions = map.value.dimensions

        if (map.value.obstacles && map.value.obstacles.length) {
            this.obstacles = map.value.obstacles
        }
    }

    /**
     *
     * @param {{x: number, y: number}[]} obstacles
     */
    addObstacles(obstacles) {
        if (obstacles)
            for (const obstacle of obstacles) {
                this.obstacles.push(obstacle)
            }
    }

    /**
     *
     * @param {{
     *      points: {[key:String]: {x:number, y:number}},
     *      relation: {from:String, to:String}[]
     *  }} waitPoints
     */
    addWaitPoints(waitPoints) {
        this.waitPoints = waitPoints
    }

    /**
     * @param {{
     *  start: {x:number, y:number},
     *  end: {x:number, y:number},
     *  obstacles: {x:number, y:number}[],
     *  waitPoints: {
     *      points: {[key:string]: {x:number, y:number}},
     *      relation: {from:string, to:string}[]
     *  }
     * }} gameRouteData
     * @return boolean
     */
    applyRoute(gameRouteData) {
        const {start, end} = gameRouteData
        let isOk = true

        // Check if the start and end coordinates are within the map dimensions
        if (this.obstacles && this.obstacles.length) {
            for (const obstacle of this.obstacles) {
                if (obstacle.x === start.x && obstacle.y === start.y || obstacle.x === end.x && obstacle.y === end.y) {
                    isOk = false
                }
            }
        }

        if (isOk) {
            this.start = start
            this.end = end

            this.addObstacles(gameRouteData.obstacles)
            this.addWaitPoints(gameRouteData.waitPoints)
        }

        return isOk
    }

    /**
     *
     * @return {Cell[][]}
     */
    getMatriz() {
        /**@type{Array<Array<Cell>>}*/
        const matriz = []

        for (let i = 0; i < this.dimensions.width; i++) {
            /**@type{Array<Cell>}*/
            const column = []
            for (let j = 0; j < this.dimensions.height; j++) {
                column.push(new Cell(new Position(i, j), "0"))
            }
            matriz.push(column)
        }

        for (const i of this.obstacles) {
            console.log("Obstacle:", i.x, i.y)
            matriz[i.x][i.y] = new Cell(new Position(i.x, i.y), "X")
        }

        console.log("Start:", this.start.x, this.start.y)
        matriz[this.start.x][this.start.y] = new Cell(new Position(this.start.x, this.start.y), "S")

        console.log("End:", this.end.x, this.end.y)
        matriz[this.end.x][this.end.y] = new Cell(new Position(this.end.x, this.end.y), "E")

        return matriz
    }

    /**
     * @param obstacleRepository {ObstacleRepository}
     */
    async findObstacles(obstacleRepository) {
        if (this.map.value.obstacles && this.map.value.obstacles.length) {
            this.obstacles = (await toResult(obstacleRepository.findByMapId(this.map.value._id))).value

            // console.log(this.obstacles)

            // for (let i = 0; i < this.map.value.obstacles.length; i++) {
            //   console.log(Object.getOwnPropertyDescriptor(obstacleRepository))
            //   console.log(await toResult(obstacleRepository.findByMapId(this.map.value._id)))
            // }
        }
    }

    findRoute() {
        /** @type {Cell[][]} */
        const grid = this.getMatriz()

        let startNode = grid[this.start.x][this.start.y];
        let endNode = grid[this.end.x][this.end.y];

        // Buscar el nodo de inicio y el nodo final en la matriz
        /*for (let y = 0; y < grid.length; y++) { Todo: No va a hacer falta
          for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x].type === "s") {
              startNode = grid[y][x];
            } else if (grid[y][x].type === "e") {
              endNode = grid[y][x];
            }
          }
        }*/

        if (this.waitPoints && this.waitPoints.relation && this.waitPoints.relation.length) {
            let routes = []

            for (let i = 0; i < this.waitPoints.relation.length; i++) {
                if (i === 0) {
                    const map = new MyMap({
                        value: {
                            dimensions: this.dimensions,
                            obstacles: this.obstacles
                        }
                    })
                    map.applyRoute({
                        start: this.start,
                        end: this.waitPoints.points[this.waitPoints.relation[i].from]
                    })

                    routes.push(map.findRoute()[0])
                }

                const _map = new MyMap({
                    value: {
                        dimensions: this.dimensions,
                        obstacles: this.obstacles
                    }
                })
                _map.applyRoute({
                    start: this.waitPoints.points[this.waitPoints.relation[i].from],
                    end: this.waitPoints.points[this.waitPoints.relation[i].to],
                })

                routes.push(_map.findRoute()[0])

                if (i === this.waitPoints.relation.length - 1) {
                    const map = new MyMap({
                        value: {
                            obstacles: this.obstacles,
                            dimensions: this.dimensions
                        }
                    })
                    map.applyRoute({
                        start: this.waitPoints.points[this.waitPoints.relation[i].to],
                        end: this.end,
                    })

                    routes.push(map.findRoute()[0])
                }
            }

            if (routes) return routes
        }

        if (!startNode || !endNode) {
            console.error("No se encontró el nodo de inicio o final.");
            return [];
        }

        // Inicializar propiedades para cada nodo
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                grid[x][y].g = Infinity;      // Costo desde el inicio
                grid[x][y].h = 0;             // Heurística (estimación al final)
                grid[x][y].f = Infinity;      // f = g + h
                grid[x][y].previous = null;   // Para reconstruir el camino
            }
        }

        /** Función heurística (distancia Manhattan)
         *
         * @param {Cell} a
         * @param {Cell} b
         * @returns {number}
         */
        function heuristic(a, b) {
            return Math.abs(a.position.x - b.position.x) + Math.abs(a.position.y - b.position.y);
        }

        // Inicializar el nodo de inicio
        startNode.g = 0;
        startNode.h = heuristic(startNode, endNode);
        startNode.f = startNode.g + startNode.h;

        let openSet = [startNode]; // Nodos a evaluar
        let closedSet = [];        // Nodos ya evaluados

        // Función para obtener los vecinos (4 direcciones: arriba, derecha, abajo, izquierda)
        function getNeighbors(node) {
            let neighbors = [];
            const {x, y} = node.position;
            const directions = [
                {x: 0, y: -1}, // Arriba
                {x: 1, y: 0},  // Derecha
                {x: 0, y: 1},  // Abajo
                {x: -1, y: 0}  // Izquierda
            ];

            for (let dir of directions) {
                let newX = x + dir.x;
                let newY = y + dir.y;
                // Verificar que el nuevo nodo esté dentro de los límites de la matriz
                if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
                    neighbors.push(grid[newX][newY]); // Accedemos como grid[y][x]
                }
            }
            return neighbors;
        }

        // Bucle principal del algoritmo A*
        while (openSet.length > 0) {
            // Encontrar el nodo con el menor valor f en openSet
            let currentIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }
            let current = openSet[currentIndex];
            // console.log('current:',current)

            // Si se ha alcanzado el nodo final, reconstruir el camino
            if (current === endNode) {
                let path = [];
                let temp = current;
                while (temp) {
                    path.push(temp.position);
                    let ant = temp
                    temp = temp.previous;
                    // delete ant.previous
                    // delete ant.f
                    // delete ant.g
                    // delete ant.h
                    // delete ant.type
                }
                // El camino se construyó de final a inicio, se invierte antes de retornar
                // console.log("entra")
                return [path.reverse()];
            }

            // Eliminar el nodo actual de openSet y agregarlo a closedSet
            openSet.splice(currentIndex, 1);
            closedSet.push(current);

            // Evaluar los vecinos del nodo actual
            let neighbors = getNeighbors(current);
            for (let neighbor of neighbors) {
                // Ignorar si el vecino es un obstáculo o ya se evaluó
                if (neighbor.type === "X" || closedSet.includes(neighbor)) {
                    continue;
                }

                let tentativeG = current.g + 1; // Costo para movernos a un vecino (se asume costo uniforme = 1)
                let newPath = false;

                // Si el vecino no está en openSet, o encontramos un camino más corto para llegar a él
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                    newPath = true;
                } else if (tentativeG < neighbor.g) {
                    newPath = true;
                }

                // Actualizar los valores del vecino
                if (newPath) {
                    neighbor.g = tentativeG;
                    neighbor.h = heuristic(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;
                }
            }
        }

        // Si se agota openSet sin alcanzar el nodo final, no existe camino posible
        console.error("No se encontró un camino.");
        return [];
    }

    toString() {
        const matriz = this.getMatriz()


        let result = ""

        for (let i = 0; i < matriz[0].length; i++) {
            if (i > 0) result += "\n"

            for (const element of matriz) {
                result += element[i].type
            }
        }

        return result
    }
}

/**
 * @property gameRouteRepository
 * @property mapRepository
 * @property obstacleRepository
 * @property obstacleService
 */
class GameRouteService {
    constructor(gameRouteRepository, mapRepository, obstacleRepository, obstacleService) {
        this.gameRouteRepository = gameRouteRepository;
        this.mapRepository = mapRepository;
        this.obstacleRepository = obstacleRepository;
        this.obstacleService = obstacleService
    }

    // Validate that the game route exists
    async validateGameRouteExists(id) {
        const routeResult = await toResult(this.gameRouteRepository.findById(id));
        const route = handleResult(routeResult, null, 404);

        if (!route) {
            throw createError("Game route does not exist", 404);
        }

        return route;
    }

    /**
     *
     * @param mapId {String} MapId for searching on DB
     * @returns {Promise<MyMap>} Promise about a string matriz that represents the map state
     */
    // Validate start and end coordinates
    // Todo: Voy a cambiar esto para que solo devuelva el mapa si este existe de la logica de comparacion
    async getMap(mapId) {
        const mapResult = await toResult(this.mapRepository.findById(mapId));
        const existingMap = handleResult(mapResult, "Map does not exist", 404);

        if (!existingMap || !existingMap.dimensions) {
            throw createError("Map does not exist or is invalid", 404);
        }

        const myMap = new MyMap(mapResult)

        await myMap.findObstacles(this.obstacleRepository)

        return myMap

        // if (!validateDimensions(existingMap.dimensions, [start, end])) {
        //   throw createError("Route coordinates exceed the map dimensions", 400);
        // }

        // await validatePositionNotOccupied([start, end], mapId);
    }

    /**
     *
     * @param gameRouteInitialData {{
     *   "mapId": string,
     *   "start": {
     *     "x": number,
     *     "y": number
     *   },
     *   "end": {
     *     "x": number,
     *     "y": number
     *   },
     *   "distance": number
     * }}
     * @param map
     * @returns boolean
     */
    validateMap(gameRouteInitialData, map) {
        let isMapCorrect = false


        return isMapCorrect
    }

    async createGameRoute(gameRouteData) {
        const {mapId, start, end} = gameRouteData;

        // const map = await toResult(this.mapRepository.findById(mapId));

        const map = await this.getMap(mapId);

        if (!map.applyRoute(gameRouteData))
            throw new Error("La ruta no se pudo aplicar, es erronea")


        const route = map.findRoute()

        const response = this.gameRouteRepository.create({
            mapId: gameRouteData.mapId,
            start: gameRouteData.start,
            end: gameRouteData.end,
            route: route
        })
        console.log(response.value)

        return response.value

        // console.log(map.toString())

        // const isMapCorrect = this.validateMap(gameRouteData, map)

        /*// Attempt to create the game route
        let routeResult;
        try {
          routeResult = await this.gameRouteRepository.create(gameRouteData);
        } catch (error) {
          console.error("Error creating game route:", error);
          throw createError("Error creating game route", 500);
        }

        if (!routeResult) {
          console.error("Error: routeResult is undefined or null");
          throw createError("Error creating game route", 500);
        }*/

        // Return the created route if everything went well
        // return routeResult;
    }

    async getGameRoutesByMapId(mapId) {
        // Validate that the map exists
        const mapResult = await toResult(this.mapRepository.findById(mapId));
        const map = handleResult(mapResult, "Map not found", 404);

        // If the map does not exist, throw an error
        if (!map) {
            throw new Error("Map not found");
        }

        // Retrieve the routes associated with the map
        const routesResult = await toResult(
            this.gameRouteRepository.findByMapId(mapId)
        );
        return handleResult(routesResult, "Error fetching game routes", 500);
    }

    async getGameRouteById(id) {
        return await this.validateGameRouteExists(id);
    }

    // Update a game route by ID
    async updateGameRouteById(id, updateData) {
        const {start, end} = updateData;
        const gameRoute = await this.validateGameRouteExists(id);
        await this.validateStartEndPositions(gameRoute.mapId, start, end);

        const updateResult = await toResult(
            this.gameRouteRepository.updateById(id, updateData)
        );
        return handleResult(updateResult, "Game route does not exist", 404);
    }

    // Delete a game route by ID
    async deleteGameRouteById(id) {
        const route = await this.validateGameRouteExists(id);
        if (!route) {
            throw createError("Game route does not exist", 404);
        }

        const deleteResult = await toResult(
            this.gameRouteRepository.deleteById(id)
        );
        return handleResult(deleteResult, "Error deleting game route", 500);
    }
}

export default GameRouteService;
