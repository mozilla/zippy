var nock = require('nock');
var url = require('url');

var under = require('underscore');
var supertest = require('super-request');

var test = require('../');
var AnonymousClient = require('../client').AnonymousClient;
var Client = require('../client').Client;
var helpers = require('../helpers');
var trans = require('../../lib/trans');

var client = new AnonymousClient('/');
var transactionClient = new Client('/transactions');


exports.setUp = function(done) {
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
      t.ifError(err);
      /*jshint camelcase: false */
      t.equal(res.headers.location,
              helpers.transactionData.success_url +
                '?ext_transaction_id=' + helpers.transactionData.ext_transaction_id);
      t.done();
    });
};


exports.testStartTransThenFail = function(t) {
  /*jshint camelcase: false */
  var simulateErr = 'CC_ERROR';
  supertest(test.app)
    .get('/?tx=' + helpers.transactionData.token)
    .expect(200)
    .end(function(err) {
      t.ifError(err);
    })
    .post('/payment/process')
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
  nock('https://m.f.c')
    .filteringPath(function(path) {
      if(path.indexOf('sig') && path.indexOf('product_id'))
        return '/webpay/callback/success?signed_notice';
    })
    .post('/webpay/callback/success?signed_notice')
    .reply(200, 'OK');
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id
    }, function(product) {
      var data = under.omit(
        under.extend({}, helpers.transactionData, {
          /*jshint camelcase: false */
          product_id: product._id
        }),
        'status', 'token'
      );
      transactionClient
        .post(data)
        .expect(201)
        .end(function(err) {
          t.ifError(err);
          t.done();
        });
    });
  });
};


exports.postErrorCallback = function(t) {
  nock('https://m.f.c')
    .filteringPath(function(path) {
      if(path.indexOf('sig') && path.indexOf('product_id'))
        return '/webpay/callback/error?signed_notice';
    })
    .post('/webpay/callback/error?signed_notice')
    .reply(200, 'OK');
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id
    }, function(product) {
      var data = under.omit(
        under.extend({}, helpers.transactionData, {
          /*jshint camelcase: false */
          product_id: product._id,
          currency: 'not-a-valid-one',
        }),
        'token', 'status'
      );
      transactionClient
        .post(data)
        .expect(409)
        .end(function(err) {
          t.ifError(err);
          t.done();
        });
    });
  });
};
