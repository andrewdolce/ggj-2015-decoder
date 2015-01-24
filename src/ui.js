(function() {
  var UI = function(game) {
    this.game = game;
    this.$decks = null;
    this.$deckRoots = null;
    this.$preturn  = $('#dc-preturn');
    this.$midturn  = $('#dc-midturn');
    this.$postturn = $('#dc-postturn');
    this.cardViews = [];

    this._initDecks();
    this._init();

    this.$deckRoots.sortable({
      connectWith: '.dc-deck-root',
      scroll: false,
      revert: 300
    }).disableSelection();
  };

  UI.RETARGET_ROOT_ELEMENT = UI.prototype.RETARGET_ROOT_ELEMENT = 'ol';

  UI.prototype._initDecks = function() {
    this.$decks = $('.dc-deck-container');
    this.$decks.each(function() {
      var retargetRootElement = UI.RETARGET_ROOT_ELEMENT + ':first-of-type';
      var $retargetRoot = $(this).find(retargetRootElement);
      if (!$retargetRoot.length) {
        $retargetRoot = $('<' + UI.RETARGET_ROOT_ELEMENT + '>')
          .appendTo(this);
      }

      $retargetRoot
        .addClass('dc-deck-root')

        // Clean out extraneous text nodes.
        .contents()
        .filter(function() {
          return this.nodeType === 3; // TEXT_NODE
        })
        .remove();

      this.$__retargetRoot = $retargetRoot;
    });
    this.$deckRoots = $('.dc-deck-root');
    this.$playerDecks = $('.dc-player-hand');
  };

  UI.prototype._init = function() {
    this.game.on('change:state', function(game, state) {
      if (state === Game.State.ShowScenarioChoices) {
        this._initPlayers();
        this._initCards();
      }
    }, this);
    this.game.on('change:state', this.syncCards, this);
    this.game.on('change:state', this.transitionViews, this);
  };

  UI.prototype._initPlayers = (function() {
    var source = $('#player-hand-template').html();
    var template = Handlebars.compile(source);

    return function() {
      this.$playerDecks.remove();
      this.game.get('players').forEach(function(player) {
        $(template(player.attributes)).appendTo(this.$midturn);
      }, this);
      this._initDecks();
    };
  }());

  UI.prototype._initCards = function() {
    this.game
      .get('scenario')
      .get('cards')
      .forEach(this.addCard.bind(this));
  };

  UI.prototype.syncCards = function() {
    this.cardViews.forEach(function forEachCardView(cardView) {
      cardView.render().appendToOwner();
    });
  };

  UI.prototype.addCard = function(model) {
    this.cardViews.push(new CardView({
      model: model
    }));
  };

  UI.prototype.transitionViews = (function() {
    var preturnSource = $('#game-preturn-template').html();
    var preturnTemplate = Handlebars.compile(preturnSource);

    return function(game, state) {
      var currentPlayer = game.currentPlayer();
      var currentPlayerId = -1;
      if (currentPlayer) {
        currentPlayerId = currentPlayer.get('identifier');
      }

      switch (state) {
      case Game.State.PreTurn:
        this.$preturn.html(preturnTemplate({
          playerNumber: currentPlayerId + 1
        }));
        this.$playerDecks.addClass('dc-inactive-player');
        break;
      case Game.State.MidTurn:
        $('#player-' + currentPlayerId).removeClass('dc-inactive-player');
        break;
      case Game.State.PostTurn:
        this.$playerDecks.addClass('dc-inactive-player');
        break;
      }
    };
  }());

  window.UI = UI;
}());
