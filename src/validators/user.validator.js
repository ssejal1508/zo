const { z } = require("zod");

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  role: z
    .enum(["VIEWER", "ANALYST", "ADMIN"], {
      errorMap: () => ({ message: "Role must be VIEWER, ANALYST, or ADMIN" }),
    })
    .optional(),
  isActive: z.boolean({ invalid_type_error: "isActive must be a boolean" }).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided to update" }
);

module.exports = { updateUserSchema };
