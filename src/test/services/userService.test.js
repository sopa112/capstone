import { Types } from 'mongoose';
import UserService from '../../services/userService.js';
import { createError } from '../../utils/validation.js';
import { toResult, handleResult } from '../../utils/resultUtils.js';

// Mock utils
jest.mock('../../utils/resultUtils.js', () => ({
  toResult: jest.fn(),
  handleResult: jest.fn()
}));

// Mock models
jest.mock('../../models/userModel.js');
jest.mock('../../models/mapModel.js');
jest.mock('../../models/gameRouteModel.js');



// Mock repositories
const mockUserRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
};

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository);

    // Configure default behavior for utility functions
    toResult.mockImplementation(async (promise) => ({
      success: true,
      value: await promise,
      error: null
    }));

    handleResult.mockImplementation((result, errorMessage, statusCode) => {
      if (!result.success || !result.value) {
        throw createError(errorMessage, statusCode);
      }
      return result.value;
    });
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      username: 'testuser',
    };

    test('should create a user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ id: 'user123', ...validUserData });

      const result = await userService.createUser(validUserData);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: validUserData.email });
      expect(mockUserRepository.create).toHaveBeenCalledWith(validUserData);
      expect(result).toEqual({ id: 'user123', ...validUserData });
    });

    test('should throw error for invalid email', async () => {
      const invalidUserData = { ...validUserData, email: 'invalid-email' };

      await expect(userService.createUser(invalidUserData))
        .rejects
        .toThrow('Invalid email.');
    });

    test('should throw error for existing email', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing123', ...validUserData });

      await expect(userService.createUser(validUserData))
        .rejects
        .toThrow('Email is already registered.');
    });
  });

  describe('getAllUsers', () => {
    test('should return all users', async () => {
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com' },
        { id: 'user2', email: 'user2@example.com' }
      ];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    test('should throw error when no users found', async () => {
      mockUserRepository.findAll.mockResolvedValue(null);
      
      // Mock toResult to return a failed result
      toResult.mockImplementation(async () => ({
        success: true,
        value: null,
        error: null
      }));

      await expect(userService.getAllUsers())
        .rejects
        .toThrow('No users found');
    });
  });

  describe('updateUser', () => {
    const userId = new Types.ObjectId().toString();
    const updateData = {
      email: 'updated@example.com',
      username: 'updateduser'
    };

    test('should update user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: userId, email: 'old@example.com' });
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.updateById.mockResolvedValue({ id: userId, ...updateData });

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserRepository.updateById).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual({ id: userId, ...updateData });
    });

    test('should throw error for invalid fields', async () => {
      const invalidUpdateData = {
        email: 'valid@example.com',
        invalidField: 'value'
      };

      await expect(userService.updateUser(userId, invalidUpdateData))
        .rejects
        .toThrow('Not allowed fields: invalidField');
    });

    test('should throw error for duplicate email', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: userId, email: 'old@example.com' });
      mockUserRepository.findOne.mockResolvedValue({ id: 'other123', email: updateData.email });

      await expect(userService.updateUser(userId, updateData))
        .rejects
        .toThrow('Email is already registered.');
    });
  });

  describe('deleteUser', () => {
    const userId = new Types.ObjectId().toString();

    test('should delete user successfully', async () => {
      // Mock successful user find
      toResult.mockImplementationOnce(async () => ({
        success: true,
        value: { id: userId },
        error: null
      }));

      // Mock successful user delete
      toResult.mockImplementationOnce(async () => ({
        success: true,
        value: { id: userId },
        error: null
      }));

      const result = await userService.deleteUser(userId);

      expect(mockUserRepository.deleteById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ message: 'User account successfully deleted.' });
    });

    test('should throw error when user not found', async () => {
      // Mock failed user find
      toResult.mockImplementationOnce(async () => ({
        success: true,
        value: null,
        error: null
      }));

      await expect(userService.deleteUser(userId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('utility methods', () => {
    describe('isValidEmail', () => {
      test('should validate correct email formats', () => {
        expect(userService.isValidEmail('test@example.com')).toBeTruthy();
        expect(userService.isValidEmail('test.user@domain.co.uk')).toBeTruthy();
        expect(userService.isValidEmail('invalid-email')).toBeFalsy();
        expect(userService.isValidEmail('test@.com')).toBeFalsy();
      });
    });

    describe('validateAllowedFields', () => {
      test('should validate allowed fields correctly', () => {
        const validFields = {
          email: 'test@example.com',
          username: 'testuser',
          savedMaps: []
        };

        expect(() => userService.validateAllowedFields(validFields)).not.toThrow();
      });

      test('should throw error for invalid fields', () => {
        const invalidFields = {
          email: 'test@example.com',
          password: 'secret'
        };

        expect(() => userService.validateAllowedFields(invalidFields))
          .toThrow('Not allowed fields: password');
      });
    });
  });
});