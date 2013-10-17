var assert = require('assert-plus');
var test = require('../');

var CLIENT = test.CLIENT;
var SERVER = test.SERVER;

exports.postWithoutSeller = function(t) {
  // Any ideas how to stop this from throwing the exception?
  // it throws MissingParameterError
  CLIENT.client.post('/products/', {}, function (err, req, res, obj) {
    t.ifError(err);
    t.equal(obj.code, 'MissingParameter');
    t.done();
  });
}
