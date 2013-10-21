var assert = require('assert-plus');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

assert.contains = function(needle, haystack, msg) {
	msg = msg || "Expected: " + haystack + " to contain " + needle;
	assert.ok(haystack.indexOf(needle) > -1, msg);
};

module.exports = {
	assert: assert,
	rootPath: fs.realpathSync(path.join(path.resolve(__dirname, '../'))),
	markSafe: nunjucks.runtime.markSafe
};
