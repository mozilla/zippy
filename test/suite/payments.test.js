var url = require('url');

var under = require('underscore');
var supertest = require('super-request');

var test = require('../');
var Client = require('../client').AnonymousClient;
var helpers = require('../helpers');
var trans = require('../../lib/trans');

var client = new Client('/');


var transData = {
  /*jshint camelcase: false */
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR',
  token: 'fake-token',
  status: 'STARTED',
  success_url: 'https://m.f.c/webpay/success',
  error_url: 'https://m.f.c/webpay/error',
  ext_transaction_id: 'webpay-xyz',
};

var newTransData = under.extend({}, transData, {
  token: 'a-different-token',
});


exports.setUp = function(done) {
  trans.models.deleteMany({}, function() {
    helpers.withSeller(undefined, {}, function(seller) {
      helpers.withProduct(undefined, {seller_id: seller._id}, function(product) {
        transData.product_id = product._id;
        trans.models.create(transData, function(err, createdTrans) {
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
    .get('/?tx=' + transData.token)
    .expect(200)
    .end(function(err) {
      t.ifError(err);
    })
    .post('/payment/process')
    .followRedirect(false)
    .expect(301)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.headers.location,
              transData.success_url +
                '?ext_transaction_id=' + transData.ext_transaction_id);
      t.done();
    });
};


exports.testStartTransThenFail = function(t) {
  var simulate_err = 'CC_ERROR';
  supertest(test.app)
    .get('/?tx=' + transData.token)
    .expect(200)
    .end(function(err) {
      t.ifError(err);
    })
    .post('/payment/process')
    .form({simulate_fail: simulate_err})
    .followRedirect(false)
    .expect(301)
    .end(function(err, res) {
      if (err) {
        t.ifError(err);
      } else {
        var parts = url.parse(res.headers.location, true);
        t.equal(parts.protocol + '//' + parts.host + parts.pathname,
                transData.error_url);
        t.equal(parts.query.ext_transaction_id,
                transData.ext_transaction_id);
        t.equal(parts.query.error, simulate_err);
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
  helpers.withSeller(undefined, {}, function(seller) {
    helpers.withProduct(undefined, {seller_id: seller._id, active: false},
      function(product) {
        var data = under.extend(newTransData, {
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
