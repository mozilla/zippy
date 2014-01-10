var under = require('underscore');
var uuid = require('node-uuid');

var products = require('../lib/products');
var sellers = require('../lib/sellers');


exports.withProduct = function(opt, cb) {
  opt = opt || {};
  var props = under.extend({
    /*jshint camelcase: false */
    external_id: uuid.v4(),
    status: 'ACTIVE'
  }, opt);
  products.models.create(props, function(err, product) {
    if (err) { throw err; }
    cb(product);
  });
};


exports.withSeller = function(opt, cb) {
  opt = opt || {};
  var props = under.extend({
    uuid: uuid.v4(),
    status: 'ACTIVE',
    name: 'John',
    email: 'jdoe@example.org',
  }, opt);
  sellers.models.create(props, function(err, seller) {
    if (err) { throw err; }
    cb(seller);
  });
};


exports.transactionData = {
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
