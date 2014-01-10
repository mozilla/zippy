var under = require('underscore');

var Client = require('../client').Client;
var helpers = require('../helpers');
var trans = require('../../lib/trans');

var client = new Client('/transactions');


exports.setUp = function(done) {
  trans.models.deleteMany({}, done);
};


exports.postWithoutProduct = function(t) {
  client
    .post(helpers.transactionData)
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.error.name, 'InvalidArgumentError');
      t.done();
    });
};


exports.postWithInactiveProduct = function(t) {
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id,
      status: 'INACTIVE'
    }, function(product) {
      client
        .post(under.extend({}, helpers.transactionData, {product_id: product._id}))
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
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id
    }, function(product) {
      var data = under.omit(
        under.extend({}, helpers.transactionData, {
          /*jshint camelcase: false */
          product_id: product._id,
        }),
        'status', 'token'
      );
      client
        .post(data)
        .expect(201)
        .end(function(err, res) {
          t.ifError(err);
          /*jshint camelcase: false */
          t.equal(res.body.product_id, product._id);
          t.equal(res.body.status, 'STARTED');
          t.equal(res.body.token.length, 128);
          t.equal(res.body.region, helpers.transactionData.region);
          t.equal(res.body.carrier, helpers.transactionData.carrier);
          t.equal(res.body.price, helpers.transactionData.price);
          t.equal(res.body.currency, helpers.transactionData.currency);
          t.equal(res.body.pay_method, helpers.transactionData.pay_method);
          t.equal(res.body.callback_success_url, helpers.transactionData.callback_success_url);
          t.equal(res.body.callback_error_url, helpers.transactionData.callback_error_url);
          t.equal(res.body.success_url, helpers.transactionData.success_url);
          t.equal(res.body.error_url, helpers.transactionData.error_url);
          t.equal(res.body.ext_transaction_id, helpers.transactionData.ext_transaction_id);
          t.done();
        });
    });
  });
};


exports.postInvalidPayMethod = function(t) {
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id
    }, function(product) {
      var data = {};
      under.extend(data, helpers.transactionData, {
        /*jshint camelcase: false */
        product_id: product._id
      });
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
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id
    }, function(product) {
      var data = {};
      under.extend(data, helpers.transactionData, {
        /*jshint camelcase: false */
        product_id: product._id
      });
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
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id
    }, function(product) {
      var data = under.extend({}, helpers.transactionData, {
        /*jshint camelcase: false */
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
