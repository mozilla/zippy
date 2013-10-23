var supertest = require('supertest');
var test = require('../');

var z = require('../../lib/zutil');

var assert = z.assert;

function get(url) {
  return supertest(test.app)
    .get(url)
    .set('Accept', 'text/html');
}

module.exports = {

  testRedirectFromIndex: function(t) {
    get('/styleguide/index')
      .expect(301)
      .end(function(err, res) {
        t.done();
      });
  }

};
