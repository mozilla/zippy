var Client = require('../client').AnonymousClient;

exports.testResetOK = function(t) {
  var client = new Client('/users/reset');
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.equal(res.body.result, 'OK');
      t.done();
    });
};
