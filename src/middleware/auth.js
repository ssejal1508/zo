const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { UnauthorizedError } = require("../utils/errors");

/**
 * JWT Authentication Middleware.
 *
 * Expects: Authorization: Bearer <token>
 *
 * On success, attaches req.user = { id, email, name, role, isActive }
 * On failure, throws UnauthorizedError (caught by global handler).
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided. Use: Authorization: Bearer <token>");
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError("Token has expired. Please log in again.");
      }
      throw new UnauthorizedError("Invalid token.");
    }

    // Fetch fresh user from DB to check isActive & current role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedError("User associated with this token no longer exists.");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Contact an administrator.");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
