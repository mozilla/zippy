var Client = require('../client').Client;
var z = require('../../lib/zutil');

var assert = z.assert;

module.exports = {

  testRedirectFromIndex: function(t) {
    var client = new Client('/styleguide/index', 'text/html');
    client
      .get()
      .expect(301)
      .end(function(err, res) {
        t.equal(res.headers.location, '/styleguide');
        t.done();
      });
  },

  testEscapeNotFound: function(t) {
    var client = new Client('/styleguide/%3Cb%3Efoo%3C%2fb%3E', 'text/html');
    client
      .get()
      .end(function(err, res) {
        assert.contains('&lt;b&gt;foo&lt;/b&gt;', res.text);
        t.done();
      });
  }

};
