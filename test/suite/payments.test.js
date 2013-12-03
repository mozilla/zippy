var under = require('underscore');
var uuid = require('node-uuid');
var supertest = require('super-request');

var test = require('../');
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');
var trans = require('../../lib/trans');

var token = 'fake-token';


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
  var transData = {
    product_id: undefined,
    region: 123,
    carrier: 'USA_TMOBILE',
    price: '0.99',
    currency: 'EUR',
    pay_method: 'OPERATOR',
    token: token,
    status: 'STARTED',
  };
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
    .get('/?tx=' + token)
    .expect(200)
    .end(function(err, res) {
      t.ifError(err);
    })
    .post('/payment/process')
    .followRedirect(false)
    .expect(301)
    .end(function(err, res) {
      t.ifError(err);
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
