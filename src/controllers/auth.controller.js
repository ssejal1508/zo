const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { success } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

async function register(req, res, next) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid registration data", parseResult.error.format());
    }

    const { user, token } = await authService.register(parseResult.data);
    return success(res, { status: 201, message: "User registered successfully", data: { user, token } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid login payload", parseResult.error.format());
    }

    const { user, token } = await authService.login(parseResult.data);
    return success(res, { message: "Login successful", data: { user, token } });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
