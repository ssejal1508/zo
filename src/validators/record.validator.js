const { z } = require("zod");

const createRecordSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be a positive number")
    .max(1_000_000_000, "Amount is unrealistically large"),
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Type must be INCOME or EXPENSE" }),
  }),
  category: z
    .string({ required_error: "Category is required" })
    .min(1, "Category cannot be empty")
    .max(100, "Category cannot exceed 100 characters")
    .trim(),
  date: z
    .string({ required_error: "Date is required" })
    .datetime({ message: "Date must be a valid ISO 8601 datetime string (e.g. 2024-01-15T00:00:00Z)" }),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .trim()
    .nullable()
    .optional(),
});

const updateRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be a positive number")
    .max(1_000_000_000, "Amount is unrealistically large")
    .optional(),
  type: z
    .enum(["INCOME", "EXPENSE"], {
      errorMap: () => ({ message: "Type must be INCOME or EXPENSE" }),
    })
    .optional(),
  category: z
    .string()
    .min(1, "Category cannot be empty")
    .max(100, "Category cannot exceed 100 characters")
    .trim()
    .optional(),
  date: z
    .string()
    .datetime({ message: "Date must be a valid ISO 8601 datetime string" })
    .optional(),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .trim()
    .nullable()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided to update" }
);

// Query params validator for listing records
const listRecordsQuerySchema = z.object({
  type:      z.enum(["INCOME", "EXPENSE"]).optional(),
  category:  z.string().trim().optional(),
  startDate: z.string().datetime({ message: "startDate must be a valid ISO 8601 datetime" }).optional(),
  endDate:   z.string().datetime({ message: "endDate must be a valid ISO 8601 datetime" }).optional(),
  search:    z.string().trim().optional(),
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().positive().max(100).default(10),
  sortBy:    z.enum(["date", "amount", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

module.exports = { createRecordSchema, updateRecordSchema, listRecordsQuerySchema };
