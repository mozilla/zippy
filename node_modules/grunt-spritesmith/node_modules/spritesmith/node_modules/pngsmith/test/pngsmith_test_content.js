var pngsmith = require('../'),
    expect = require('chai').expect,
    extend = require('obj-extend'),
    commonTest = require('spritesmith-engine-test');

// Override images with png variants
commonTest.config.multipleImages = commonTest.config.multiplePngImages;
commonTest.config.repeatingImage = commonTest.config.repeatingPngImage;

module.exports = extend({}, commonTest.content, {
  'pngsmith': function () {
    this.smith = pngsmith;

    var expectedDir = __dirname + '/expected_files/';
    this.expectedFilepaths = [
      expectedDir + '/multiple-node-0.8.png',
      expectedDir + '/multiple-node-0.10.png'
    ];
  }
});
