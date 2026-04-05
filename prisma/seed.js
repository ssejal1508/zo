/**
 * Seed script — populates the database with demo data.
 *
 * Run via:  node prisma/seed.js
 *           OR  npm run db:seed
 *
 * Creates:
 *   - 1 Admin user
 *   - 1 Analyst user
 *   - 2 Viewer users
 *   - 30 financial records spread across categories and months
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ── seed data ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Rent",
  "Utilities",
  "Groceries",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Education",
];

const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment"];
const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Groceries",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Education",
];

const NOTES = [
  "Monthly payment",
  "Q1 transfer",
  "Recurring entry",
  "Year-end adjustment",
  "One-time expense",
  "Client payment",
  "Auto-debit",
  null,
];

async function main() {
  console.log("🌱  Starting seed...\n");

  // ── Clear existing data ───────────────────────────────────────────────────
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅  Cleared existing data");

  // ── Users ─────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);

  const adminHash    = await bcrypt.hash("Admin@123",    salt);
  const analystHash  = await bcrypt.hash("Analyst@123",  salt);
  const viewer1Hash  = await bcrypt.hash("Viewer@123",   salt);
  const viewer2Hash  = await bcrypt.hash("Viewer@123",   salt);

  const admin = await prisma.user.create({
    data: {
      email:        "admin@finance.dev",
      name:         "Alice Admin",
      passwordHash: adminHash,
      role:         "ADMIN",
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email:        "analyst@finance.dev",
      name:         "Bob Analyst",
      passwordHash: analystHash,
      role:         "ANALYST",
    },
  });

  await prisma.user.create({
    data: {
      email:        "viewer1@finance.dev",
      name:         "Carol Viewer",
      passwordHash: viewer1Hash,
      role:         "VIEWER",
    },
  });

  await prisma.user.create({
    data: {
      email:        "viewer2@finance.dev",
      name:         "Dave Viewer",
      passwordHash: viewer2Hash,
      role:         "VIEWER",
      isActive:     false, // inactive user for testing
    },
  });

  console.log("✅  Created 4 users (1 Admin, 1 Analyst, 2 Viewers)");

  // ── Financial Records ─────────────────────────────────────────────────────
  const records = [];

  // Spread records over last 90 days
  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.45;
    const category = isIncome
      ? randomItem(INCOME_CATEGORIES)
      : randomItem(EXPENSE_CATEGORIES);

    const amount = isIncome
      ? randomBetween(500, 15000)
      : randomBetween(50, 5000);

    records.push({
      amount,
      type:        isIncome ? "INCOME" : "EXPENSE",
      category,
      date:        daysAgo(Math.floor(Math.random() * 90)),
      notes:       randomItem(NOTES),
      createdById: i % 3 === 0 ? analyst.id : admin.id,
    });
  }

  // Always include some fixed records for predictable test assertions
  records.push(
    {
      amount: 5000,
      type: "INCOME",
      category: "Salary",
      date: daysAgo(5),
      notes: "Fixed monthly salary",
      createdById: admin.id,
    },
    {
      amount: 1200,
      type: "EXPENSE",
      category: "Rent",
      date: daysAgo(3),
      notes: "Monthly rent payment",
      createdById: admin.id,
    },
    {
      amount: 800,
      type: "EXPENSE",
      category: "Groceries",
      date: daysAgo(1),
      notes: "Weekly grocery run",
      createdById: admin.id,
    },
    {
      amount: 300,
      type: "INCOME",
      category: "Freelance",
      date: daysAgo(7),
      notes: "Freelance project payment",
      createdById: analyst.id,
    }
  );

  await prisma.financialRecord.createMany({ data: records });
  console.log(`✅  Created ${records.length} financial records`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n📋  Demo credentials:");
  console.log("──────────────────────────────────────────");
  console.log("  Role    │  Email                  │  Password");
  console.log("──────────────────────────────────────────");
  console.log("  Admin   │  admin@finance.dev       │  Admin@123");
  console.log("  Analyst │  analyst@finance.dev     │  Analyst@123");
  console.log("  Viewer  │  viewer1@finance.dev     │  Viewer@123");
  console.log("──────────────────────────────────────────\n");
  console.log("🚀  Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
