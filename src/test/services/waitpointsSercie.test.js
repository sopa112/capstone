import WaitPointService from '../../services/waitPointService';
import { jest } from '@jest/globals';

describe('WaitPointService', () => {
  let waitPointRepository;
  let mapRepository;
  let waitPointService;

  beforeEach(() => {
    waitPointRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn()
    };

    mapRepository = {
      findById: jest.fn()
    };

    waitPointService = new WaitPointService(waitPointRepository, mapRepository);
  });

  test('should create a wait point successfully', async () => {
    const mapData = { _id: '123', dimensions: { width: 10, height: 10 } };
    const waitPointData = { mapId: '123', x: 5, y: 5 };
    
    mapRepository.findById.mockResolvedValue(mapData);
    waitPointRepository.create.mockResolvedValue({ ...waitPointData, _id: '456' });

    const result = await waitPointService.createWaitPoint(waitPointData);
    expect(result.x).toEqual(waitPointData.x);
    expect(result.y).toEqual(waitPointData.y);
    expect(result.mapId).toEqual(waitPointData.mapId);
  });

  test('should not create a wait point with invalid coordinates', async () => {
    const mapData = { _id: '123', dimensions: { width: 10, height: 10 } };
    const waitPointData = { mapId: '123', x: 15, y: 15 };
    
    mapRepository.findById.mockResolvedValue(mapData);

    await expect(waitPointService.createWaitPoint(waitPointData))
      .rejects.toThrow("The wait point coordinates exceed the dimensions of the map.");
  });

  test('should get wait points by map ID', async () => {
    const mapData = { _id: '123', dimensions: { width: 10, height: 10 } };
    const waitPoints = [
      { _id: '456', mapId: '123', x: 5, y: 5 },
      { _id: '789', mapId: '123', x: 7, y: 7 }
    ];

    mapRepository.findById.mockResolvedValue(mapData);
    waitPointRepository.find.mockResolvedValue(waitPoints);

    const result = await waitPointService.getWaitPointsByMapId('123');
    expect(result).toEqual(waitPoints);
  });

  test('should get all wait points', async () => {
    const waitPoints = [
      { _id: '456', mapId: '123', x: 5, y: 5 },
      { _id: '789', mapId: '124', x: 7, y: 7 }
    ];

    waitPointRepository.findAll.mockResolvedValue(waitPoints);
    
    const result = await waitPointService.getAllPoints();
    expect(result).toEqual(waitPoints);
  });

  test('should update wait point successfully', async () => {
    const mapData = { _id: '123', dimensions: { width: 10, height: 10 } };
    const existingWaitPoint = { _id: '456', mapId: '123', x: 5, y: 5 };
    const updateData = { x: 7, y: 7 };
    const updatedWaitPoint = { ...existingWaitPoint, ...updateData };

    mapRepository.findById.mockResolvedValue(mapData);
    waitPointRepository.findById.mockResolvedValue(existingWaitPoint);
    waitPointRepository.updateById.mockResolvedValue(updatedWaitPoint);

    const result = await waitPointService.updateWaitPoint('456', updateData);
    expect(result).toEqual(updatedWaitPoint);
  });

  test('should delete wait point successfully', async () => {
    waitPointRepository.deleteById.mockResolvedValue(true);
    
    const result = await waitPointService.deleteWaitPoint('456');
    expect(result).toEqual({ message: "Wait point successfully deleted" });
  });


});