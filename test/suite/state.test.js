var Client = require('../client').AnonymousClient;

exports.testOK = function(t) {
  var client = new Client('/status');
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.equal(res.body.result, 'OK');
      t.done();
    });
};
