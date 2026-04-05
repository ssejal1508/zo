const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { error: errorResponseMaker } = require("./utils/response");

// Routers
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const recordsRoutes = require("./routes/records.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true }));

// API Documentation
// Available at http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "Finance API Docs" }));

// Health Check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  // If we're fully crashed or headers already sent, defer to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  // For Zod validation errors format nicely
  let errors = err.errors;
  if (!errors && isDev && statusCode === 500) {
    errors = err.stack;
  }

  // Ensure we do not leak unhandled DB errors in production
  const message = statusCode === 500 && !isDev ? "Internal Server Error" : err.message;

  console.error(`[Error] ${req.method} ${req.url} -> ${statusCode}: ${err.message}`);

  errorResponseMaker(res, { status: statusCode, message, errors });
});

module.exports = app;
