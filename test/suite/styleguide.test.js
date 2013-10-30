var Client = require('../client').Client;

var client = new Client('/styleguide/index');

module.exports = {

  testRedirectFromIndex: function(t) {
    client
      .get()
      .expect(301)
      .end(function(err, res) {
        t.equal(res.headers.location, '/styleguide');
        t.done();
      });
  }

};
