var nodeunit = require('nodeunit');
var test = require('./');
process.chdir(__dirname);

module.exports = function(opt) {
  opt = opt || {onStop: null, reporter: 'default'};
  var testSuite = opt.testSuite;
  var testName = opt.testName;
  var reporter = nodeunit.reporters[opt.reporter];
  var suite = (testSuite === undefined) ? 'suite/' : 'suite/'+testSuite+'.test.js';
  var options = {
    assertion_prefix: '\u001B[35m',
    assertion_suffix: '\u001B[39m',
    bold_prefix: '\u001B[1m',
    bold_suffix: '\u001B[22m',
    error_prefix: '\u001B[31m',
    error_suffix: '\u001B[39m',
    ok_prefix: '\u001B[32m',
    ok_suffix: '\u001B[39m',
    testspec: testName,
  };
  test.start(function() {
    reporter.run([suite], options, function() {
      if (opt.onStop) {
        opt.onStop();
      }
    });
  });
};

if (!module.parent) {
  // Running as the main script.
  module.exports();
}
