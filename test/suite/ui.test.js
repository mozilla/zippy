var Client = require('../client').Client;
var z = require('../../lib/zutil');

var assert = z.assert;
var client = new Client('/sellers/%3Cscript%3Ealert%28%27hai%27%29%3C%2Fscript%3E');

module.exports = {

  testAutoEscape: function(t) {
    client
      .get()
      .expect(404)
      .end(function(err, res) {
        t.ifError(err);
        assert.contains('&lt;script&gt;alert(&#39;hai&#39;)&lt;/script&gt;', res.text);
        t.done();
      });
  }

};
