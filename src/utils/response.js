/**
 * Standardized API response helpers.
 * All responses follow  { success, message, data?, meta? }
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number}  options.status   - HTTP status code (default 200)
 * @param {string}  options.message  - Human-readable message
 * @param {*}       options.data     - Response payload
 * @param {object}  options.meta     - Pagination / extra metadata
 */
function success(res, { status = 200, message = "Success", data = null, meta = null } = {}) {
  const body = { success: true, message };
  if (data !== null)  body.data = data;
  if (meta !== null)  body.meta = meta;
  return res.status(status).json(body);
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number}  options.status   - HTTP status code (default 500)
 * @param {string}  options.message  - Human-readable error message
 * @param {*}       options.errors   - Validation errors or extra detail
 */
function error(res, { status = 500, message = "Internal Server Error", errors = null } = {}) {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(status).json(body);
}

module.exports = { success, error };
