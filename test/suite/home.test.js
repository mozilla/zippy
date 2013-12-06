var uuid = require('node-uuid');
var under = require('underscore');

var Client = require('../client').AnonymousClient;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');
var trans = require('../../lib/trans');
var transTest = require('./trans.test');

var client = new Client('/');
var token = 'not-a-real-token';


var goodTrans = {
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR',
  status: 'STARTED',
};


function withSeller(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({_id: uuid.v4(), active: true}, opt);
  sellers.models.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


function withProduct(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({
    external_id: uuid.v4(),
    active: true,
    name: 'x',
  }, opt);
  products.models.create(props, function(err, product) {
    t.ifError(err);
    cb(product);
  });
}


function createTrans(done, params) {
  params = params || {};
  var t = {
    ifError: function(err) {
      if (err) {
        throw err;
      }
    }
  }
  withSeller(t, {}, function(seller) {
    withProduct(t, {seller_id: seller._id, active: false},
      function(product) {
        var data = under.extend(goodTrans, {
          product_id: product._id,
          token: token,
        }, params);
        trans.models.create(data, function(err, trans) {
          if (err) {
            throw err;
          }
          console.log('created trans', trans);
          done(trans);
        });
      })
  });
}


exports.setUp = function(done) {
  trans.models.deleteMany({}, done);
};


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
