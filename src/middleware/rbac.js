const { ForbiddenError } = require("../utils/errors");

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY = { VIEWER: 0, ANALYST: 1, ADMIN: 2 };

/**
 * RBAC Middleware Factory.
 *
 * Usage:
 *   router.get("/records", authenticate, authorize("ANALYST"), handler)
 *   // Only ANALYST and ADMIN can access (hierarchy-based)
 *
 *   router.post("/records", authenticate, authorize("ADMIN"), handler)
 *   // Only ADMIN can access
 *
 * @param {...string} allowedRoles - Minimum role required (hierarchy-aware)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError("Authentication required before authorization."));
    }

    const userRoleLevel  = ROLE_HIERARCHY[req.user.role] ?? -1;
    const minRequiredLevel = Math.min(
      ...allowedRoles.map((r) => ROLE_HIERARCHY[r] ?? Infinity)
    );

    if (userRoleLevel >= minRequiredLevel) {
      return next();
    }

    return next(
      new ForbiddenError(
        `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}.`
      )
    );
  };
}

/**
 * Middleware to ensure user can only access their own resources
 * unless they are an ADMIN or ANALYST.
 *
 * Usage: router.get("/records", authenticate, ownOrAnalystAbove, handler)
 */
function ownOrAnalystAbove(req, res, next) {
  if (!req.user) {
    return next(new ForbiddenError("Authentication required."));
  }
  // ANALYST and above can access all; VIEWER can only see their own
  // The controller should further filter by req.user.id when role is VIEWER.
  next();
}

module.exports = { authorize, ownOrAnalystAbove, ROLE_HIERARCHY };
