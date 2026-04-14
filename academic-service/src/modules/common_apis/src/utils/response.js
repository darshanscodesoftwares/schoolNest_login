const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message, statusCode = 500, code = 'ERROR') => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  });
};

module.exports = { sendSuccess, sendError };
