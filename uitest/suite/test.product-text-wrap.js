var startCasper = require('../helpers').startCasper;

/*
 * Here we want to test that when the product and title are too long
 * the style doesn't cause product to be under the product_image.
 */

startCasper('/payment/confirm');
casper.test.begin('Product Text Wrapping', {

  test: function(test) {

    // Run the tests.
    var dataObj = casper.evaluate(function(){
      // Tell jshint we know $ is a global.
      /* globals $ */
      var LONG_PROD_STRING = 'Test AP (fkjsdhkfjhsdkjfhsdkjhfksdjhkjfdsh)';
      var LONG_AUTHOR_STRING = 'Some-really-long-string-that-shouldn\'t break this';
      // Inject some long strings.
      $('.product .title').text(LONG_PROD_STRING);
      $('.product .author').text(LONG_AUTHOR_STRING);

      var data = {};
      data.image_offset =  $('.product-image').offset().top;
      data.product_offset = $('.product').offset().top;
      return data;
    });

    test.assertEqual(dataObj.product_offset, dataObj.image_offset, 'Check image and product tops are aligned (e.g: not wrapped)');

    casper.run(function() {
      test.done();
    });
  },
});
