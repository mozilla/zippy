var assert = require('assert-plus');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

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
  rootPath: rootPath,
  templateEnv: env,
};
