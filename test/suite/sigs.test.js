var supertest = require('super-request');

var test = require('../');
var buildOAuthorizationHeader = require('../client').buildOAuthorizationHeader;

function testClient(origURL, overrideURL) {
  var method = 'GET';
  // For this test the request can be changed to be different
  // from the url used for the sig.
  var res = supertest(test.app)
    .get(overrideURL || origURL)
    .headers({
      'Accept': 'application/json',
      'Authorization': buildOAuthorizationHeader(method, origURL),
    });
  return res.json(true);
}

exports.testSig = function(t) {
  testClient('/sellers?foo=1')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      t.equal(res.statusCode, 200);
      t.done();
    });
};

exports.testSigModifiedURL = function(t) {
  testClient('/sellers?foo=1', '/sellers?foo=somethingelse')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      t.equal(res.statusCode, 401);
      t.done();
    });
};
