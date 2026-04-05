const dashboardService = require("../services/dashboard.service");
const { success } = require("../utils/response");

async function getSummary(req, res, next) {
  try {
    const summary = await dashboardService.getSummary(req.user);
    return success(res, { data: summary });
  } catch (error) {
    next(error);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const records = await dashboardService.getRecentActivity(req.user, limit);
    return success(res, { data: records });
  } catch (error) {
    next(error);
  }
}

async function getCategoryBreakdown(req, res, next) {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();
    return success(res, { data: breakdown });
  } catch (error) {
    next(error);
  }
}

async function getTrends(req, res, next) {
  try {
    const period = req.query.period === "weekly" ? "weekly" : "monthly";
    const trends = await dashboardService.getTrends(period);
    return success(res, { data: trends });
  } catch (error) {
    next(error);
  }
}

async function getExpenseRatio(req, res, next) {
  try {
    const ratio = await dashboardService.getExpenseRatio();
    return success(res, { data: ratio });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary,
  getRecentActivity,
  getCategoryBreakdown,
  getTrends,
  getExpenseRatio,
};
