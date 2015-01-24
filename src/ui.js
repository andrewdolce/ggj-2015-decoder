(function() {
  var retargetRootElement = 'ol';
  var cardElement = 'li';
  var cardSelector = ['#hand', '#board'].map(function(idSelector) {
    return idSelector + ' ' + cardElement;
  }).join(', ');

  $(cardSelector)
    .addClass('dc-card');

  $('#hand, #board')
    .addClass('dc-deck-container')
    .each(function() {
      var retargetRootSelector = retargetRootElement + ':first-of-type';
      var $retargetRoot = $(this).find(retargetRootSelector);
      if (!$retargetRoot.length) {
        $retargetRoot = $('<' + retargetRootElement + '>')
          .appendTo(this);
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

  $('.dc-deck-root').sortable({
    connectWith: '.dc-deck-root',
    scroll: false,
    dropOnEmpty: true,
    revert: 300
  }).disableSelection();
}());
