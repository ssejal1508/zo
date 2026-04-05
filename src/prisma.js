const { PrismaClient } = require("@prisma/client");

// Singleton pattern — reuse the same Prisma client across the app.
// This avoids exhausting the connection pool in development with hot-reload.
let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

prisma = global.__prisma;

module.exports = prisma;
