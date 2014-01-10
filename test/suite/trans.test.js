var under = require('underscore');

var Client = require('../client').Client;
var helpers = require('../helpers');
var trans = require('../../lib/trans');

var client = new Client('/transactions');


var goodTrans = {
  /*jshint camelcase: false */
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR',
  success_url: 'https://m.f.c/webpay/success',
  error_url: 'https://m.f.c/webpay/error',
  ext_transaction_id: 'webpay:xyz',
};


exports.setUp = function(done) {
  trans.models.deleteMany({}, done);
};


exports.postWithoutProduct = function(t) {
  client
    .post(goodTrans)
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.error.name, 'InvalidArgumentError');
      t.done();
    });
};


exports.postWithInactiveProduct = function(t) {
  helpers.withSeller(t, {}, function(seller) {
    helpers.withProduct(t, {seller_id: seller._id, status: 'INACTIVE'}, function(product) {
      client
        .post(under.extend(goodTrans, {product_id: product._id}))
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
  helpers.withSeller(t, {}, function(seller) {
    helpers.withProduct(t, {seller_id: seller._id}, function(product) {
      client
        .post(under.extend(goodTrans, {product_id: product._id}))
        .expect(201)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.product_id, product._id);
          t.equal(res.body.status, 'STARTED');
          t.equal(res.body.token.length, 128);
          t.equal(res.body.region, goodTrans.region);
          t.equal(res.body.carrier, goodTrans.carrier);
          t.equal(res.body.price, goodTrans.price);
          t.equal(res.body.currency, goodTrans.currency);
          t.equal(res.body.pay_method, goodTrans.pay_method);
          t.equal(res.body.success_url, goodTrans.success_url);
          t.equal(res.body.error_url, goodTrans.error_url);
          t.equal(res.body.ext_transaction_id, goodTrans.ext_transaction_id);
          t.done();
        });
    });
  });
};


exports.postInvalidPayMethod = function(t) {
  helpers.withSeller(t, {}, function(seller) {
    helpers.withProduct(t, {seller_id: seller._id}, function(product) {
      var data = {};
      under.extend(data, goodTrans, {product_id: product._id});
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
  helpers.withSeller(t, {}, function(seller) {
    helpers.withProduct(t, {seller_id: seller._id}, function(product) {
      var data = {};
      under.extend(data, goodTrans, {product_id: product._id});
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
  helpers.withSeller(t, {}, function(seller) {
    helpers.withProduct(t, {seller_id: seller._id}, function(product) {
      var data = under.extend({}, goodTrans, {
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
