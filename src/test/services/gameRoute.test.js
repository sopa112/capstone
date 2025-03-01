import { Types } from 'mongoose';
import GameRouteService from '../../services/gameRouteService.js';
import { createError, validateDimensions, validatePositionNotOccupied } from '../../utils/validation.js';

// Mock dependencies
const mockGameRouteRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByMapId: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
};

const mockMapRepository = {
  findById: jest.fn(),
};

// Mock database queries
jest.mock("../../models/obstacleModel.js");
jest.mock("../../models/gameRouteModel.js");
jest.mock("../../models/waitPointModel.js");

import Obstacle from "../../models/obstacleModel.js";
import GameRoute from "../../models/gameRouteModel.js";
import WaitPoint from "../../models/waitPointModel.js";

describe('GameRouteService', () => {
  let gameRouteService;
  const validMapId = new Types.ObjectId().toString();
  const validRouteId = new Types.ObjectId().toString();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    gameRouteService = new GameRouteService(mockGameRouteRepository, mockMapRepository);

    // Configure default mock behavior
    Obstacle.find.mockResolvedValue([]); // No obstacles
    GameRoute.find.mockResolvedValue([]); // No game routes
    WaitPoint.find.mockResolvedValue([]); // No wait points
    
    // Default map exists with valid dimensions
    mockMapRepository.findById.mockResolvedValue({
      id: validMapId,
      dimensions: { width: 10, height: 10 },
    });
  });

  describe('createGameRoute', () => {
    test('should throw an error if position validation fails', async () => {
      const gameRouteData = {
        mapId: validMapId,
        start: { x: 1, y: 1 },
        end: { x: 2, y: 2 },
      };

      // Simulate error in validateStartEndPositions
      jest.spyOn(gameRouteService, 'validateStartEndPositions').mockRejectedValue(
        new Error("Validation error")
      );

      await expect(gameRouteService.createGameRoute(gameRouteData)).rejects.toThrow(
        "Validation error"
      );
      expect(gameRouteService.validateStartEndPositions).toHaveBeenCalledWith(
        validMapId, 
        gameRouteData.start, 
        gameRouteData.end
      );
      expect(mockGameRouteRepository.create).not.toHaveBeenCalled();
    });

    test('should successfully create a game route when all validations pass', async () => {
      const gameRouteData = {
        mapId: validMapId,
        start: { x: 1, y: 1 },
        end: { x: 8, y: 8 },
      };

      // Simulate successful validation
      jest.spyOn(gameRouteService, 'validateStartEndPositions').mockResolvedValue(true);
      
      // Mock successful route creation
      const createdRoute = { 
        id: validRouteId,
        ...gameRouteData 
      };
      mockGameRouteRepository.create.mockResolvedValue(createdRoute);

      const result = await gameRouteService.createGameRoute(gameRouteData);

      expect(gameRouteService.validateStartEndPositions).toHaveBeenCalledWith(
        validMapId, 
        gameRouteData.start, 
        gameRouteData.end
      );
      expect(mockGameRouteRepository.create).toHaveBeenCalledWith(gameRouteData);
      expect(result).toEqual(createdRoute);
    });
  });

  describe('validateStartEndPositions', () => {
    test('should throw an error if map does not exist', async () => {
      mockMapRepository.findById.mockResolvedValue(null);

      await expect(
        gameRouteService.validateStartEndPositions(
          validMapId,
          { x: 1, y: 1 },
          { x: 2, y: 2 }
        )
      ).rejects.toThrow("Map does not exist or is invalid");
      
      expect(mockMapRepository.findById).toHaveBeenCalledWith(validMapId);
    });

    test('should throw an error if positions are outside map dimensions', async () => {
      // Spy on validateDimensions to simulate failure
      jest.spyOn(require('../../utils/validation.js'), 'validateDimensions').mockImplementation(() => {
        throw new Error("Position is outside map dimensions");
      });

      await expect(
        gameRouteService.validateStartEndPositions(
          validMapId,
          { x: 15, y: 15 }, // Outside the 10x10 map
          { x: 2, y: 2 }
        )
      ).rejects.toThrow("Position is outside map dimensions");
    });


    test('should throw an error if end position is occupied', async () => {
      // Mock wait points at the end position
      WaitPoint.find.mockResolvedValue([{ position: { x: 2, y: 2 } }]);

      await expect(
        gameRouteService.validateStartEndPositions(
          validMapId,
          { x: 1, y: 1 },
          { x: 2, y: 2 }
        )
      ).rejects.toThrow("The position (2, 2) is occupied by a wait point.");
    });


  });

  describe('getGameRoutesByMapId', () => {
    test('should throw an error if map does not exist', async () => {
      mockMapRepository.findById.mockResolvedValue(null);

      await expect(gameRouteService.getGameRoutesByMapId(validMapId)).rejects.toThrow(
        "Map not found"
      );
      
      expect(mockMapRepository.findById).toHaveBeenCalledWith(validMapId);
    });

    test('should throw an error if repository fails to fetch routes', async () => {
      mockGameRouteRepository.findByMapId.mockRejectedValue(new Error("Database error"));

      await expect(gameRouteService.getGameRoutesByMapId(validMapId)).rejects.toThrow(
        "Error fetching game routes"
      );
      
      expect(mockGameRouteRepository.findByMapId).toHaveBeenCalledWith(validMapId);
    });

    test('should return empty array when no routes exist', async () => {
      mockGameRouteRepository.findByMapId.mockResolvedValue([]);

      const result = await gameRouteService.getGameRoutesByMapId(validMapId);
      
      expect(result).toEqual([]);
      expect(mockGameRouteRepository.findByMapId).toHaveBeenCalledWith(validMapId);
    });

    test('should return game routes when they exist', async () => {
      const mockRoutes = [
        { id: new Types.ObjectId().toString(), mapId: validMapId, start: { x: 1, y: 1 }, end: { x: 2, y: 2 } },
        { id: new Types.ObjectId().toString(), mapId: validMapId, start: { x: 3, y: 3 }, end: { x: 4, y: 4 } }
      ];
      mockGameRouteRepository.findByMapId.mockResolvedValue(mockRoutes);

      const result = await gameRouteService.getGameRoutesByMapId(validMapId);
      
      expect(result).toEqual(mockRoutes);
      expect(mockGameRouteRepository.findByMapId).toHaveBeenCalledWith(validMapId);
    });
  });

  describe('updateGameRouteById', () => {
    const updateData = { start: { x: 3, y: 3 }, end: { x: 4, y: 4 } };

    test('should throw an error if route does not exist', async () => {
      mockGameRouteRepository.findById.mockResolvedValue(null);

      await expect(gameRouteService.updateGameRouteById(validRouteId, updateData)).rejects.toThrow(
        "Game route does not exist"
      );
      
      expect(mockGameRouteRepository.findById).toHaveBeenCalledWith(validRouteId);
    });

    test('should validate positions when updating start/end', async () => {
      // Mock existing route
      mockGameRouteRepository.findById.mockResolvedValue({ 
        id: validRouteId, 
        mapId: validMapId,
        start: { x: 1, y: 1 },
        end: { x: 2, y: 2 }
      });

      // Spy on validateStartEndPositions
      jest.spyOn(gameRouteService, 'validateStartEndPositions').mockResolvedValue(true);
      
      // Mock successful update
      mockGameRouteRepository.updateById.mockResolvedValue({
        id: validRouteId,
        mapId: validMapId,
        ...updateData
      });

      const result = await gameRouteService.updateGameRouteById(validRouteId, updateData);
      
      expect(gameRouteService.validateStartEndPositions).toHaveBeenCalledWith(
        validMapId,
        updateData.start,
        updateData.end
      );
      expect(mockGameRouteRepository.updateById).toHaveBeenCalledWith(validRouteId, updateData);
      expect(result.start).toEqual(updateData.start);
      expect(result.end).toEqual(updateData.end);
    });


    });



  describe('deleteGameRouteById', () => {
    test('should throw an error if route does not exist', async () => {
      mockGameRouteRepository.findById.mockResolvedValue(null);

      await expect(gameRouteService.deleteGameRouteById(validRouteId)).rejects.toThrow(
        "Game route does not exist"
      );
      
      expect(mockGameRouteRepository.findById).toHaveBeenCalledWith(validRouteId);
    });

    test('should successfully delete an existing route', async () => {
      // Mock existing route
      mockGameRouteRepository.findById.mockResolvedValue({ 
        id: validRouteId, 
        mapId: validMapId
      });
      
      mockGameRouteRepository.deleteById.mockResolvedValue(true);

      const result = await gameRouteService.deleteGameRouteById(validRouteId);
      
      expect(mockGameRouteRepository.deleteById).toHaveBeenCalledWith(validRouteId);
      expect(result).toBe(true);
    });

    test('should throw an error if deletion fails in repository', async () => {
      // Mock existing route
      mockGameRouteRepository.findById.mockResolvedValue({ 
        id: validRouteId, 
        mapId: validMapId
      });
      
      // Simulate repository error
      mockGameRouteRepository.deleteById.mockRejectedValue(new Error("Database error"));

      await expect(gameRouteService.deleteGameRouteById(validRouteId)).rejects.toThrow(
        "Error deleting game route"
      );
    });
  });
});