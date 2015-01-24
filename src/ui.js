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
    revert: 300
  }).disableSelection();

  var stripPunctuation = function(string) {
    return string.replace(/[,:;\-–.!]/g, '');
  };

  (function() {
    var card = new Card({
      text: 'Athens'
    });
    var cardView = new CardView({
      model: card
    });

    var game = new Game();
    var views = [];

    var cardModels = stripPunctuation('This is Sparta, not Athens!')
        .split(' ')
        .map(function(word) {
          var card = new Card({
            text: word,
            owner: 'board'
          });
          views.push(new CardView({
            model: card
          }));
          return card;
        });
    game.set('cardsOnBoard', cardModels);

    game.on('update_cards', function() {
      views.forEach(function(cardView) {
        cardView.render().appendToOwner();
      });
    });

    game.trigger('update_cards');

    window.game = game;
  }());
}());
