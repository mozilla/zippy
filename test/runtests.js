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
  try {
    test.start(function() {
      reporter.run([suite], options, function(wasSuccessful) {
        if (opt.onStop) {
          opt.onStop(wasSuccessful);
        }
      });
    });
  } catch (err) {
    // Bubble the failure back up to grunt.
    // If you can figure out how to pipe this exception to grunt
    // then you can remove the logging.
    console.log('Error caught in', __filename, ':', err);
    if (opt.onStop) {
      opt.onStop(false);
    } else {
      // This doesn't seem to do anything but it should!
      throw err;
    }
  }
};

if (!module.parent) {
  // Running as the main script.
  module.exports();
}
