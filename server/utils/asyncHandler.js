// Wraps async route handlers so rejected promises reach the error middleware
// instead of crashing the process (Express 5 handles rejected promises natively,
// but this keeps error responses consistent and adds context).

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { asyncHandler };
