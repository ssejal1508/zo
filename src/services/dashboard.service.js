const prisma = require("../prisma");

/**
 * Dashboard Service
 * Provides aggregated analytics, trends, and summary data.
 * All queries exclude soft-deleted records.
 */

const BASE_WHERE = { isDeleted: false };

// ── Summary (all roles) ───────────────────────────────────────────────────────

/**
 * Returns total income, total expenses, and net balance.
 * VIEWER sees only their own records; ANALYST/ADMIN see all.
 */
async function getSummary(requestingUser) {
  const where = { ...BASE_WHERE };
  if (requestingUser.role === "VIEWER") {
    where.createdById = requestingUser.id;
  }

  const [incomeResult, expenseResult, recordCount] = await Promise.all([
    prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { ...where, type: "INCOME" },
    }),
    prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { ...where, type: "EXPENSE" },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  const totalIncome   = incomeResult._sum.amount  ?? 0;
  const totalExpenses = expenseResult._sum.amount ?? 0;
  const netBalance    = totalIncome - totalExpenses;

  return {
    totalIncome:   round2(totalIncome),
    totalExpenses: round2(totalExpenses),
    netBalance:    round2(netBalance),
    recordCount,
    balanceStatus: netBalance >= 0 ? "SURPLUS" : "DEFICIT",
  };
}

// ── Recent Activity (all roles) ───────────────────────────────────────────────

async function getRecentActivity(requestingUser, limit = 10) {
  const where = { ...BASE_WHERE };
  if (requestingUser.role === "VIEWER") {
    where.createdById = requestingUser.id;
  }

  return prisma.financialRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
    select: {
      id:       true,
      amount:   true,
      type:     true,
      category: true,
      date:     true,
      notes:    true,
      createdAt: true,
      createdBy: { select: { id: true, name: true } },
    },
  });
}

// ── Category Breakdown (ANALYST+) ─────────────────────────────────────────────

async function getCategoryBreakdown() {
  const records = await prisma.financialRecord.groupBy({
    by:      ["category", "type"],
    _sum:    { amount: true },
    _count:  { id: true },
    where:   BASE_WHERE,
    orderBy: { _sum: { amount: "desc" } },
  });

  // Restructure into categories map
  const categoriesMap = {};
  for (const row of records) {
    if (!categoriesMap[row.category]) {
      categoriesMap[row.category] = { category: row.category, income: 0, expense: 0, total: 0, count: 0 };
    }
    const entry = categoriesMap[row.category];
    const amount = round2(row._sum.amount ?? 0);

    if (row.type === "INCOME") {
      entry.income += amount;
    } else {
      entry.expense += amount;
    }
    entry.total = round2(entry.income - entry.expense);
    entry.count += row._count.id;
  }

  return Object.values(categoriesMap).sort((a, b) => b.expense - a.expense);
}

// ── Monthly / Weekly Trends (ANALYST+) ───────────────────────────────────────

async function getTrends(period = "monthly") {
  // Fetch last 12 months (or 12 weeks) of non-deleted records
  const cutoffDate = new Date();
  if (period === "weekly") {
    cutoffDate.setDate(cutoffDate.getDate() - 84); // 12 weeks
  } else {
    cutoffDate.setMonth(cutoffDate.getMonth() - 12); // 12 months
  }

  const records = await prisma.financialRecord.findMany({
    where: { ...BASE_WHERE, date: { gte: cutoffDate } },
    select: { amount: true, type: true, date: true },
    orderBy: { date: "asc" },
  });

  // Bucket records by period key
  const buckets = {};
  for (const r of records) {
    const key = period === "weekly"
      ? getWeekKey(r.date)
      : getMonthKey(r.date);

    if (!buckets[key]) {
      buckets[key] = { period: key, income: 0, expense: 0, net: 0, count: 0 };
    }
    const amount = round2(r.amount);
    if (r.type === "INCOME") buckets[key].income  = round2(buckets[key].income  + amount);
    else                      buckets[key].expense = round2(buckets[key].expense + amount);
    buckets[key].net = round2(buckets[key].income - buckets[key].expense);
    buckets[key].count += 1;
  }

  return Object.values(buckets);
}

// ── Expense Ratio (ANALYST+) ──────────────────────────────────────────────────

async function getExpenseRatio() {
  const [income, expense] = await Promise.all([
    prisma.financialRecord.aggregate({ _sum: { amount: true }, where: { ...BASE_WHERE, type: "INCOME" } }),
    prisma.financialRecord.aggregate({ _sum: { amount: true }, where: { ...BASE_WHERE, type: "EXPENSE" } }),
  ]);

  const totalIncome  = income._sum.amount  ?? 0;
  const totalExpense = expense._sum.amount ?? 0;

  return {
    expenseRatio: totalIncome > 0 ? round2((totalExpense / totalIncome) * 100) : null,
    savingsRate:  totalIncome > 0 ? round2(((totalIncome - totalExpense) / totalIncome) * 100) : null,
    totalIncome:  round2(totalIncome),
    totalExpense: round2(totalExpense),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getWeekKey(date) {
  const d = new Date(date);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

module.exports = { getSummary, getRecentActivity, getCategoryBreakdown, getTrends, getExpenseRatio };
