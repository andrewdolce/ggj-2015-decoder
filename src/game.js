(function() {

  // Set up State enum
  var states = [
    'Uninitialized',
    'PlayerSetup',
    'ShowScenarioChoices',
    'PreTurn',
    'MidTurn',
    'PostTurn',
    'OpinionPhase',
    'VotingPhase',
    'FinalChoice',
    'GameEnd'
  ];

  var State = {};
  for (var i = 0; i < states.length; i++) {
    var stateName = states[ i ];
    State[ stateName ] = stateName;
  }

  var Game = Backbone.Model.extend({
    type: 'Game',

    defaults: {
      players: [],
      numberOfTurns: 0,
      currentTurn: -1,
      scenarioId: -1,
      scenario: undefined,
      cardsOnBoard: [],
      state: State.Uninitialized,
      shouldShowPostTurn: true,
      finalChoice: 0
    },

    constructor: function() {
      Backbone.Model.apply(this, arguments);

      this.loaded = new $.Deferred();

      var self = this;
      $.getJSON('data/scenarios.json', function(data) {
        self.scenarioDB = data;
        self.loaded.resolve(self);
      });
    },

    // Accessors
    currentPlayer: function() {
      var turn = this.get('currentTurn');
      var players = this.get('players');
      var currentPlayerIndex = turn % players.length;
      return players[ currentPlayerIndex ];
    },

    currentSentence: function() {
      var cards = this.get('cardsOnBoard');
      return cards
        .map(function(card) {
          return card.get('text');
        })
        .join(' ');
    },

    numberOfTurnsLeft: function() {
      return this.get('numberOfTurns') - this.get('currentTurn');
    },

    numberOfRounds: function() {
      var numberOfPlayers = this.get('players').length;
      if (numberOfPlayers > 0) {
        return this.get('numberOfTurns') / numberOfPlayers;
      }
      return 0;
    },

    currentRound: function() {
      var numberOfPlayers = this.get('players').length;
      if (numberOfPlayers > 0) {
        return ((this.get('currentTurn') / numberOfPlayers) | 0) + 1;
      }
      return 0;
    },

    // State changes
    beginPlayerSetup: function() {
      this.set('state', Game.State.PlayerSetup);
    },

    finishPlayerSetup: function(numberOfPlayers) {
      var scenarioId = this.get('scenarioId');
      if (scenarioId === -1) {
        scenarioId = (Math.random() * this.scenarioDB.length) | 0;
      }

      var scenario = new Scenario(this.scenarioDB[scenarioId]);
      var numCards = scenario.get('cards').length;
      var numberOfRounds = Math.max((numCards / numberOfPlayers * 0.65) | 0, 1);
      var numberOfTurns = numberOfRounds * numberOfPlayers;
      var cardGroups = scenario.generateCardGroups(numberOfPlayers);

      var players = [];
      for (var i = 0; i < numberOfPlayers; i++) {
        var player = new Player({
          identifier: i
        });
        player.addCardsToHand(cardGroups[i]);
        players.push(player);
      }

      this.set({
        numberOfTurns: numberOfTurns,
        players: players,
        scenario: scenario
      });

      this.set('state', Game.State.ShowScenarioChoices);
    },

    beginNextTurn: function() {
      var turn = this.get('currentTurn') + 1;
      this.set('currentTurn', turn);

      if (!turn) {
        this.beginPreTurn();
      } else if (turn < this.get('numberOfTurns')) {
        if (this.get('shouldShowPostTurn')) {
          this.beginPostTurn();
        } else {
          this.beginPreTurn();
        }
      } else {
        // this.beginOpinionPhase();
        this.beginFinalChoice();
      }
    },

    beginPreTurn: function() {
      this.set('state', Game.State.PreTurn);
    },

    beginMidTurn: function() {
      // Not sure that we need anything else here
      this.set('state', Game.State.MidTurn);
    },

    beginPostTurn: function() {
      this.set('state', Game.State.PostTurn);
    },

    finalizeTurn: function(sharedCard, cardsOnBoard) {
      var player = this.currentPlayer();
      player.playCardFromHand(sharedCard);
      this.set('cardsOnBoard', cardsOnBoard);
      this.beginNextTurn();
    },

    beginOpinionPhase: function() {
      this.set('state', Game.State.OpinionPhase);
    },

    beginVotingPhase: function() {
      this.set('state', Game.State.VotingPhase);
    },

    beginFinalChoice: function() {
      this.set('state', Game.State.FinalChoice);
    },

    lockInDecision: function(choice) {
      this.set('finalChoice', choice);
      this.set('state', Game.State.GameEnd);
    }
  });

  Game.State = State;
  window.Game = Game;
}());
