var supertest = require('supertest');

var test = require('../');
var notices = require('../../lib/notices');


function post(qs) {
  return supertest(test.app)
    .post('/notices/')
    .send(qs)
    .set('Accept', 'application/json');
}


exports.testCheckValidQuery = function(t) {
  notices.signedQs({foo: 'bar', baz: 'ozo'})
    .then(function(qs) {
      post({qs: qs})
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.result, 'OK');
          t.equal(res.body.reason, '');
          t.done();
        });
    })
    .fail(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.testMissingQs = function(t) {
  post({})
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'MissingParameter');
      t.done();
    });
};


exports.testMissingSignature = function(t) {
  post({qs: 'foo=1&bar=2'})  // no signature
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.testWrongSignature = function(t) {
  post({qs: 'foo=1&bar=2&sig=0:nope'})
    .expect(200)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.result, 'FAIL');
      t.equal(res.body.reason, 'signature mismatch');
      t.done();
    });
};


exports.testTamperedQuery = function(t) {
  notices.signedQs({foo: 'bar', baz: 'ozo'})
    .then(function(qs) {
      post({qs: qs + 'garbage'})
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.result, 'FAIL');
          t.equal(res.body.reason, 'signature mismatch');
          t.done();
        });
    })
    .fail(function(err) {
      t.ifError(err);
      t.done();
    });
};


exports.testGetSpecificKey = function(t) {
  var keystore = notices.getKey({id: 2, keys: {2: 'the key'}});
  t.equal(keystore.id, 2);
  t.equal(keystore.key, 'the key');
  t.done();
};


exports.testGetLatestKey = function(t) {
  var keystore = notices.getKey({
    keys: {
      7: 'seventh',
      10: 'tenth',
      0: 'first',
    }
  });
  t.equal(keystore.id, 10);
  t.equal(keystore.key, 'tenth');
  t.done();
};


exports.testMisconfiguredKeys = function(t) {
  t.throws(function() {
    notices.getKey({keys: {}});
  }, 'Error');
  t.done();
};
