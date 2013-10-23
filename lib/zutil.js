var assert = require('assert-plus');
var Q = require('q');
var restify = require('restify');


exports.requireParams = function(req, kw) {
  return Q.promise(function(resolve, reject) {
    assert.object(req, 'object');
    assert.object(kw, 'object');
    var ok = true;
    // {field_name: "error message when missing"}
    for (var k in kw) {
      var msg = kw[k];
      if (req.params[k] === undefined || req.params[k] === null ||
          (typeof req.params[k] === 'string' && req.params[k] === '')) {
        ok = false;
        reject(new restify.MissingParameterError(msg));
      }
    }
    if (ok) {
      resolve();
    }
  });
};
