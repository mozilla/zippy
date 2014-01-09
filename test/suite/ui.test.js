var assert = require('chai').assert;

var Client = require('../client').Client;

var client = new Client('/sellers/%3Cscript%3Ealert%28%27hai%27%29%3C%2Fscript%3E', 'text/html');

exports.testAutoEscape = function(t) {
  client
    .get()
    .expect(404)
    .end(function(err, res) {
      t.ifError(err);
      assert.include(res.body, '&lt;script&gt;alert(&#39;hai&#39;)&lt;/script&gt;');
      t.done();
    });
};

exports.test404HTML = function(t) {
  var client = new Client('/whatever-does-not-exist', 'text/html');
  client
    .get()
    .expect(404)
    .end(function(err, res) {
      t.ifError(err);
      assert.include(res.body, 'NotFoundError');
      t.done();
    });
};

exports.test404JSON = function(t) {
  var client = new Client('/whatever-does-not-exist', 'application/json');
  client
    .get()
    .expect(404)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.error.name, 'NotFoundError');
      t.done();
    });
};
