var assert = require('nodeunit').assert;
var escape = require('escape-html');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

var rootPath = fs.realpathSync(path.join(path.resolve(__dirname, '../')));

var serialize = function serialize(ob, resourceName) {
  /*jshint camelcase: false */
  var id = ob.uuid || ob.external_id;
  ob.resource_pk = id;
  ob.resource_name = resourceName;
  ob.resource_uri = '/' + resourceName + '/' + id;
  return ob;
};

var handleError = function handleError(next) {
  return function handle(err) {
    console.log('Error:', err);  // fixme: bug 938352
    return next(err);
  };
};

if (!assert.include) {
  assert.include = function include(haystack, needle, message) {
    if (haystack.indexOf(needle) === -1) {
      assert.fail(needle, haystack, message, 'include');
    }
  };
}


if (!assert.notInclude) {
  assert.notInclude = function notInclude(haystack, needle, message) {
    if (haystack.indexOf(needle) > -1) {
      assert.fail(needle, haystack, message, 'notInclude');
    }
  };
}

if (!assert.dateCloseTo) {
  assert.dateCloseTo = function dateCloseTo(input, benchmark, maxDiffMilliseconds, message) {
    maxDiffMilliseconds = parseInt(maxDiffMilliseconds, 10) || 2000;
    if (!input.getTime || !input instanceof Date) {
      assert.fail(input, benchmark, 'input was not a Date object (or missing new operator)', 'dateCloseTo');
    }
    if (!benchmark.getTime || !benchmark instanceof Date) {
      assert.fail(input, benchmark, 'benchmark was not a Date object (or missing new operator)', 'dateCloseTo');
    }
    message =  message || 'difference between dates was greater than ' + maxDiffMilliseconds + 'ms (input: '+ input.getTime() +' benchmark: ' + benchmark.getTime() +')';
    var diff = Math.abs(benchmark.getTime() - input.getTime());
    assert.ok((diff <= maxDiffMilliseconds), message);
  };
}



module.exports = {
  escape: escape,
  markSafe: nunjucks.runtime.markSafe,
  rootPath: rootPath,
  serialize: serialize,
  handleError: handleError,
};
