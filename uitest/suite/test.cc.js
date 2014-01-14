/*global casper */

casper.start('http://localhost:9999/payment/card');

casper.test.begin('CC Page', {

  test: function(test) {

    casper.waitFor(function check() {
      return this.visible('#cc-num');
    }, function then() {
      test.assertVisible('#cc-num', 'Check credit-card input is visible');
    }, function timeout() {
      test.fail('#cc-num element is not visible before timeout.');
    }, 10000);

    casper.run(function() {
      test.done();
    });
  },
});
