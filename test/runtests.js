var reporter = require('nodeunit').reporters.default;
var test = require('./');
process.chdir(__dirname);

test.start(function() {
  reporter.run(['suite'], undefined, function() {
    test.stop();
  });
});
