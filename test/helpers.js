var under = require('underscore');
var uuid = require('node-uuid');

var products = require('../lib/products');
var sellers = require('../lib/sellers');


exports.withProduct = function(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({
    /*jshint camelcase: false */
    external_id: uuid.v4(),
    status: 'ACTIVE'
  }, opt);
  products.models.create(props, function(err, product) {
    if (t) {
      t.ifError(err);
    } else {
      if (err) { throw err; }
    }
    cb(product);
  });
};


exports.withSeller = function(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({uuid: uuid.v4(), status: 'ACTIVE'}, opt);
  sellers.models.create(props, function(err, seller) {
    if (t) {
      t.ifError(err);
    } else {
      if (err) { throw err; }
    }
    cb(seller);
  });
};
