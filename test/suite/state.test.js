var Client = require('../client').Client;

var client = new Client('/status');

exports.testOK = function(t) {
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.equal(res.body.result, 'OK');
      t.done();
    });
};
