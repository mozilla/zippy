define('cc', ['jquery', 'formatter'], function($) {

  $('#cc-num').formatter({
    'pattern': '{{9999}} {{9999}} {{9999}} {{9999}}'
  });

  $('#expiry').formatter({
    'pattern': '{{99}}/{{99}}'
  });

});
