var helpers = require('../helpers');

helpers.startCasper('/styleguide/two-buttons-longtext');

casper.test.begin('Style guide longtext', {

  test: function(test) {

    // A fairly basic test of longtext functionality.
    casper.waitForResource(/main.js$/, function() {
      var file = 'uitest/captures/longtext.png';
      casper.capture(file);

      casper.waitForSelector('.buttons.longtext', function then() {
        // Button should have longtext class at this width.
        test.assertExists('.buttons.longtext', 'Check longtext class is found on .buttons container');

        // Resize viewport to cause resize event to fire.
        casper.viewport(1024, 800).then(function() {
          casper.waitForSelector('.buttons:not(.longtext)', function then() {
            test.assertDoesntExist('.buttons.longtext', 'Check longtext class is *not* found on .buttons container');
            casper.echo('Restoring default VP (300x400)');
            casper.viewport(300, 400);
          });
        });
      }, 10000);
    });

    casper.run(function() {
      test.done();
    });
  },
});
