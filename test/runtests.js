var nodeunit = require('nodeunit');
var test = require('./');
process.chdir(__dirname);

module.exports = function(opt) {
  opt = opt || {onStop: null, reporter: 'default'};
  var reporter = nodeunit.reporters[opt.reporter];
  test.start(function() {
    reporter.run(['suite'], undefined, function() {
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
