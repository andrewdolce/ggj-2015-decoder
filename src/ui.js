(function() {
  var MidTurnController = function(ui, playerId) {
    this.ui = ui;
    this.$midturn = this.ui.$midturn;
    this.$playerDeck = $('#player-' + playerId);
    this.$continueButton = $('#midturn-button');

    this.$playerDeck
      .removeClass('dc-inactive-player')
      .find('.dc-card')
      .addClass('dc-active-card');

    this.$disableButton();

    $('#decks-root').prepend($('#board'));
  };

  MidTurnController.prototype.$enableButton = function() {
    return this.$continueButton
      .attr('disabled', false)
      .text('Confirm');
  };

  MidTurnController.prototype.$disableButton = function() {
    return this.$continueButton
      .attr('disabled', true)
      .text('Drag a fragment up');
  };

  // Put a card from hand into board. Has not confirmed yet.
  MidTurnController.prototype.proposeCard = function($card, sender) {
    if ($card.hasClass('dc-active-card')) {
      var cardView = $card.get(0).__cardView;
      cardView.propose();

      var card = cardView.model;
      this.ui.$playerDecks.find('.dc-card').each(function(index, el) {
        el.__cardView.lockFromProposal();
      });

      var self = this;
      this.$enableButton()
        .on('click', this._confirmCard.bind(this, card));
    }

    // Reject card if not an active card. That means we already
    // proposed a card in the board, and have not taken it back yet.
    else {
      $(sender).sortable('cancel');
    }
  };

  MidTurnController.prototype._confirmCard = function(card) {
    var game = this.ui.game;

    var order = [];
    $('#board .dc-card').each(function(index, el) {
      order.push(el.__cardView.model);
    });
    game.finalizeTurn(card, order);
    this.ui.$decks.find('.dc-card').removeClass('dc-active-card');
    this.$continueButton.off('click');
    this.ui.midTurnController = null;
  },

  MidTurnController.prototype.returnCard = function($card, sender) {
    if ($card.hasClass('dc-active-card')) {
      $card.get(0).__cardView.returnToHand();
      this.ui.$playerDecks.find('.dc-card').each(function(index, el) {
        el.__cardView.unlockFromProposal();
      });
      this.$disableButton().off('click');
    } else {
      $(sender).sortable('cancel');
    }
  };

  var UI = function(game) {
    this.game = game;
    this.midTurnController = null;
    this.$decks = null;
    this.$deckRoots = null;
    this.$preturn  = $('#dc-preturn');
    this.$midturn  = $('#dc-midturn');
    this.$finalchoice = $('#dc-finalchoice');
    this.$results = $('#dc-results');
    this.$screens = this.$preturn
      .add(this.$midturn)
      .add(this.$finalchoice)
      .add(this.$results);
    this.cardViews = [];

    this._initDecks();
    this._init();

    this.$screens.hide();
    this.$currentScreen = null;
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
    this.updateSortable();
  };

  UI.prototype.updateSortable = function() {
    var self = this;
    this.$deckRoots.sortable({
      connectWith: '.dc-deck-root',
      // items: '> li.dc-active-card',
      scroll: false,
      revert: 300,

      receive: function(event, ui) {
        var normalLabelClass = 'label-default';
        var disabledLabelClass = 'label-warning';

        if ($(this).parent().attr('id') == 'board') {
          self.midTurnController.proposeCard(ui.item, ui.sender);
        } else {
          self.midTurnController.returnCard(ui.item, ui.sender);
        }
      }
    }).disableSelection();
  };

  UI.prototype._init = function() {
    this.game.on('change:state', function(game, state) {
      if (state === Game.State.ShowScenarioChoices) {
        this._initPlayers();
        this._initCards();
      }
    }, this);
    this.game.on('change:state', this.transitionViews, this);
  };

  UI.prototype._initPlayers = (function() {
    var source = $('#player-hand-template').html();
    var template = Handlebars.compile(source);

    return function() {
      this.$playerDecks.remove();
      this.game.get('players').forEach(function(player) {
        $(template(player.attributes)).appendTo($('#decks-root'));
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
    var board = [];
    this.cardViews.forEach(function forEachCardView(cardView) {
      if (cardView.model.isInHand()) {
        cardView.render().appendToOwner();
      } else {
        board.push(cardView);
      }
    });

    var boardCards = this.game.get('cardsOnBoard');
    boardCards.forEach(function(card) {
      var cardView = board.filter(function(view) {
        return view.model === card;
      })[0];

      if (cardView) {
        cardView.render().appendToOwner();
      }
    });
  };

  UI.prototype.addCard = function(model) {
    this.cardViews.push(new CardView({
      model: model
    }));
  };

  UI.prototype.showScreen = function(screen) {
    var deferred = new $.Deferred();
    var fadeInScreen = function() {
      deferred.resolve();
      this.syncCards();
      this.$currentScreen = $(screen).fadeIn(300);
    }.bind(this);

    if (this.$currentScreen) {
      this.$currentScreen.fadeOut(300, fadeInScreen);
    } else {
      fadeInScreen();
    }

    return deferred;
  };

  UI.prototype.transitionViews = (function() {
    var preturnSource = $('#game-preturn-template').html();
    var preturnTemplate = Handlebars.compile(preturnSource);

    var finalchoiceSource = $('#game-finalchoice-template').html();
    var finalchoiceTemplate = Handlebars.compile(finalchoiceSource);

    var resultsSource =  $('#game-results-template').html();
    var resultsTemplate = Handlebars.compile(resultsSource);

    return function(game, state) {
      var currentPlayer = game.currentPlayer();
      var currentPlayerId = -1;
      if (currentPlayer) {
        currentPlayerId = currentPlayer.get('identifier');
      }

      switch (state) {
      case Game.State.PreTurn:
        this.showScreen(this.$preturn).then(function() {
          this.$playerDecks.addClass('dc-inactive-player');
        }.bind(this));

        var turnsLeftMessage;
        var turnsLeft = game.numberOfTurnsLeft();
        if (turnsLeft > 1) {
          turnsLeftMessage = 'You have ' + turnsLeft + ' turns left to decide.';
        } else {
          turnsLeftMessage = 'Last turn!';
        }

        this.$preturn.html(preturnTemplate({
          turnsLeftMessage: turnsLeftMessage,
          currentSentence: game.currentSentence(),
          prompt: game.get('scenario').get('prompt'),
          playerNumber: currentPlayerId + 1
        }));
        $('#preturn-button').on('click', game.beginMidTurn.bind(game));
        break;

      case Game.State.MidTurn:
        this.midTurnController = new MidTurnController(this, currentPlayerId);
        this.showScreen(this.$midturn);
        break;

      case Game.State.FinalChoice:
        var choices = game.get('scenario').get('choices');
        this.$finalchoice.html(finalchoiceTemplate({
          currentSentence: game.currentSentence(),
          choiceA: choices[0],
          choiceB: choices[1]
        }));
        $('#button-choice-a').on('click', game.lockInDecision.bind(game, 0));
        $('#button-choice-b').on('click', game.lockInDecision.bind(game, 1));
        this.showScreen(this.$finalchoice).then(function() {
          this.$deckRoots.sortable('disable');
          this.$finalchoice.prepend($('#board'));
        }.bind(this));
        break;

      case Game.State.GameEnd:
        var choice = game.get('finalChoice');
        this.$results.html(resultsTemplate({
          success: game.get('scenario').get('correctChoice') === choice,
          outcome: game.get('scenario').get('outcomes')[choice],
          expected: game.get('scenario').get('rawSentence'),
          actual: game.currentSentence()
        }));
        this.showScreen(this.$results);
        break;
      } // switch
    };
  }());

  window.UI = UI;
}());
