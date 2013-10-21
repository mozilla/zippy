var supertest = require('supertest');
var test = require('../');

var helpers = require('../../lib/helpers');

var assert = helpers.assert;

function get(url) {
  return supertest(test.app)
    .get(url)
    .set('Accept', 'text/html');
}

module.exports = {

  testAutoEscape: function(t) {
    get('/sellers/%3Cscript%3Ealert%28%27hai%27%29%3C%2Fscript%3E/')
      .expect(404)
      .end(function(err, res) {
        t.ifError(err);
        assert.contains('&lt;script&gt;alert(&#39;hai&#39;)&lt;/script&gt;', res.text);
        t.done();
      });
  }

};
