const usersService = require("../services/users.service");
const { updateUserSchema } = require("../validators/user.validator");
const { success } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

async function listUsers(req, res, next) {
  try {
    const users = await usersService.listUsers();
    return success(res, { data: users });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    return success(res, { data: user });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await usersService.getMe(req.user.id);
    return success(res, { data: user });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid update data", parseResult.error.format());
    }

    const updatedUser = await usersService.updateUser(req.params.id, parseResult.data);
    return success(res, { message: "User updated successfully", data: updatedUser });
  } catch (error) {
    next(error);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const user = await usersService.deactivateUser(req.params.id, req.user.id);
    return success(res, { message: "User deactivated successfully", data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, getUser, getMe, updateUser, deactivateUser };
