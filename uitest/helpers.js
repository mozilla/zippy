var config = require('../lib/config');

// Use local config to override this if needed.
config.addOverrides('local');

var _currTestId;


function makeToken() {
  // Return a random ascii string.
  return Math.random().toString(36).slice(2);
}


casper.on('started', function() {
  _currTestId = makeToken();
  casper.echo('starting test');
});


casper.on('waitFor.timeout', function() {
  var file = 'uitest/captures/timeout-' + _currTestId + '.png';
  casper.echo('timeout screenshot at ' + file);
  casper.capture(file);
});


casper.test.on('fail', function() {
  var file = 'uitest/captures/fail-' + _currTestId + '.png';
  casper.echo('Failed test screenshot at ' + file);
  casper.capture(file);
});

if (config.showCasperClientConsole === true) {
  casper.on('remote.message', function(message) {
    casper.echo('client console: ' + message, 'INFO');
  });
}

exports.startCasper = function startCasper(path) {
  casper.start('http://localhost:' + config.uitestServerPort + path);
};
