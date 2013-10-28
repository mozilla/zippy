define('styleguide', ['jquery'], function($) {

  function toggle(e) {
    e.preventDefault();
    var $target = $(e.target);
    var data = $target.data();
    var oldText = $target.text();
    $(data.toggleSelector).toggle();
    $target.text(data.toggleText);
    $target.data('toggleText', oldText);
  }

  $(document).on('click', '.toggle', toggle);
});
