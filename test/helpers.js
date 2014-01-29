var under = require('underscore');
var uuid = require('node-uuid');
var when = require('when');

var config = require('../lib/config');


var withProduct = exports.withProduct = function(opt, cb) {
  opt = opt || {};
  var product = under.extend({
    /*jshint camelcase: false */
    external_id: uuid.v4(),
    status: 'ACTIVE'
  }, opt);
  when(config.redisCli.hmset('product-' + product.external_id, product))
    .then(function() {
      cb(product);
    })
    .catch(function(err) {
      throw err;
    });
};


var withSeller = exports.withSeller = function(opt, cb) {
  opt = opt || {};
  var seller = under.extend({
    uuid: uuid.v4(),
    status: 'ACTIVE',
    name: 'John',
    email: 'jdoe@example.org',
  }, opt);
  when(config.redisCli.hmset('seller-' + seller.uuid, seller))
    .then(function() {
      cb(seller);
    })
    .catch(function(err) {
      throw err;
    });
};



var transactionData = exports.transactionData = {
  /*jshint camelcase: false */
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


exports.withTransaction = function(opt, cb) {
  opt = opt || {};
  var transaction = under.extend({}, transactionData, opt);
  withSeller({}, function(seller) {
    withProduct({
      /*jshint camelcase: false */
      seller_id: seller.uuid,
      active: false
    },
    function(product) {
      var data = under.extend({}, transaction, {
        token: 'a-different-token',
        product_id: product.external_id,
        uuid: uuid.v4(),
      });
      when(config.redisCli.hmset('transaction-' + data.uuid, data))
        .then(function() {
          cb(data);
        })
        .catch(function(err) {
          throw err;
        });
    });
  });
};


exports.resetDB = function () {
  return when(config.redisCli.keys('transaction-*'))
    .then(function (keys) {
      keys.map(function (key) {
        return config.redisCli.del(key);
      });
    })
    .then(function () {
      return config.redisCli.keys('product-*');
    })
    .then(function (keys) {
      keys.map(function (key) {
        return config.redisCli.del(key);
      });
    })
    .then(function () {
      return config.redisCli.keys('seller-*');
    })
    .then(function (keys) {
      keys.map(function (key) {
        return config.redisCli.del(key);
      });
    })
    .catch(function(err) {
      throw err;
    });
};


exports.waitForNock = function(nockScope, opt) {
  /*
   * Waits until a nock scope is fulfilled or until a timeout.
   *
   * If you need to test an asynchronous HTTP call then you have
   * to wait for it to complete. This is a helper to do that as
   * fast as possible.
   * */
  opt = opt || {};
  opt.name = opt.name || '[unnamed nock]';
  opt.tries = opt.tries || 1;
  opt.done = opt.done || function() {};

  if (opt.tries >= 10) {
    throw new Error('Gave up on nock scope ' +
                    opt.name + ' after ' + opt.tries + ' tries');
  }
  if (!nockScope.isDone()) {
    setTimeout(function() {
      opt.tries++;
      exports.waitForNock(nockScope, opt);
    }, 3);
    return;
  }
  nockScope.done();
  opt.done();
};
