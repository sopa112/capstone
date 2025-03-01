import { createError } from "../utils/error.js";
import { toResult, handleResult } from "../utils/resultUtils.js";

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createUser(userData) {
    try {
      const { email } = userData;

      if (!this.isValidEmail(email)) {
        throw createError("Invalid email.", 400);
      }

      const existingUserResult = await toResult(this.userRepository.findOne({ email }));
      if (existingUserResult.value) {
        throw createError("Email is already registered.", 400);
      }


      const newUserResult = await toResult(this.userRepository.create(userData));
      return handleResult(newUserResult, "Error creating user", 500);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async getAllUsers() {
    const usersResult = await toResult(this.userRepository.findAll());
    return handleResult(usersResult, "No users found", 404);
  }

  async getUserById(userId) {
    const userResult = await toResult(this.userRepository.findById(userId).populate("savedMaps"));
    return handleResult(userResult, "User not found", 404);
  }

  async updateUser(userId, updateData) {
    try {
      this.validateAllowedFields(updateData);

      if (updateData.email) {
        if (!this.isValidEmail(updateData.email)) {
          throw createError("Invalid email.", 400);
        }

        const currentUserResult = await toResult(this.userRepository.findById(userId));
        const currentUser = handleResult(currentUserResult, "User not found", 404);

        if (currentUser.email !== updateData.email) {
          const emailExistsResult = await toResult(this.userRepository.findOne({ email: updateData.email }));
          if (emailExistsResult.value) {
            throw createError("Email is already registered.", 400);
          }
        }
      }

      const updatedUserResult = await toResult(this.userRepository.updateById(userId, updateData));
      return handleResult(updatedUserResult, "User not found", 404);
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }

  async deleteUser(userId) {
    await this.validateUserExists(userId);
    const deleteResult = await toResult(this.userRepository.deleteById(userId));
    handleResult(deleteResult, "User not found", 404);
    return { message: "User account successfully deleted." };
  }

  // Validar existencia del usuario
  async validateUserExists(userId) {
    const userResult = await toResult(this.userRepository.findById(userId));
    return handleResult(userResult, "User not found", 404);
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }

  // Validar campos permitidos
  validateAllowedFields(updateData) {
    const allowedFields = ["email", "username", "savedMaps"];
    const invalidFields = Object.keys(updateData).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      throw createError(`Not allowed fields: ${invalidFields.join(", ")}`, 400);
    }
  }
}

export default UserService;
