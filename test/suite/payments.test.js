var nock = require('nock');
var url = require('url');

var under = require('underscore');
var supertest = require('super-request');

var test = require('../');
var AnonymousClient = require('../client').AnonymousClient;
var helpers = require('../helpers');
var trans = require('../../lib/trans');

var client = new AnonymousClient('/');


exports.setUp = function(done) {
  // Intercept any postbacks when not expecting them.
  nock('https://m.f.c');

  trans.models.deleteMany({}, function() {
    helpers.withSeller({}, function(seller) {
      helpers.withProduct({
        /*jshint camelcase: false */
        seller_id: seller._id
      }, function(product) {
        /*jshint camelcase: false */
        helpers.transactionData.product_id = product._id;
        trans.models.create(helpers.transactionData, function(err, createdTrans) {
          if (err) {
            throw err;
          }
          console.log('made transaction', createdTrans);
          done();
        });
      });
    });
  });
};


exports.testStartTransThenProcess = function(t) {
  supertest(test.app)
    .get('/?tx=' + helpers.transactionData.token)
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
                helpers.transactionData.success_url);
        t.equal(parts.query.ext_transaction_id,
                helpers.transactionData.ext_transaction_id);
        t.ok(parts.query.sig, "expected a signature");
      }
      t.done();
    });
};


exports.testStartTransThenFail = function(t) {
  var simulateErr = 'CC_ERROR';
  supertest(test.app)
    .get('/?tx=' + helpers.transactionData.token)
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
                helpers.transactionData.error_url);
        t.equal(parts.query.ext_transaction_id,
                helpers.transactionData.ext_transaction_id);
        t.equal(parts.query.error, simulateErr);
        t.ok(parts.query.sig, "expected a signature");
      }
      t.done();
    });
};


exports.testNoActiveTrans = function(t) {
  supertest(test.app)
    .post('/payment/process')
    .expect(409)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};


function createTrans(done, params) {
  params = params || {};
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id,
      active: false
    },
      function(product) {
        var data = under.extend(under.extend({}, helpers.transactionData, {
          token: 'a-different-token',
        }), {
          product_id: product._id,
        }, params);
        trans.models.create(data, function(err, trans) {
          if (err) {
            throw err;
          }
          console.log('created trans', trans);
          done(trans);
        });
      });
  });
}


exports.testNoToken = function(t) {
  client.get().expect(409)  // missing tx=
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.testInvalidToken = function(t) {
  client.get({tx: 'nope'}).expect(404)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.testGoodToken = function(t) {
  createTrans(function(trans) {
    client.get({tx: trans.token}).expect(200)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testEndedTrans = function(t) {
  createTrans(function(trans) {
    client.get({tx: trans.token}).expect(400)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  }, {
    status: 'COMPLETED',
  });
};


exports.postSuccessCallback = function(t) {
  var postback = nock('https://m.f.c')
    .post('/webpay/callback/success')
    .reply(200, 'OK');

  supertest(test.app)
    .get('/?tx=' + helpers.transactionData.token)
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
};


exports.postErrorCallback = function(t) {
  var simulateErr = 'CC_ERROR';
  var postback = nock('https://m.f.c')
    .post('/webpay/callback/error')
    .reply(200, 'OK');

  supertest(test.app)
    .get('/?tx=' + helpers.transactionData.token)
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
};
