require("dotenv").config();
const app = require("./src/app");
const prisma = require("./src/prisma");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test DB Connection
    await prisma.$connect();
    console.log("🟢 Connected to SQLite database successfully.");

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`🩺 Health check URL: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error("🔴 Failed to start server:");
    console.error(error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🛑 Gracefully shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Gracefully shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
