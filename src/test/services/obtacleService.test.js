import ObstacleService from '../../services/obstacleService';
import { jest } from '@jest/globals';

describe('ObstacleService', () => {
  let obstacleRepository;
  let obstacleService;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    obstacleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn()
    };
    
    obstacleService = new ObstacleService(obstacleRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should create a new obstacle successfully', async () => {
    const obstacleData = { width: 10, height: 10 };
    obstacleRepository.create.mockResolvedValue(obstacleData);
    
    const result = await obstacleService.createObstacle(obstacleData);
    expect(result).toEqual(obstacleData);
  });

  test('should not create an obstacle with invalid dimensions', async () => {
    const obstacleData = { width: 0, height: 0 };
    await expect(obstacleService.createObstacle(obstacleData)).rejects.toThrow("Invalid obstacle dimensions");
  });

  test('should return all obstacles', async () => {
    const obstacles = [{ id: 1, width: 10, height: 10 }];
    obstacleRepository.findAll.mockResolvedValue(obstacles);
    
    const result = await obstacleService.getObstacles();
    expect(result).toEqual(obstacles);
  });

  test('should get an obstacle by ID', async () => {
    const obstacle = { id: 1, width: 10, height: 10 };
    obstacleRepository.findById.mockResolvedValue(obstacle);
    
    const result = await obstacleService.getObstacleById(1);
    expect(result).toEqual(obstacle);
  });

  test('should update an obstacle by ID', async () => {
    const updatedObstacle = { id: 1, width: 20, height: 20 };
    obstacleRepository.updateById.mockResolvedValue(updatedObstacle);
    
    const result = await obstacleService.updateObstacleById(1, updatedObstacle);
    expect(result).toEqual(updatedObstacle);
  });

  test('should delete an obstacle by ID', async () => {
    obstacleRepository.deleteById.mockResolvedValue(true);
    
    const result = await obstacleService.deleteObstacle(1);
    expect(result).toEqual({ message: "Obstacle successfully deleted" });
  });
});
