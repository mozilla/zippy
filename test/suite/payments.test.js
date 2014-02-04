var nock = require('nock');
var url = require('url');

var AnonymousClient = require('../client').AnonymousClient;
var helpers = require('../helpers');

var client = new AnonymousClient('/payment/start');


exports.setUp = function(done) {
  // Intercept any postbacks when not expecting them.
  nock('https://m.f.c');

  helpers.resetDB()
    .then(done)
    .catch(function(err) {
      throw err;
    });
};


exports.testStartTransThenProcess = function(t) {
  helpers.withTransaction({}, function(transaction) {
    client
      .get({tx: transaction.token})
      .expect(200)
      .end(function(err) {
        t.ifError(err);
      })
      .post('/payment/process')
      .followRedirect(false)
      .expect(301)
      .end(function(err, res) {
        /*jshint camelcase: false */
        if (err) {
          t.ifError(err);
        } else {
          var parts = url.parse(res.headers.location, true);

          t.equal(parts.protocol + '//' + parts.host + parts.pathname,
                  transaction.success_url);
          t.equal(parts.query.ext_transaction_id,
                  transaction.ext_transaction_id);
          t.ok(parts.query.sig, "expected a signature");
        }
        t.done();
      });
  });
};


exports.testStartTransThenFail = function(t) {
  var simulateErr = 'CC_ERROR';
  helpers.withTransaction({}, function(transaction) {
    client
      .get({tx: transaction.token})
      .expect(200)
      .end(function(err) {
        t.ifError(err);
      })
      .post('/payment/process')
      /*jshint camelcase: false */
      .form({simulate_fail: simulateErr})
      .followRedirect(false)
      .expect(301)
      .end(function(err, res) {
        if (err) {
          t.ifError(err);
        } else {
          var parts = url.parse(res.headers.location, true);
          t.equal(parts.protocol + '//' + parts.host + parts.pathname,
                  transaction.error_url);
          t.equal(parts.query.ext_transaction_id,
                  transaction.ext_transaction_id);
          t.equal(parts.query.error, simulateErr);
          t.ok(parts.query.sig, "expected a signature");
        }
        t.done();
      });
  });
};


exports.testNoActiveTrans = function(t) {
  helpers.withTransaction({}, function() {
    client
      .post('/payment/process')
      .form({foo: 'bar'})
      .expect(404)  // No session cookie.
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testNoToken = function(t) {
  helpers.withTransaction({}, function() {
    client.get().expect(409)  // missing tx=
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testInvalidToken = function(t) {
  helpers.withTransaction({}, function() {
    client.get({tx: 'nope'}).expect(404)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testGoodToken = function(t) {
  helpers.withTransaction({}, function(transaction) {
    client.get({tx: transaction.token}).expect(200)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testEndedTrans = function(t) {
  helpers.withTransaction({
    status: 'COMPLETED',
  }, function(transaction) {
    client.get({tx: transaction.token}).expect(400)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testPostSuccessCallback = function(t) {
  var postback = nock('https://m.f.c')
    .post('/webpay/callback/success')
    .reply(200, 'OK');

  helpers.withTransaction({}, function(transaction) {
    client
      .get({tx: transaction.token})
      .expect(200)
      .end(function(err) {
        t.ifError(err);
      })
      .post('/payment/process')
      .end(function(err) {
        if (err) {
          t.ifError(err);
        } else {
          helpers.waitForNock(postback, {
            name: 'postErrorCallback',
            done: function() {
              t.done();
            }
          });
        }
      });
  });
};


exports.testPostErrorCallback = function(t) {
  var simulateErr = 'CC_ERROR';
  var postback = nock('https://m.f.c')
    .post('/webpay/callback/error')
    .reply(200, 'OK');

  helpers.withTransaction({}, function(transaction) {
    client
      .get({tx: transaction.token})
      .expect(200)
      .end(function(err) {
        t.ifError(err);
      })
      .post('/payment/process')
      /*jshint camelcase: false */
      .form({simulate_fail: simulateErr})
      .end(function(err) {
        if (err) {
          t.ifError(err);
        } else {
          helpers.waitForNock(postback, {
            name: 'postErrorCallback',
            done: function() {
              t.done();
            }
          });
        }
      });
  });
};
