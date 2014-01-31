var helpers = require('../helpers');

helpers.startCasper('/payment/card');

casper.test.begin('CC Page', {

  test: function(test) {

    // Ensure the JS we are dependent on for these tests has loaded.
    casper.waitForResource(/jquery.formatter.js$/, function() {
      this.echo('Formatter has been loaded.', 'INFO');
    });

    // Run the tests.
    casper.waitForSelector('#cc-num', function then() {
      test.assertVisible('#cc-num', 'Check credit-card input is visible');
      this.sendKeys('#cc-num', '1111222233334444');
      test.assertField('cc-num', '1111 2222 3333 4444', 'check cc value is masked');
      this.sendKeys('#expiry', '1209');
      test.assertField('expiry', '12/09', 'Check expiry value is masked');
    });

    helpers.testLongTextButtons(test);

    casper.run(function() {
      test.done();
    });
  },
});
