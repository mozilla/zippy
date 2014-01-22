define('styleguide', ['jquery'], function($) {

  /*
  Simple function to toggle demo content in the stylguide
  for checking that the styles handle more content.

  Create a link with the following attrs to control nearby content.

  data-toggle-text: The text to show when toggling.
  data-toggle-selector: The selectors to show/hide when clicked.
  class: Set this to 'toggle'.
  */

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

  console.log('Toggling initialised');

});
