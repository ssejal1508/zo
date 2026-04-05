const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { ConflictError, UnauthorizedError } = require("../utils/errors");

/**
 * Auth Service
 * Handles registration, login, and token generation.
 */

async function register({ email, name, password, role }) {
  // Check if email is already taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError(`Email "${email}" is already registered.`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, name, passwordHash, role },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  const token = signToken(user.id);
  return { user, token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Generic message to avoid user enumeration
    throw new UnauthorizedError("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Your account has been deactivated. Contact an administrator.");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = signToken(user.id);
  return { user: safeUser, token };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = { register, login };
