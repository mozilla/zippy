var Client = require('../client').Client;
var notices = require('../../lib/notices');

var client = new Client('/notices');
var constants = require('../../lib/constants');


exports.testCheckValidQuery = function(t) {
  notices.signedQs({foo: 'bar', baz: 'ozo'})
    .then(function(qs) {
      client
        .post({qs: qs})
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.result, constants.OK);
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
  client
    .post({})
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.testMissingSignature = function(t) {
  client
    .post({qs: 'foo=1&bar=2'})  // no signature
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'InvalidArgument');
      t.done();
    });
};


exports.testWrongSignature = function(t) {
  client
    .post({qs: 'foo=1&bar=2&sig=0:nope'})
    .expect(200)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.result, constants.FAIL);
      t.equal(res.body.reason, 'signature mismatch');
      t.done();
    });
};


exports.testTamperedQuery = function(t) {
  notices.signedQs({foo: 'bar', baz: 'ozo'})
    .then(function(qs) {
      client
        .post({qs: qs + 'garbage'})
        .expect(200)
        .end(function(err, res) {
          t.ifError(err);
          t.equal(res.body.result, constants.FAIL);
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
