const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({
    message: err.message || 'Server error',
  });
};

module.exports = errorHandler;
