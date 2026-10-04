const { errorResponse } = require('../utils/responseFormatter');

function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]:', err);

  if (err.name === 'MulterError') {
    return errorResponse(res, `File upload error: ${err.message}`, 400);
  }

  if (err.message && err.message.includes('Unsupported file format')) {
    return errorResponse(res, err.message, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
}

module.exports = errorHandler;
