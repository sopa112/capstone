import MapService from '../../services/mapService';
import { jest } from '@jest/globals';

describe('MapService', () => {
  let mapRepository;
  let obstacleRepository;
  let mapService;

  beforeEach(() => {
    mapRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn()
    };

    obstacleRepository = {
      create: jest.fn()
    };

    mapService = new MapService(mapRepository, obstacleRepository);
  });

  test('should create a new map successfully', async () => {
    const mapData = { name: 'TestMap', dimensions: { width: 5, height: 5 }, obstacles: [] };
    mapRepository.findOne.mockResolvedValue(null);
    mapRepository.create.mockResolvedValue({ ...mapData, _id: '123' });

    const result = await mapService.createMap(mapData);
    expect(result.name).toEqual(mapData.name);
    expect(result.dimensions).toEqual(mapData.dimensions);
  });

  test('should not create a map with duplicate name', async () => {
    const mapData = { name: 'TestMap', dimensions: { width: 5, height: 5 } };
    mapRepository.findOne.mockResolvedValue(mapData);

    await expect(mapService.createMap(mapData)).rejects.toThrow("Map name already exists");
  });

  test('should not create a map with invalid dimensions', async () => {
    const mapData = { name: 'TestMap', dimensions: { width: 1, height: 1 } };
    await expect(mapService.createMap(mapData)).rejects.toThrow("Invalid map dimensions");
  });

  test('should return all maps', async () => {
    const maps = [{ name: 'TestMap', dimensions: { width: 5, height: 5 } }];
    mapRepository.findAll.mockResolvedValue(maps);
    
    const result = await mapService.getMaps();
    expect(result).toEqual(maps);
  });

  test('should return a map by ID', async () => {
    const map = { _id: '123', name: 'TestMap', dimensions: { width: 5, height: 5 } };
    mapRepository.findById.mockResolvedValue(map);
    
    const result = await mapService.getMapById('123');
    expect(result).toEqual(map);
  });

  test('should update a map by ID', async () => {
    const updatedMap = { _id: '123', name: 'UpdatedMap', dimensions: { width: 10, height: 10 } };
    mapRepository.updateById.mockResolvedValue(updatedMap);
    
    const result = await mapService.updateMapById('123', updatedMap);
    expect(result).toEqual(updatedMap);
  });

  test('should delete a map by ID', async () => {
    mapRepository.deleteById.mockResolvedValue(true);
    
    const result = await mapService.deleteMap('123');
    expect(result).toEqual({ message: "Map successfully deleted" });
  });
});
