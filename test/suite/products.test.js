var uuid = require('node-uuid');

var Client = require('../client').Client;
var AnonymousClient = require('../client').AnonymousClient;
var helpers = require('../helpers');
var products = require('../../lib/products');

var client = new Client('/products');
var anonymousClient = new AnonymousClient('/products');


exports.setUp = function(done) {
  products.models.deleteMany({}, done);
};


exports.createWithoutSeller = function(t) {
  client
    .post({
      /*jshint camelcase: false */
      external_id: uuid.v4(),
      name: 'x',
    })
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.error.name, 'InvalidArgumentError');
      t.done();
    });
};


exports.createWithoutExternalId = function(t) {
  helpers.withSeller({}, function(seller) {
    client
      .post({
        /*jshint camelcase: false */
        seller_id: seller._id,
        name: 'x',
      })
      .expect(409)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.error.name, 'InvalidArgumentError');
        t.done();
      });
  });
};


exports.createProductOk = function(t) {
  helpers.withSeller({}, function(seller) {
    /*jshint camelcase: false */
    var external_id = uuid.v4();
    client
      .post({
        /*jshint camelcase: false */
        seller_id: seller._id,
        external_id: external_id,
        name: 'x',
      })
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
  helpers.withSeller({}, function(seller) {
    /*jshint camelcase: false */
    var external_id = uuid.v4();
    client
      .post({
        /*jshint camelcase: false */
        seller_id: seller._id,
        external_id: external_id,
      })
      .expect(409)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.createAnonymousSeller = function(t) {
  helpers.withSeller({}, function(seller) {
    /*jshint camelcase: false */
    var external_id = uuid.v4();
    anonymousClient
      .post({
        /*jshint camelcase: false */
        seller_id: seller._id,
        external_id: external_id,
        name: 'x',
      })
      .expect(401)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.error.name, 'InvalidCredentialsError');
        t.done();
      });
  });
};


exports.createWrongSeller = function(t) {
  var nonExistant = uuid.v4();
  client
    .post({
      /*jshint camelcase: false */
      seller_id: nonExistant,
      external_id: uuid.v4(),
      name: 'x',
    })
    .expect(409)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.createInactiveSeller = function(t) {
  var opt = {status: 'INACTIVE'};
  helpers.withSeller(opt, function(seller) {
    client
      .post({
        /*jshint camelcase: false */
        seller_id: seller._id,
        external_id: uuid.v4(),
        name: 'x',
      })
      .expect(409)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  }, opt);
};


exports.createDupeExternalId = function(t) {
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id,
      external_id: uuid.v4(),
      name: 'x',
    }, function(product) {
      client
        .post({
          /*jshint camelcase: false */
          seller_id: seller._id,
          external_id: product.external_id,
          name: 'x',
        })
        .expect(409)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.error.name, 'InvalidArgumentError');
          t.done();
        });
    });
  });
};


exports.externaIdUniquePerSeller = function(t) {
  // An external ID only has to be unique per seller.
  var extId = 'shared-product-id';

  helpers.withSeller({}, function(seller1) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller1._id,
      external_id: extId,
      name: 'x',
    }, function() {
      helpers.withSeller({}, function(seller2) {
        client
          .post({
            /*jshint camelcase: false */
            seller_id: seller2._id,
            external_id: extId,
            name: 'x',
          })
          .expect(201)
          .end(function(err) {
            t.ifError(err);
            t.done();
          });
      });
    });
  });
};


exports.retrieveProductByPk = function(t) {
  helpers.withSeller({}, function(seller) {
    helpers.withProduct({
      /*jshint camelcase: false */
      seller_id: seller._id,
      external_id: uuid.v4(),
      name: 'x',
    }, function(product) {
      client
        .get(product._id)
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.resource_pk, product._id);
          t.done();
        });
    });
  });
};


exports.retrieveNoProduct = function(t) {
  client
    .get(777)  // non-existant ID
    .expect(404)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};
