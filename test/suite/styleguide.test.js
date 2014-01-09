var assert = require('chai').assert;

var Client = require('../client').Client;


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
        assert.include(res.body, 'StyleGuide | index');
        t.done();
      });
  },

  testNotFound: function(t) {
    var client = new Client('/styleguide/%3Cb%3Efoo%3C%2fb%3E', 'text/html');
    client
      .get()
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        assert.include(res.body, 'Style doc not found');
        assert.notInclude(res.body, '<b>foo');
        t.done();
      });
  }

};
