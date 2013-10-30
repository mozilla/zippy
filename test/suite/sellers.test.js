var under = require('underscore');
var uuid = require('node-uuid');

var Client = require('../client').Client;
var sellers = require('../../lib/sellers');

var client = new Client('/sellers');


function withSeller(t, cb, opt) {
  opt = opt || {};
  var props = under.extend({
    uuid: uuid.v4(),
    status: 'ACTIVE',
    name: 'John',
    email: 'jdoe@example.org',
  }, opt);
  sellers.sellers.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


exports.setUp = function(done) {
  sellers.sellers.deleteMany({}, done);
};


exports.createSeller = function(t) {
  var seller = {
    uuid: uuid.v4(),
  };
  client
    .post({
      uuid: seller.uuid,
      status: 'ACTIVE',
      name: 'John',
      email: 'jdoe@example.org',
    })
    .expect(201)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.uuid, seller.uuid);
      t.done();
    });
};


exports.createSellerWithoutStatus = function(t) {
  client
    .post({
      uuid: uuid.v4(),
      name: 'John',
      email: 'jdoe@example.org',
    })
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.retrieveSellers = function(t) {
  withSeller(t, function(seller) {
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body[0].uuid, seller.uuid);
        t.done();
      });
  });
};


exports.retrieveSellersEmpty = function(t) {
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.length, 0);
      t.done();
    });
};


exports.retrieveSeller = function(t) {
  withSeller(t, function(seller) {
    var client = new Client('/sellers/' + seller.uuid);
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.uuid, seller.uuid);
        t.done();
      });
  });
};


