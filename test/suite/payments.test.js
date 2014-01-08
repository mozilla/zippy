var under = require('underscore');
var uuid = require('node-uuid');
var supertest = require('super-request');

var test = require('../');
var Client = require('../client').AnonymousClient;
var products = require('../../lib/products');
var sellers = require('../../lib/sellers');
var trans = require('../../lib/trans');

var client = new Client('/');


var transData = {
  product_id: undefined,
  region: 123,
  carrier: 'USA_TMOBILE',
  price: '0.99',
  currency: 'EUR',
  pay_method: 'OPERATOR',
  token: 'fake-token',
  status: 'STARTED',
  success_url: 'https://m.f.c/webpay/success',
  error_url: 'https://m.f.c/webpay/error',
  ext_transaction_id: 'webpay-xyz',
};

var newTransData = under.extend({}, transData, {
  token: 'a-different-token',
});


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
    .get('/?tx=' + transData.token)
    .expect(200)
    .end(function(err, res) {
      t.ifError(err);
    })
    .post('/payment/process')
    .followRedirect(false)
    .expect(301)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.headers.location,
              transData.success_url +
                '?ext_transaction_id=' + transData.ext_transaction_id);
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


function createTrans(done, params) {
  params = params || {};
  var t = {
    ifError: function(err) {
      if (err) {
        throw err;
      }
    }
  }
  withSeller({}, function(seller) {
    withProduct({seller_id: seller._id, active: false},
      function(product) {
        var data = under.extend(newTransData, {
          product_id: product._id,
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
