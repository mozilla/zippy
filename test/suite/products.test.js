var assert = require('assert-plus');
var request = require('supertest');
var test = require('../');

var zippy = require('../../lib');


exports.postWithoutSeller = function(t) {
  request(test.app)
    .post('/products/')
    .send({})
    .set('Accept', 'application/json')
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.code, 'MissingParameter');
      t.done();
    });
}
