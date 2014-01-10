var Q = require('q');
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
  var props = under.extend({_id: uuid.v4(), status: 'ACTIVE'}, opt);
  sellers.models.create(props, function(err, seller) {
    t.ifError(err);
    cb(seller);
  });
}


function withProduct(t, opt, cb) {
  opt = opt || {};
  var props = under.extend({
    /*jshint camelcase: false */
    external_id: uuid.v4(),
    status: 'ACTIVE'
  }, opt);
  products.models.create(props, function(err, product) {
    t.ifError(err);
    cb(product);
  });
}


function makeTwoProducts(t, extIds) {
  var defer = Q.defer();

  withSeller(t, function(seller) {
    withProduct(t, {
      /*jshint camelcase: false */
      seller_id: seller._id,
      external_id: extIds.pop(),
      name: 'x',
    }, function(product1) {
      withProduct(t, {
        /*jshint camelcase: false */
        seller_id: seller._id,
        external_id: extIds.pop(),
        name: 'x',
      }, function(product2) {
        defer.resolve({
          products: [product1, product2],
          seller: seller,
        });
      });
    });
  });

  return defer.promise;
}


function makeTwoSellers(t, extIds) {
  var defer = Q.defer();
  var seller1;
  var seller2;

  makeTwoProducts(t, extIds)
    .then(function(result1) {
      seller1 = result1.seller;
      return makeTwoProducts(t, extIds);
    })
    .then(function(result2) {
      seller2 = result2.seller;
    })
    .then(function() {
      defer.resolve([seller1, seller2]);
    })
    .fail(function(err) {
      defer.reject(err);
    });

  return defer.promise;
}


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
  withSeller(t, function(seller) {
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
  withSeller(t, function(seller) {
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
  withSeller(t, function(seller) {
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
  withSeller(t, function(seller) {
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
  withSeller(t, function(seller) {
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
  withSeller(t, function(seller) {
    withProduct(t, {
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

  withSeller(t, function(seller1) {
    withProduct(t, {
      /*jshint camelcase: false */
      seller_id: seller1._id,
      external_id: extId,
      name: 'x',
    }, function() {
      withSeller(t, function(seller2) {
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
  withSeller(t, function(seller) {
    withProduct(t, {
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


exports.listAllProducts = function(t) {
  makeTwoProducts(t, ['one', 'two'])
    .then(function() {
      var extIds = [];
      client
        .get()
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          res.body.forEach(function(ob) {
            /*jshint camelcase: false */
            extIds.push(ob.external_id);
          });
          extIds.sort();
          t.equal(extIds[0], 'one');
          t.equal(extIds[1], 'two');
          t.done();
        });
    })
    .fail(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.filterProductsByExtId = function(t) {
  makeTwoProducts(t, ['one', 'two'])
    .then(function() {
      client
        .get({
          /*jshint camelcase: false */
          external_id: 'one',
        })
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body[0].external_id, 'one');
          t.equal(res.body.length, 1);
          t.done();
        });
    })
    .fail(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.filterProductsBySeller = function(t) {
  makeTwoSellers(t, ['one', 'two'])
    .then(function(sellersResult) {
      client
        .get({
          /*jshint camelcase: false */
          external_id: 'one',
          seller_id: sellersResult[0].resource_pk,
        })
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.length, 1);
          t.equal(res.body[0].external_id, 'one');
          t.equal(res.body[0].seller_id, sellersResult[0]._id);
          t.done();
        });
    })
    .fail(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.filterByWrongSeller = function(t) {
  makeTwoProducts(t, ['one', 'two'])
    .then(function() {
      client
        .get({
          /*jshint camelcase: false */
          seller_id: 'invalid',
          external_id: 'one',
        })
        .expect(404)
        .end(function(err) {
          t.ifError(err);
          t.done();
        });
    })
    .fail(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.wrongParamIsError = function(t) {
  client
    .get({badParam: 'nope'})
    .expect(409)
    .end(function(err) {
      t.ifError(err);
      t.done();
    });
};
