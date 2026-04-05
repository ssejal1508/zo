const { z } = require("zod");

const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
  role: z
    .enum(["VIEWER", "ANALYST", "ADMIN"], {
      errorMap: () => ({ message: "Role must be VIEWER, ANALYST, or ADMIN" }),
    })
    .optional()
    .default("VIEWER"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  password: z.string({ required_error: "Password is required" }),
});

module.exports = { registerSchema, loginSchema };
