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
  sellers.models.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


exports.setUp = function(done) {
  sellers.models.deleteMany({}, done);
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
    var client = new Client('/sellers/' + seller._id);
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.uuid, seller.uuid);
        t.equal(res.body.resource_name, 'sellers');
        t.done();
      });
  });
};


exports.updateSellerThenGet = function(t) {
  withSeller(t, function(seller) {
    var client = new Client('/sellers/' + seller._id);
    var updatedName = 'Jack';
    client
      .put({
        uuid: seller.uuid,
        status: seller.status,
        name: updatedName,
        email: seller.email,
      })
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.uuid, seller.uuid);
        t.equal(res.body.name, updatedName);
        t.equal(res.body.email, seller.email);
        t.equal(res.body.resource_uri, '/sellers/' + res.body.resource_pk);
        client
          .get()
          .expect(200)
          .end(function(err, res) {
            t.ifError(err);
            t.equal(res.body.uuid, seller.uuid);
            t.equal(res.body.name, updatedName);
            t.equal(res.body.email, seller.email);
            t.equal(res.body.resource_uri, '/sellers/' + res.body.resource_pk);
            t.done();
          });
      });
  });
};


exports.updateSellerWithoutStatus = function(t) {
  withSeller(t, function(seller) {
    var client = new Client('/sellers/' + seller._id);
    var updatedName = 'Jack';
    client
      .put({
        uuid: seller.uuid,
        name: updatedName,
      })
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.uuid, seller.uuid);
        t.equal(res.body.name, updatedName);
        t.equal(res.body.status, seller.status);
        t.done();
      });
  });
};


exports.deleteSeller = function(t) {
  withSeller(t, function(seller) {
    var client = new Client('/sellers/' + seller._id);
    client
      .del()
      .expect(204)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.retrieveSellerTerms = function(t) {
  withSeller(t, function(seller) {
    var client = new Client('/terms/' + seller._id);
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.terms, 'Terms for seller: ' + seller.name);
        t.done();
      });
  });
};


exports.updateSellerTerms = function(t) {
  withSeller(t, function(seller) {
    var client = new Client('/sellers/' + seller._id);
    var currentDate = new Date();
    client
      .put({
        terms_at: currentDate,
      })
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.uuid, seller.uuid);
        t.equal(Date(res.body.terms_at), currentDate);
        client = new Client('/terms/' + seller._id);
        client
          .get()
          .expect(200)
          .end(function(err, res) {
            t.ifError(err);
            t.equal(res.body.terms, 'Terms for seller: ' + seller.name);
            t.equal(Date(res.body.terms_at), currentDate);
            t.done();
          });
      });
  });
};


