var under = require('underscore');
var uuid = require('node-uuid');

var Client = require('../client').Client;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');
var trans = require('../../lib/trans');

var client = new Client('/transactions');


var transData = {
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR',
  callback_success_url: 'https://m.f.c/webpay/callback/success',
  callback_error_url: 'https://m.f.c/webpay/callback/error',
  success_url: 'https://m.f.c/webpay/success',
  error_url: 'https://m.f.c/webpay/error',
  ext_transaction_id: 'webpay:xyz',
};


function withSeller(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({uuid: uuid.v4(), status: 'ACTIVE'}, opt);
  sellers.models.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


function withProduct(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({external_id: uuid.v4(), status: 'ACTIVE'}, opt);
  products.models.create(props, function(err, product) {
    t.ifError(err);
    cb(product);
  });
}


exports.setUp = function(done) {
  trans.models.deleteMany({}, done);
};


exports.postWithoutProduct = function(t) {
  client
    .post(transData)
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.error.name, 'InvalidArgumentError');
      t.done();
    });
};


exports.postWithInactiveProduct = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id, status: 'INACTIVE'}, function(product) {
      client
        .post(under.extend({}, transData, {product_id: product._id}))
        .expect(409)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.error.name, 'InvalidArgumentError');
          t.done();
        });
    });
  });
};


exports.postOkTrans = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
      client
        .post(under.extend({}, transData, {product_id: product._id}))
        .expect(201)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.product_id, product._id);
          t.equal(res.body.status, 'STARTED');
          t.equal(res.body.token.length, 128);
          t.equal(res.body.region, transData.region);
          t.equal(res.body.carrier, transData.carrier);
          t.equal(res.body.price, transData.price);
          t.equal(res.body.currency, transData.currency);
          t.equal(res.body.pay_method, transData.pay_method);
          t.equal(res.body.callback_success_url, transData.callback_success_url);
          t.equal(res.body.callback_error_url, transData.callback_error_url);
          t.equal(res.body.success_url, transData.success_url);
          t.equal(res.body.error_url, transData.error_url);
          t.equal(res.body.ext_transaction_id, transData.ext_transaction_id);
          t.done();
        });
    });
  });
};


exports.postInvalidPayMethod = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
      var data = {};
      under.extend(data, transData, {product_id: product._id});
      data.pay_method = 'NOT_SUPPORTED';
      client
        .post(data)
        .expect(409)
        .end(function(err) {
          t.ifError(err);
          t.done();
        });
    });
  });
};


exports.postInvalidCurrency = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
      var data = {};
      under.extend(data, transData, {product_id: product._id});
      data.currency = 'ZZZ';
      client
        .post(data)
        .expect(409)
        .end(function(err) {
          t.ifError(err);
          t.done();
        });
    });
  });
};


exports.postInvalidUrls = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
      var data = under.extend({}, transData, {
        product_id: product._id,
        success_url: 'nope',
        error_url: 'not-a-url',
      });
      client
        .post(data)
        .expect(409)
        .end(function(err) {
          t.ifError(err);
          t.done();
        });
    });
  });
};
