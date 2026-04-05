const prisma = require("../prisma");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

/**
 * Financial Records Service
 * Handles CRUD, filtering, pagination, and soft-delete for financial records.
 */

const RECORD_SELECT = {
  id:        true,
  amount:    true,
  type:      true,
  category:  true,
  date:      true,
  notes:     true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
};

/**
 * List records with filtering, search, pagination, and sorting.
 *
 * VIEWER role: only sees records they created.
 * ANALYST / ADMIN: see all records.
 */
async function listRecords(query, requestingUser) {
  const {
    type,
    category,
    startDate,
    endDate,
    search,
    page,
    limit,
    sortBy,
    sortOrder,
  } = query;

  const where = { isDeleted: false };

  // Role-based row filtering
  if (requestingUser.role === "VIEWER") {
    where.createdById = requestingUser.id;
  }

  if (type)     where.type     = type;
  if (category) where.category = { contains: category };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate)   where.date.lte = new Date(endDate);
  }

  // Full-text search on category and notes
  if (search) {
    where.OR = [
      { category: { contains: search } },
      { notes:    { contains: search } },
    ];
  }

  const [total, records] = await Promise.all([
    prisma.financialRecord.count({ where }),
    prisma.financialRecord.findMany({
      where,
      select:  RECORD_SELECT,
      orderBy: { [sortBy]: sortOrder },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ]);

  return {
    records,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

async function getRecordById(id, requestingUser) {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    select: RECORD_SELECT,
  });

  if (!record) throw new NotFoundError(`Financial record with id "${id}" not found.`);

  // VIEWER can only see their own records
  if (requestingUser.role === "VIEWER" && record.createdBy.id !== requestingUser.id) {
    throw new ForbiddenError("You do not have access to this record.");
  }

  return record;
}

async function createRecord(data, requestingUser) {
  return prisma.financialRecord.create({
    data: {
      ...data,
      date:        new Date(data.date),
      createdById: requestingUser.id,
    },
    select: RECORD_SELECT,
  });
}

async function updateRecord(id, data, requestingUser) {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) throw new NotFoundError(`Financial record with id "${id}" not found.`);

  const updateData = { ...data };
  if (data.date) updateData.date = new Date(data.date);

  return prisma.financialRecord.update({
    where:  { id },
    data:   updateData,
    select: RECORD_SELECT,
  });
}

/**
 * Soft-delete a record (sets isDeleted = true).
 * The record is never permanently removed from the DB.
 */
async function deleteRecord(id) {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) throw new NotFoundError(`Financial record with id "${id}" not found.`);

  await prisma.financialRecord.update({
    where: { id },
    data:  { isDeleted: true },
  });

  return { id, deleted: true };
}

module.exports = { listRecords, getRecordById, createRecord, updateRecord, deleteRecord };
