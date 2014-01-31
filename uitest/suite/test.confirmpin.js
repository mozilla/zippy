var helpers = require('../helpers');

helpers.startCasper('/payment/confirm-pin');

casper.test.begin('Confirm Pin Page', {

  test: function(test) {

    // Ensure the JS we are dependent on for these tests has loaded.
    casper.waitForResource(/longtext.js$/, function() {
      this.echo('Longtext has been loaded.', 'INFO');
    });

    helpers.testLongTextButtons(test);

    casper.run(function() {
      test.done();
    });
  },
});
