var Client = require('../client').AnonymousClient;

exports.testResetOK = function(t) {
  var client = new Client('/');
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.include(res.body, 'Welcome to Zippy!');
      t.done();
    });
};
