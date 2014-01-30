exports.reset = function(req, res) {
  // In case of a real implementation, that URI is reached when the client
  // detects user switching. The payment processor should implement
  // whatever logic necessary to reset the user (cookies, etc).
  res.send(200, {'result': 'OK'});
};
