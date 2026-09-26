/**
 * Global Error Handling Middlewares
 */

// 404 Not Found Middleware
function notFoundHandler(req, res, next) {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    path: req.originalUrl,
  });
}

// Global 500 Server Error Handler
function serverErrorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(status).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  }

  res.status(status).render('500', {
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    message: err.message || 'An unexpected error occurred on the server.',
  });
}

module.exports = {
  notFoundHandler,
  serverErrorHandler,
};
