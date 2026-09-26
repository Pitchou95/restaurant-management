const mongoose = require('mongoose');

/**
 * Flash message & template locals injector middleware
 */
module.exports = function (req, res, next) {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.info_msg = req.flash('info');
  res.locals.currentPath = req.path;
  res.locals.appName = 'GourmetHub';
  res.locals.currentYear = new Date().getFullYear();
  res.locals.isDemoMode = mongoose.connection.readyState !== 1;
  next();
};
