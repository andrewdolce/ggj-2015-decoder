(function() {
  $('#hand span, #board span').addClass('dc-card');
  $('#hand, #board')
    .addClass('dc-deck-container')
    .each(function() {
      var retargetRootSelector = 'p:first-of-type';
      var $retargetRoot = $(this).find(retargetRootSelector);
      if (!$retargetRoot.length) {
        $retargetRoot = $('<p>').appendTo(this);
      }
      $retargetRoot.addClass('dc-deck-root');
      this.$__retargetRoot = $retargetRoot;
    });

  // Clean out any extraneous text nodes between cards.
  $('.dc-deck-container .dc-deck-root')
    .contents()
    .filter(function() {
      return this.nodeType === 3; // TEXT_NODE
    })
    .remove();

  $('.dc-card').draggable({
    revert: true,
    revertDuration: 300
  });

  $('.dc-deck-container').droppable({
    accept: '.dc-card',
    drop: function(ev, ui) {
      ui.draggable
        .appendTo(this.$__retargetRoot)
        // Reposition in "local space" to match previous "world space" offset
        .offset(ui.offset);
    }
  });

}());
