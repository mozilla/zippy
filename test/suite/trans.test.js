var under = require('underscore');
var uuid = require('node-uuid');

var Client = require('../client').Client;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');
var trans = require('../../lib/trans');

var client = new Client('/transactions');


var goodTrans = {
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR'
};


function withSeller(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({uuid: uuid.v4(), active: true}, opt);
  sellers.sellers.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


function withProduct(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({external_id: uuid.v4(), active: true}, opt);
  products.products.create(props, function(err, product) {
    t.ifError(err);
    cb(product);
  });
}


exports.setUp = function(done) {
  trans.trans.deleteMany({}, done);
};


exports.postWithoutProduct = function(t) {
  client
    .post(goodTrans)
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.postWithInactiveProduct = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id, active: false}, function(product) {
      client
        .post(under.extend(goodTrans, {product_id: product._id}))
        .expect(409)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.code, 'InvalidArgument');
          t.done();
        });
    });
  });
};


exports.postOkTrans = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
      client
        .post(under.extend(goodTrans, {product_id: product._id}))
        .expect(201)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.product_id, product._id);
          t.equal(res.body.status, 'started');
          t.equal(res.body.token.length, 128);
          t.equal(res.body.region, goodTrans.region);
          t.equal(res.body.carrier, goodTrans.carrier);
          t.equal(res.body.price, goodTrans.price);
          t.equal(res.body.currency, goodTrans.currency);
          t.equal(res.body.pay_method, goodTrans.pay_method);
          t.done();
        });
    });
  });
};


exports.postInvalidPayMethod = function(t) {
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
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
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id}, function(product) {
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
