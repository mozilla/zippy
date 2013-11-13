var Client = require('../client').AnonymousClient;

var client = new Client('/');


exports.testNoAuth = function(t) {
  client.get().expect(200)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      t.done();
    });
};
