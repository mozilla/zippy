var nock = require('nock');
var url = require('url');

var under = require('underscore');
var uuid = require('node-uuid');
var supertest = require('super-request');

var test = require('../');
var AnonymousClient = require('../client').AnonymousClient;
var Client = require('../client').Client;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');
var trans = require('../../lib/trans');

var client = new AnonymousClient('/');
var transactionClient = new Client('/transactions');

var transData = {
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR',
  token: 'fake-token',
  status: 'STARTED',
  callback_success_url: 'https://m.f.c/webpay/callback/success',
  callback_error_url: 'https://m.f.c/webpay/callback/error',
  success_url: 'https://m.f.c/webpay/success',
  error_url: 'https://m.f.c/webpay/error',
  ext_transaction_id: 'webpay-xyz',
};

var newTransData = under.extend({}, transData, {
  token: 'a-different-token',
});


function withSeller(opt, cb) {
  opt = opt || {};
  var props = under.extend({uuid: uuid.v4(), status: 'ACTIVE'}, opt);
  sellers.models.create(props, function(err, seller) {
    if (err) {
      throw err;
    }
    cb(seller);
  });
}


function withProduct(opt, cb) {
  opt = opt || {};
  var props = under.extend({external_id: uuid.v4(), status: 'ACTIVE'}, opt);
  products.models.create(props, function(err, product) {
    if (err) {
      throw err;
    }
    cb(product);
  });
}


exports.setUp = function(done) {
  trans.models.deleteMany({}, function() {
    withSeller({}, function(seller) {
      withProduct({seller_id: seller._id}, function(product) {
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
    .end(function(err, res) {
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
    .end(function(err, res) {
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
    .end(function(err, res) {
      t.ifError(err);
      t.done();
    });
};


function createTrans(done, params) {
  params = params || {};
  withSeller({}, function(seller) {
    withProduct({seller_id: seller._id, active: false},
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
    .end(function(err, res) {
      t.ifError(err);
      t.done();
    });
};


exports.testInvalidToken = function(t) {
  client.get({tx: 'nope'}).expect(404)
    .end(function(err, res) {
      t.ifError(err);
      t.done();
    });
};


exports.testGoodToken = function(t) {
  createTrans(function(trans) {
    client.get({tx: trans.token}).expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.testEndedTrans = function(t) {
  createTrans(function(trans) {
    client.get({tx: trans.token}).expect(400)
      .end(function(err, res) {
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
  withSeller({}, function(seller) {
    withProduct({seller_id: seller._id}, function(product) {
      var data = under.omit(
        under.extend({}, transData, {product_id: product._id}),
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
  withSeller({}, function(seller) {
    withProduct({seller_id: seller._id}, function(product) {
      var data = under.omit(
        under.extend({}, transData, {
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
