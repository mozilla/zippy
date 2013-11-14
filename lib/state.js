var constants = require('./constants');

exports.retrieve = function(req, res, next) {
  res.send(200, {'result': constants.OK});
  next();
};
