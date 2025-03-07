import { createError } from "../utils/error.js";
import {
  validateDimensions,
  validatePositionNotOccupied,
} from "../utils/validation.js";
import { toResult, handleResult } from "../utils/resultUtils.js";
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

  this.getF = function() {
    return this.h + this.g
  }

  this.setH = function(h) {
    this.h = h
    return this
  }

  this.setG = function (g) {
    this.g = g
    return this
  }
  this.getG = function() {
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



  constructor(map) {
    this.map = map
    console.log("Dimensions: ", map.value.dimensions)

    this.dimensions = map.value.dimensions
  }

  /**
   *
   * @param gameRouteData
   * @return boolean
   */
  applyRoute(gameRouteData) {
    const {start, end} = gameRouteData
    let isOk = true

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

    console.log("Start:", this.start.x,  this.start.y)
    matriz[this.start.x][this.start.y] = new Cell(new Position(this.start.x, this.start.y), "S")

    console.log("End:", this.end.x,  this.end.y)
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
    const matriz = this.getMatriz()



    /** @type Cell[] */
    const closedList = []

    /** @type Cell[] */
    const openList = []

    const start = matriz[this.start.x][this.start.y]
    const end = matriz[this.end.x][this.end.y]

    openList.push(start)

    while (openList.length) {
      /**@type {Cell | undefined}*/
      let actualNode

      for (const element of openList) {

        if (actualNode === undefined || element.getF() < actualNode.getF()) {
          actualNode = element
        }
      }

      console.log("actualNode", actualNode)

      if (actualNode) {
        closedList.push(actualNode)
        openList.splice(openList.indexOf(actualNode), 1)
        // console.log(closedList.length)
        // console.log(openList.length)

        if (actualNode.position === end.position) {
          // console.log("Es el nodo final")
          break
        }
      }


      // console.log("ActualNode", actualNode)

      // sleep

      const left = new Position(actualNode.position.x-1, actualNode.position.y)
      const right = new Position(actualNode.position.x+1, actualNode.position.y)
      const up = new Position(actualNode.position.x, actualNode.position.y-1)
      const down = new Position(actualNode.position.x, actualNode.position.y+1)

      /**@type{Cell[]}*/
      const neighborhood = []
      if (left.x >= 0 && left.x < this.dimensions.width && left.y >= 0 && left.y < this.dimensions.height)
        neighborhood.push(matriz[left.x][left.y])
      if (right.x >= 0 && right.x < this.dimensions.width && right.y >= 0 && right.y < this.dimensions.height)
        neighborhood.push(matriz[right.x][right.y])
      if (up.x >= 0 && up.x < this.dimensions.width && up.y >= 0 && up.y < this.dimensions.height)
        neighborhood.push(matriz[up.x][up.y])
      if (down.x >= 0 && down.x < this.dimensions.width && down.y >= 0 && down.y < this.dimensions.height)
        neighborhood.push(matriz[down.x][down.y])

      // console.log(neighborhood)

      for (let i=0; i<neighborhood.length; i++) {
        // console.log("interacting")
        if (closedList.includes(neighborhood[i]) || neighborhood[i].type === "X") {
          // console.log(closedList.includes(neighborhood[i]), neighborhood[i].type === "X")
          // console.log("closedLisd", closedList)
          // console.log("closedList includes", neighborhood[i])
          // console.log(closedList)
          continue
        }


        // console.log(neighborhood[i])
        neighborhood[i].setG(actualNode.getG() + Math.hypot(
            neighborhood[i].position.x - actualNode.position.x,
            neighborhood[i].position.y - actualNode.position.y
        ))
        neighborhood[i].setH(Math.hypot(
            end.position.x - neighborhood[i].position.x,
            end.position.y - neighborhood[i].position.y)
        )
        // console.log('end', end)
        // console.log(neighborhood[i])

        let onOpenList, item
        // console.log("openList", openList)
        for (const index in openList) {
          if (openList[index].position === neighborhood[i].position)
            onOpenList = true
            item = openList[index].position

        }

        if (onOpenList) {
          if (neighborhood[i].g > item.g)
            continue
        }

        openList.push(neighborhood[i])
      }



    }

    /*let counter = 0

    function Cell(position) {
      this.position = position
      /!** @type {number} *!/
      this.distance = Math.hypot(end.x-this.position.x, end.y-this.position.y+1)

      this.isOut = position.x < 0 || position.x >= dimensions.width || position.y < 0 || position.y >= dimensions.height
      console.log(position.x < 0, position.x >= dimensions.width, position.y < 0, position.y >= dimensions.height)
      console.log(this.isOut, this.position)

      /!** @type {{x: number, y: number}[]} *!/
      let next = []

      if (!this.isOut && counter<20) {
        next[0] = {x:this.position.x, y:this.position.y-1}
        next[1] = {x:this.position.x+1, y:this.position.y}
        next[2] = {x:this.position.x, y:this.position.y+1}
        next[3] = {x:this.position.x-1, y:this.position.y}
      }

      for (let i = next.length-1; i >= 0; i--) {
        if (next[i].isOut) {
          next.splice(i, 1)8
        }
      }

      for (let i = 0; i<4; i++) {
        for (let j = i+1; j<4; j++) {
          if (next[i].distance > next[j].distance) {
            const c = next[i]
            next[i] = next[j]
            next[j] = c
          }
        }
      }

      console.log(next)

      // next[0] = {
      //   x:this.position.x,
      //   y:this.position.y+1,
      //   distance:Math.hypot(end.x-this.position.x, end.y-this.position.y+1)
      // }

      // console.log(next)
      counter ++
    }*/

    // const cell = new Cell(actual)
  }

  toString() {
    const matriz = this.getMatriz()



    let result = ""

    for (let i = 0; i < matriz[0].length; i++) {
      if (i > 0) result+="\n"

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

    const myMap =  new MyMap(mapResult)

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
    const { mapId, start, end } = gameRouteData;

    // const map = await toResult(this.mapRepository.findById(mapId));

    const map = await this.getMap(mapId);

    if (!map.applyRoute(gameRouteData))
      throw new Error("La ruta no se pudo aplicar, es erronea")


    map.findRoute()

    console.log(map.toString())

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
    const { start, end } = updateData;
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
