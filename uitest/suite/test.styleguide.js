var startCasper = require('../helpers').startCasper;

startCasper('/styleguide/two-buttons');

casper.test.begin('Styleguide', {

  test: function(test) {

    // Ensure the JS we are dependent on for these tests has loaded.
    casper.waitForResource(/styleguide.js$/, function() {
      this.echo('Styleguide has been loaded.', 'INFO');
    });

    // Run the tests.
    casper.waitForSelector('.toggle', function() {
      test.assertVisible('.toggle', 'Check toggle link is displayed');
      this.click('.toggle');
      test.assertVisible('.more', 'Check more text is shown.');
    });

    casper.run(function() {
      test.done();
    });
  },
});
