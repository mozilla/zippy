var assert = require('assert-plus');
var supertest = require('supertest');
var uuid = require('node-uuid');
var test = require('../');

var zippy = require('../../lib');
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');


function request() {
  return supertest(test.app)
    .post('/products/')
    .set('Accept', 'application/json')
}


function withSeller(t, cb) {
  sellers.sellers.create({uuid: uuid.v4(), active: true}, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


exports.setUp = function(done) {
  products.products.deleteMany({}, done);
};


exports.postWithoutSeller = function(t) {
  request()
    .send({external_id: uuid.v4()})
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'MissingParameter');
      t.done();
    });
};


exports.postWithoutExternalId = function(t) {
  withSeller(t, function(seller) {
    request()
      .send({seller_id: seller._id})
      .expect(409)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.code, 'MissingParameter');
        t.done();
      });
  });
}


exports.postOk = function(t) {
  withSeller(t, function(seller) {
    var external_id = uuid.v4();
    request()
      .send({seller_id: seller._id, external_id: external_id})
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.seller_id, seller._id);
        t.equal(res.body.external_id, external_id);
        t.done();
      });
  });
}


exports.postWrongSeller = function(t) {
  var nonExistant = uuid.v4();
  request()
    .send({seller_id: nonExistant, external_id: uuid.v4()})
    .expect(404)
    .end(function(err, res) {
      t.ifError(err);
      t.done();
    });
}
