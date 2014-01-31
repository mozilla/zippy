var config = require('../lib/config');
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


if (config.showClientConsole === true) {
  casper.on('remote.message', function(message) {
    casper.echo('client console: ' + message, 'INFO');
  });
}


exports.testLongTextButtons = function(test) {

  // A fairly basic test of longtext functionality.
  casper.waitForResource(/longtext.js$/, function() {
    casper.waitForSelector('.buttons', function then() {
      var oldText = casper.evaluate(function() {
        var firstButton = $('.buttons .button:first-child');
        var oldText = firstButton.text();
        // Grab button and add longtext to it.
        firstButton.text('Some really long text that should overflow');
        console.log('[casper] ' + firstButton.text());
        return oldText;
      });

      // Resize viewport to cause resize event to fire.
      casper.viewport(250, 400).then(function() {
        casper.waitForSelector('.buttons.longtext', function then() {
          test.assertExists('.buttons.longtext', 'Check longtext class is found on .buttons container');
          // Restore original button text.
          casper.evaluate(function(oldText) {
            $('.buttons .button:first-child').text(oldText);
          }, oldText);
          casper.echo('Restoring default VP (300x400)');
          casper.viewport(300, 400);
        });
      });
    });
  });
};

exports.startCasper = function startCasper(path) {
  casper.start('http://localhost:' + config.uitestServerPort + path);
};
