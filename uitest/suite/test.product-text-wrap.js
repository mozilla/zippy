var startCasper = require('../helpers').startCasper;

/*
 * Here we want to test that when the product and title are too long
 * the style doesn't cause product to be under the product_image.
 */

startCasper('/payment/confirm');
casper.test.begin('Product Text Wrapping', {

  test: function(test) {

    casper.waitForSelector('.product .image', function() {
      // Run the tests.
      casper.evaluate(function(){
        // Tell jshint we know $ is a global.
        /* globals $ */
        var LONG_PROD_STRING = 'Test AP (fkjsdhkfjhsdkjfhsdkjhfksdjhkjfdsh)';
        var LONG_AUTHOR_STRING = 'some-really-long-string-that-shouldn\'t break this';
        // Inject some long strings.
        $('.product .title').text(LONG_PROD_STRING);
        $('.product .author').text(LONG_AUTHOR_STRING);
      });

    });

    casper.waitForSelectorTextChange('.product .title', function() {
      var dataObj = casper.evaluate(function(){
        return {
          product_offset: $('.product .meta').offset().top,
          image_offset: $('.product .image').offset().top,
        };
      });
      test.assertEqual(dataObj.product_offset, dataObj.image_offset, 'Check image and product tops are aligned (e.g: not wrapped)');
      var file = 'uitest/captures/wrapping.png';
      casper.capture(file);
    });

    casper.run(function() {
      test.done();
    });
  },
});
