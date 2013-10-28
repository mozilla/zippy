var under = require('underscore');
var uuid = require('node-uuid');

var Client = require('../client').Client;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');

var client = new Client('/products/');


function withSeller(t, cb, opt) {
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
  products.products.deleteMany({}, done);
};


exports.postWithoutSeller = function(t) {
  client
    .post({external_id: uuid.v4()})
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.postWithoutExternalId = function(t) {
  withSeller(t, function(seller) {
    client
      .post({seller_id: seller._id})
      .expect(409)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.code, 'InvalidArgument');
        t.done();
      });
  });
};


exports.postOkSeller = function(t) {
  withSeller(t, function(seller) {
    var external_id = uuid.v4();
    client
      .post({seller_id: seller._id, external_id: external_id})
      .expect(201)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.seller_id, seller._id);
        t.equal(res.body.external_id, external_id);
        t.done();
      });
  });
};


exports.postWrongSeller = function(t) {
  var nonExistant = uuid.v4();
  client
    .post({seller_id: nonExistant, external_id: uuid.v4()})
    .expect(409)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.postInactiveSeller = function(t) {
  var opt = {active: false};
  withSeller(t, function(seller) {
    client
      .post({seller_id: seller._id, external_id: uuid.v4()})
      .expect(409)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  }, opt);
};


exports.postDupeExternalId = function(t) {
  withSeller(t, function(seller) {
    withProduct(t, {seller_id: seller._id, external_id: uuid.v4()}, function(product) {
      client
        .post({seller_id: seller._id, external_id: product.external_id})
        .expect(409)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.code, 'InvalidArgument');
          t.done();
        });
    });
  });
};
