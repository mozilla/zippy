var under = require('underscore');
var uuid = require('node-uuid');

var Client = require('../client').Client;
var AnonymousClient = require('../client').AnonymousClient;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');

var client = new Client('/products');
var anonymousClient = new AnonymousClient('/products');


function withSeller(t, cb, opt) {
  opt = opt || {};
  var props = under.extend({uuid: uuid.v4(), status: 'ACTIVE'}, opt);
  sellers.models.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


function withProduct(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({external_id: uuid.v4(), status: 'ACTIVE'}, opt);
  products.models.create(props, function(err, product) {
    t.ifError(err);
    cb(product);
  });
}


exports.setUp = function(done) {
  products.models.deleteMany({}, done);
};


exports.createWithoutSeller = function(t) {
  client
    .post({external_id: uuid.v4(), name: 'x'})
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.createWithoutExternalId = function(t) {
  withSeller(t, function(seller) {
    client
      .post({seller_id: seller._id, name: 'x'})
      .expect(409)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.code, 'InvalidArgument');
        t.done();
      });
  });
};


exports.createProductOk = function(t) {
  withSeller(t, function(seller) {
    var external_id = uuid.v4();
    client
      .post({seller_id: seller._id, external_id: external_id, name: 'x'})
      .expect(201)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.seller_id, seller._id);
        t.equal(res.body.external_id, external_id);
        t.done();
      });
  });
};


exports.createWithoutName = function(t) {
  withSeller(t, function(seller) {
    var external_id = uuid.v4();
    client
      .post({seller_id: seller._id, external_id: external_id})
      .expect(409)
      .end(function(err, res) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.createAnonymousSeller = function(t) {
  withSeller(t, function(seller) {
    var external_id = uuid.v4();
    anonymousClient
      .post({seller_id: seller._id, external_id: external_id, name: 'x'})
      .expect(401)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.code, 'InvalidCredentials');
        t.done();
      });
  });
};


exports.createWrongSeller = function(t) {
  var nonExistant = uuid.v4();
  client
    .post({seller_id: nonExistant, external_id: uuid.v4(), name: 'x'})
    .expect(409)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.createInactiveSeller = function(t) {
  var opt = {status: 'INACTIVE'};
  withSeller(t, function(seller) {
    client
      .post({seller_id: seller._id, external_id: uuid.v4(), name: 'x'})
      .expect(409)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  }, opt);
};


exports.createDupeExternalId = function(t) {
  withSeller(t, function(seller) {
    withProduct(t, {
      seller_id: seller._id,
      external_id: uuid.v4(),
      name: 'x',
    }, function(product) {
      client
        .post({
          seller_id: seller._id,
          external_id: product.external_id,
          name: 'x',
        })
        .expect(409)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.code, 'InvalidArgument');
          t.done();
        });
    });
  });
};


exports.externaIdUniquePerSeller = function(t) {
  // An external ID only has to be unique per seller.
  var extId = 'shared-product-id';

  withSeller(t, function(seller1) {
    withProduct(t, {
      seller_id: seller1._id,
      external_id: extId,
      name: 'x',
    }, function(product1) {
      withSeller(t, function(seller2) {
        client
          .post({
            seller_id: seller2._id,
            external_id: extId,
            name: 'x',
          })
          .expect(201)
          .end(function(err, res) {
            t.ifError(err);
            t.done();
          });
      });
    })
  });
};
