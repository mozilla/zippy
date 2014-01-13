var Client = require('../client').Client;

var client = new Client('/payment/card/', 'text/html', 'it-CH');


exports.testDebugLocale = function(t) {
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.include(res.body, 'ʇuǝɯʎaԀ ɯɹıɟuoↃ');
      t.done();
    });
};
