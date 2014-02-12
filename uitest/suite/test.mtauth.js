var helpers = require('../helpers');

helpers.startCasper('/payment/confirm-mobile-number');

casper.test.begin('Mt Auth Page', {

  test: function(test) {

    helpers.testLongTextButtons(test);

    casper.run(function() {
      test.done();
    });
  },
});
