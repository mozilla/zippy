var assert = require('assert-plus');
var escape = require('escape-html');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');
var rootPath = fs.realpathSync(path.join(path.resolve(__dirname, '../')));

// Add contains to assert-plus.
if (typeof assert.contains === 'undefined') {
  assert.contains = function(needle, haystack, msg) {
    msg = msg || "Expected: " + haystack + " to contain " + needle;
    assert.ok(haystack.indexOf(needle) > -1, msg);
  };
} else {
  console.log('Awooga, contains is defined on assert object already!');
}


var serialize = function serialize(ob, resource_name) {
  // Cloning the original object to avoid a scope issue.
  ob = JSON.parse(JSON.stringify(ob));
  ob.resource_pk = ob._id;
  ob.resource_name = resource_name;
  ob.resource_uri = '/' + resource_name + '/' + ob._id;
  delete ob._id;
  return ob;
};


module.exports = {
  assert: assert,
  escape: escape,
  markSafe: nunjucks.runtime.markSafe,
  rootPath: rootPath,
  serialize: serialize,
};
