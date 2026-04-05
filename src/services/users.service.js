const prisma = require("../prisma");
const { NotFoundError } = require("../utils/errors");

/**
 * Users Service
 * Admin-level user management operations.
 */

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

async function listUsers() {
  return prisma.user.findMany({
    select: USER_SAFE_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...USER_SAFE_SELECT,
      _count: { select: { records: { where: { isDeleted: false } } } },
    },
  });

  if (!user) throw new NotFoundError(`User with id "${id}" not found.`);

  // Flatten count
  const { _count, ...rest } = user;
  return { ...rest, recordCount: _count.records };
}

async function updateUser(id, data) {
  // Ensure user exists first
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`User with id "${id}" not found.`);

  return prisma.user.update({
    where: { id },
    data,
    select: USER_SAFE_SELECT,
  });
}

async function deactivateUser(id, requestingUserId) {
  if (id === requestingUserId) {
    const { ForbiddenError } = require("../utils/errors");
    throw new ForbiddenError("You cannot deactivate your own account.");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`User with id "${id}" not found.`);

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: USER_SAFE_SELECT,
  });
}

async function getMe(id) {
  return getUserById(id);
}

module.exports = { listUsers, getUserById, updateUser, deactivateUser, getMe };
