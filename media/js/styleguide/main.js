require.config({
  paths: {
    styleguide: '../styleguide/styleguide',
    longtext: '../longtext',
    jquery: '../../lib/js/jquery/jquery',
    requirejs: '../../lib/js/requirejs/require',
    underscore: '../../lib/js/underscore/underscore'
  },
  shim: {
    'underscore': {
      exports: '_'
    }
  }
});


define('main', ['underscore', 'jquery', 'longtext', 'styleguide'], function(_) {
  var $doc = $(document);
  var $win = $(window);

  // Setup debounced resize custom event.
  $win.on('resize', _.debounce(function() { $doc.trigger('saferesize');}, 200));

  var $buttonContainer = $('.buttons');
  var $chkLongTextElms = $('.buttons .ltchk');

  // Check text for overflow on resize
  $doc.on('saferesize', function() {
    console.log('Resize fired');
    $chkLongTextElms.checkLongText($buttonContainer, true);
  });

  if ($chkLongTextElms.length) {
    $chkLongTextElms.checkLongText($buttonContainer, true);
  }
});
