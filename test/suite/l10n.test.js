var assert = require('../../lib/zutil').assert;
var Client = require('../client').Client;

var client = new Client('/payment/card/', 'text/html', 'it-CH');


exports.testDebugLocale = function(t) {
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      assert.contains('ʇuǝɯʎaԀ ɯɹıɟuoↃ', res.body);
      t.done();
    });
};
