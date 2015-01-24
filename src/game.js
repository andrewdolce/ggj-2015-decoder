(function() {

  // Set up State enum
  var states = [ "Uninitialized",
                 "PlayerSetup",
                 "ShowScenarioChoices",
                 "PreTurn",
                 "MidTurn",
                 "PostTurn",
                 "OpinionPhase",
                 "VotingPhase",
                 "FinalChoice",
                 "GameEnd"
               ];

  var State = {};
  for (var i = 0; i < states.length; i++) {
    var stateName = states[ i ];
    State[ stateName ] = stateName;
  }

  var Game = Backbone.Model.extend({
    type: "Game",

    defaults: {
      "players": [],
      "numberOfTurns": 0,
      "currentTurn": -1,
      "scenario": undefined,
      "cardsOnBoard": [],
      "state": State.Uninitialized
    },

    // Accessors
    currentPlayer: function() {
      var turn = this.get( "currentTurn" );
      var players = this.get( "players" );
      var currentPlayerIndex = turn % players.length;
      return players[ currentPlayerIndex ];
    },

    beginPlayerSetup: function() {
      this.set( "state", Game.State.PlayerSetup );
    },

    finishPlayerSetup: function( numberOfPlayers ) {
      var numberOfTurns = numberOfPlayers * 3; // Decide how we determine this

      var scenario = new Scenario();
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

      this.set( "state", Game.State.ShowScenarioChoices );
    },

    beginNextTurn: function() {
      var turn = this.get( "currentTurn" ) + 1;
      this.set( "currentTurn", turn );

      if ( turn < this.get( "numberOfTurns" )) {
        this.beginPreTurn();
      } else {
        this.beginOpinionPhase();
      }
    },

    beginPreTurn: function() {
      this.set( "state", Game.State.PreTurn );
    },

    beginMidTurn: function() {
      // Not sure that we need anything else here
      this.set( "state", Game.State.MidTurn );
    },

    beginPostTurn: function( sharedCard, cardsOnBoard ) {
      var player = this.currentPlayer();
      player.playCardFromHand( sharedCard );
      this.set( "cardsOnBoard", cardsOnBoard );
      this.set( "state", Game.State.PostTurn );
    },

    beginOpinionPhase: function() {
      this.set( "state", Game.State.OpinionPhase );
    },

    beginVotingPhase: function() {
      this.set( "state", Game.State.VotingPhase );
    },

    beginFinalChoice: function() {
      this.set( "state", Game.State.FinalChoice );
    },

    lockInDecision: function( choice ) {
      this.set( "state", Game.State.GameEnd );
    }
  });

  Game.State = State;
  window.Game = Game;
}());
