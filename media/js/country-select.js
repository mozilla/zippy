
define('country-select', ['jquery'], function($) {

  var select = $('#country');

  function getCurrentRegion() {
    return select.val().toLowerCase();
  }

  if (select.length) {
    console.log('initing country-select mask');
    var region = $('.region');
    var selectToggle = $('.select-toggle');
    var curRegion;

    selectToggle.on('click', function(e) {
      e.preventDefault();
    });

    select.on('change', function() {
      var val = getCurrentRegion();
      if (val !== curRegion) {
        region.removeClass(curRegion).addClass(val).toggleClass('redraw');
        curRegion = val;
        console.log('region changed');
        $('body').trigger('region.changed');
      }
    });

    select.on('focus', function() {
      select.addClass('show');
      curRegion = getCurrentRegion();
    });

    select.on('blur', function(){
      select.removeClass('show');
    });
  }

});


