var assert = require('nodeunit').assert;
var escape = require('escape-html');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

var rootPath = fs.realpathSync(path.join(path.resolve(__dirname, '../')));

var serialize = function serialize(ob, resourceName) {
  // Cloning the original object to avoid a scope issue.
  /*jshint camelcase: false */
  ob = JSON.parse(JSON.stringify(ob));
  ob.resource_pk = ob._id;
  ob.resource_name = resourceName;
  ob.resource_uri = '/' + resourceName + '/' + ob._id;
  delete ob._id;
  return ob;
};

if (!assert.include) {
  assert.include = function include(haystack, needle, message) {
    if (haystack.indexOf(needle) === -1) {
      assert.fail(needle, haystack, message, 'was not found in');
    }
  };
}


if (!assert.notInclude) {
  assert.notInclude = function notInclude(haystack, needle, message) {
    if (haystack.indexOf(needle) > -1) {
      assert.fail(needle, haystack, message, 'was found in');
    }
  };
}


module.exports = {
  escape: escape,
  markSafe: nunjucks.runtime.markSafe,
  rootPath: rootPath,
  serialize: serialize,
};
