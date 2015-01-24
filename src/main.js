(function() {
  $('#hand span, #board span').addClass('dc-card');
  $('#hand, #board').addClass('dc-deck');

  $('.dc-card').draggable({
    revert: true,
    revertDuration: 300
  });

  $('.dc-deck').droppable({
    accept: '.dc-card',
    drop: function(ev, ui) {
      var $p = $(this).find('p:first-of-type');
      ui.draggable
        .appendTo($p)
        // Reposition in "local space" to match previous "world space" offset
        .offset(ui.offset);
    }
  });
}());
