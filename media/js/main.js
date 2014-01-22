require.config({
  paths: {
    jquery: "../lib/js/jquery/jquery",
    requirejs: "../lib/js/requirejs/require",
    formatter: "../lib/js/formatter/jquery.formatter"
  },
  shim: {
    formatter: ["jquery"],
  }
});

define('main', ['cc'], function() {
  // load needed modules here.
});
