var Client = require('../client').Client;
var z = require('../../lib/zutil');

var assert = z.assert;

module.exports = {

  testRedirectFromIndex: function(t) {
    var client = new Client('/styleguide/index', 'text/html');
    client
      .get()
      .expect(200)  // Expect 200 since we followed redirects.
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        assert.contains('StyleGuide | index', res.body)
        t.done();
      });
  },

  testEscapeNotFound: function(t) {
    var client = new Client('/styleguide/%3Cb%3Efoo%3C%2fb%3E', 'text/html');
    client
      .get()
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        assert.contains('&lt;b&gt;foo&lt;/b&gt;', res.body);
        t.done();
      });
  }

};
