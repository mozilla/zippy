var assert = require('assert-plus');
var Q = require('q');
var assert = require('assert-plus');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');
var restify = require('restify');

var requireParams = function(req, kw) {
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

// Add contains to assert-plus.
if (typeof assert.contains === 'undefined') {
  assert.contains = function(needle, haystack, msg) {
    msg = msg || "Expected: " + haystack + " to contain " + needle;
    assert.ok(haystack.indexOf(needle) > -1, msg);
  };
} else {
  console.log('Awooga, contains is defined on assert object already!');
}

var rootPath = fs.realpathSync(path.join(path.resolve(__dirname, '../')));
var templateLoaders = [
  new nunjucks.FileSystemLoader(path.join(rootPath, 'templates/styleguide/')),
  new nunjucks.FileSystemLoader(path.join(rootPath, 'templates/docs/')),
  new nunjucks.FileSystemLoader(path.join(rootPath, 'templates/'))
];
var env = new nunjucks.Environment(templateLoaders, { autoescape: true });

module.exports = {
  assert: assert,
  env: env,
  markSafe: nunjucks.runtime.markSafe,
  requireParams: requireParams,
  rootPath: rootPath,
  templateEnv: env,
};
