exports.state = function(req, res, next) {
  res.send(200, {'result': 'OK'});
  next();
};
