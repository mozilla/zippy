var nodeunit = require('nodeunit');
var test = require('./');
process.chdir(__dirname);

module.exports = function(opt) {
  opt = opt || {onStop: null, reporter: 'default', testName: undefined};
  var reporter = nodeunit.reporters[opt.reporter];
  var suite = (opt.testName === undefined) ? 'suite' : 'suite/'+opt.testName+'.test.js';
  test.start(function() {
    reporter.run([suite], undefined, function() {
      test.stop();
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
