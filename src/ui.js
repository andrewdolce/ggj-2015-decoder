(function() {
  var MidTurnController = function(ui, playerId) {
    this.ui = ui;
    this.$midturn = this.ui.$midturn;
    this.$playerDeck = $('#player-' + playerId);
    this.$continueButton = $('#midturn-button');
    this.$timer = $('#dc-midturn-timer')
      .show();

    this.$playerDeck
      .removeClass('dc-inactive-player')
      .find('.dc-card')
      .addClass('dc-active-card');

    this.disableButton();

    $('#decks-root').prepend($('#board'));

    this.durationMs = this.ui.game.midTurnTimeLimitMs;
    this.interval = 0;
  };

  MidTurnController.prototype.startTimer = function() {
    this.startTimeMs = Date.now();
    this.interval = setInterval(function() {
      var timeRemaining = this.timeRemaining();

      var choosingDone = new $.Deferred();
      var shuffleDone = new $.Deferred();

      if (!timeRemaining) {
        var shuffleBoard = false;
        if (this.$continueButton.attr('disabled')) {
          shuffleBoard = true;
          var $cards = this.$playerDeck.find('.dc-card');
          var $randomCard = $($cards.get((Math.random() * $cards.length) | 0));
          var offset = $randomCard.offset();
          $('#board').get(0).$__retargetRoot.append($randomCard);
          $randomCard
            .offset(offset)
            .animate({
              top: 0,
              left: 0,
            }, 300, 'linear', function() {
              setTimeout(function() {
                choosingDone.resolve();
              }, 500);
            });
          this.proposeCard($randomCard, this.$playerDeck.get(0));
          this.$continueButton.attr('disabled', true);
        } else {
          choosingDone.resolve();
        }

        choosingDone.then(function() {
          if (shuffleBoard) {
            console.warn('TODO: Maybe shuffle board?');
            shuffleDone.resolve();
          } else {
            shuffleDone.resolve();
          }
        }.bind(this));

        shuffleDone.then(function() {
          this._confirmCard(this.$continueButton.__card);
        }.bind(this));

        clearInterval(this.interval);
      }

      var minutes = '' + ((timeRemaining / 1000 / 60) | 0);
      var seconds = '' + (((timeRemaining - minutes * 60) / 1000) | 0);
      while (minutes.length < 2)
        minutes = '0' + minutes;
      while (seconds.length < 2)
        seconds = '0' + seconds;
      this.$timer.text(minutes + ':' + seconds);
    }.bind(this), 10);
  };

  MidTurnController.prototype.timeRemaining = function() {
    return Math.max((this.startTimeMs + this.durationMs) - Date.now(), 0);
  };

  MidTurnController.prototype.enableButton = function(card) {
    this.$continueButton
      .attr('disabled', false)
      .text('Confirm')
      .on('click', this._confirmCard.bind(this, card));
    this.$continueButton.__card = card;
  };

  MidTurnController.prototype.disableButton = function() {
    return this.$continueButton
      .attr('disabled', true)
      .text('Drag a fragment up')
      .off('click');
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

      this.enableButton(card);
    }

    // Reject card if not an active card. That means we already
    // proposed a card in the board, and have not taken it back yet.
    else {
      $(sender).sortable('cancel');
    }
  };

  MidTurnController.prototype._confirmCard = function(card) {
    if (this.interval) {
      clearInterval(this.interval);
    }

    var game = this.ui.game;
    var order = [];
    $('#board .dc-card').each(function(index, el) {
      if (!$(el).hasClass('ui-sortable-placeholder')) {
        order.push(el.__cardView.model);
      }
    });
    game.finalizeTurn(card, order);
    this.ui.$decks.find('.dc-card').removeClass('dc-active-card');
    this.$continueButton.off('click');
    this.$timer.fadeOut(300);
    this.ui.midTurnController = null;
  },

  MidTurnController.prototype.returnCard = function($card, sender) {
    if ($card.hasClass('dc-active-card')) {
      $card.get(0).__cardView.returnToHand();
      this.ui.$playerDecks.find('.dc-card').each(function(index, el) {
        el.__cardView.unlockFromProposal();
      });
      this.disableButton();
    } else {
      $(sender).sortable('cancel');
    }
  };

  var UI = function(game) {
    this.game = game;
    this.midTurnController = null;
    this.$decks = null;
    this.$deckRoots = null;
    this.$initialprompt = $('#dc-initialprompt');
    this.$preturn  = $('#dc-preturn');
    this.$midturn  = $('#dc-midturn');
    this.$postturn = $('#dc-postturn');
    this.$finalchoice = $('#dc-finalchoice');
    this.$results = $('#dc-results');
    this.$screens = this.$preturn
      .add(this.$midturn)
      .add(this.$postturn)
      .add(this.$finalchoice)
      .add(this.$results);
    this.cardViews = [];

    this._initDecks();
    this._init();

    this.$currentScreen = this.$preturn;
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
          if (self.midTurnController) {
            self.midTurnController.proposeCard(ui.item, ui.sender);
          } else {
            $(ui.sender).sortable('cancel');
          }
        } else {
          self.midTurnController.returnCard(ui.item, ui.sender);
        }
      },

      sort: function(event, ui) {
        if (self.midTurnController) {
          if (!self.midTurnController.timeRemaining()) {
            $(ui.sender).sortable('cancel');
          }
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
    deferred.thenScreenEntered = new $.Deferred();
    var fadeInScreen = function() {
      deferred.resolve();
      if (this.game.get('state') !== Game.State.PostTurn) {
        this.syncCards();
      }
      this.$currentScreen = $(screen).fadeIn(300, function() {
        deferred.thenScreenEntered.resolve();
      });
    }.bind(this);

    if (this.$currentScreen) {
      this.$currentScreen.fadeOut(300, fadeInScreen);
    } else {
      fadeInScreen();
    }

    return deferred;
  };

  UI.prototype.transitionViews = (function() {
    var initialpromptSource = $('#game-initialprompt-template').html();
    var initialpromptTemplate = Handlebars.compile(initialpromptSource);

    var preturnSource = $('#game-preturn-template').html();
    var preturnTemplate = Handlebars.compile(preturnSource);

    var postturnSource = $('#game-postturn-template').html();
    var postturnTemplate = Handlebars.compile(postturnSource);

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
      case Game.State.ShowScenarioChoices:
        this.showScreen(this.$initialprompt).then(function() {
          this.$initialprompt.html(initialpromptTemplate({
            prompt: game.get('scenario').get('prompt'),
            rounds: game.numberOfRounds()
          }));
          $('#initialprompt-button').on('click', game.beginNextTurn.bind(game));
        }.bind(this));
        break;

      case Game.State.PreTurn:
        this.showScreen(this.$preturn).then(function() {
          this.$playerDecks.addClass('dc-inactive-player');

          var roundsMessage;
          var currentRound = game.currentRound();
          var numberOfRounds = game.numberOfRounds();
          if (currentRound < numberOfRounds) {
            roundsMessage = 'Round ' + currentRound + ' of ' + game.numberOfRounds();
          } else {
            roundsMessage = 'Last round!';
          }

          this.$preturn.html(preturnTemplate({
            roundsMessage: roundsMessage,
            currentSentence: game.currentSentence(),
            prompt: game.get('scenario').get('prompt'),
            playerNumber: currentPlayerId + 1
          }));
          $('#preturn-button').on('click', game.beginMidTurn.bind(game));
        }.bind(this));
        break;

      case Game.State.MidTurn:
        this.midTurnController = new MidTurnController(this, currentPlayerId);
        var screenExited = this.showScreen(this.$midturn);
        screenExited.thenScreenEntered.then(function() {
          this.midTurnController.startTimer();
        }.bind(this));
        break;

      case Game.State.PostTurn:
        this.showScreen(this.$postturn).then(function() {
          this.$postturn.html(postturnTemplate({
            prompt: game.get('scenario').get('prompt')
          }));
          this.$postturn.find('#post-turn-board-root').prepend($('#board'));
          this.$deckRoots.sortable('disable');
          $('#postturn-button').on('click', function() {
            this.$deckRoots.sortable('enable');
            game.beginPreTurn();
          }.bind(this));
        }.bind(this));
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
